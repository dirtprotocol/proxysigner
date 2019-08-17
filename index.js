/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

const Web3 = require('web3')
const Ccxt = require('ccxt')

const provider = new Web3.providers.HttpProvider(
  process.env.WEB3_PROVIDER_URL,
  'http://localhost:8545'
)
const web3 = new Web3(provider)


const metrics = require('opencensusz')
const cloudsecret = require('@dirt/cloudsecret')

let PROXY_SECRET_KEY = process.env.PROXY_SECRET_KEY

const mStatus = new metrics.PushCounter(
  'status', 'Report status', 'proxysigner', '', { source: process.env.SOURCE }
)
 
function signAndPackPrice(price, timestamp, market, key) {
  let dataHash = web3.utils.soliditySha3(
    { t: 'int128', v: price },
    { t: 'uint256', v: timestamp },
    {
      t: 'bytes32', v: web3.utils.toHex(market)
    })

  return web3.eth.accounts.sign(dataHash, key)
}

async function fetchData(marketPair) {
  const source = new Ccxt[process.env.SOURCE]()
  const ticker = await source.fetchTicker(marketPair)
  return {
    market: ticker.symbol,
    price: ticker.last.toString(),
    price_wei: web3.utils.toWei(ticker.last.toString()),
    timestamp: parseInt(ticker.timestamp / 1000)
  }
}

async function main(req, res) {
  const data = await fetchData(req.query.pair)
  const signedData = signAndPackPrice(
    data.price_wei,
    data.timestamp,
    data.market,
    PROXY_SECRET_KEY
  )
  data.signature = signedData
  res.send(data)
}

exports.main = async (req, res) => {
  PROXY_SECRET_KEY = PROXY_SECRET_KEY || await cloudsecret.LoadStringFromCloud('dirtoracle', process.env.SIGNER_KEY_NAME)
  let account = web3.eth.accounts.privateKeyToAccount(
    PROXY_SECRET_KEY
  ).address
  mStatus.setInstance(account)

  try {
    await main(req, res)
    mStatus.increment({ status: 'SUCCESS' })
  } catch (e) {
    mStatus.increment({ status: 'FAIL', error: e.toString() })
    throw e
  }
};
