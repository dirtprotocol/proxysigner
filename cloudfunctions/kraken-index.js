/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

const Web3 = require('web3')
const fetch = require('node-fetch')

const provider = new Web3.providers.HttpProvider(
  process.env.WEB3_PROVIDER_URL,
  'http://localhost:8545'
)
const web3 = new Web3(provider)

const metrics = require('opencensusz')
let account = web3.eth.accounts.privateKeyToAccount(process.env.PROXY_SECRET_KEY).address
const mStatus = new metrics.PushCounter('status', 'Report status', 'proxysigner', account, { source: 'kraken' })


function signAndPackPrice(price, timestamp, market) {
  let dataHash = web3.utils.soliditySha3(
    {t: 'uint256', v: price},
    {t: 'uint256', v: timestamp},
    {t: 'bytes32', v: web3.utils.asciiToHex(market)
  })

  return web3.eth.accounts.sign(dataHash, process.env.PROXY_SECRET_KEY)
}

async function fetchData(params) {
  const pair = params.pair
  const url = `https://api.kraken.com/0/public/Ticker?pair=XETHZUSD`
  const ret = await fetch(url)
  const json = await ret.json()
  return {
    market: 'ETH/USD',
    price: json.result[pair].c[0],
    price_wei: web3.utils.toWei(json.result[pair].c[0]),
    timestamp: new Date().getTime()
  }
}

async function main(req, res) {
  const data = await fetchData(req.query)
  const signedData = signAndPackPrice(
    data.price,
    data.timestamp,
    data.market
  )
  data.signature = signedData
  res.send(data)  
}

exports.main = async (req, res) => {
  try {
    await main(req, res)
    await mStatus.increment({ status: 'SUCCESS' })
  } catch(e) {
    await mStatus.increment({ status: 'TX_FAIL', error: e.toString() })
    throw e
  }
};
