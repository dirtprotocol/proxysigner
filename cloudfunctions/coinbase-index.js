/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

const Web3 = require('web3')
const fetch = require('node-fetch')
const Ccxt = require('ccxt')
const coinbase = new Ccxt.coinbase()

const provider = new Web3.providers.HttpProvider(
  process.env.WEB3_PROVIDER_URL,
  'http://localhost:8545'
)
const web3 = new Web3(provider)

function signAndPackPrice(price, timestamp, market) {
  let dataHash = web3.utils.soliditySha3(
    {t: 'uint256', v: price},
    {t: 'uint256', v: timestamp},
    {t: 'bytes32', v: web3.utils.toHex(market)
  })

  return web3.eth.accounts.sign(dataHash, process.env.PROXY_SECRET_KEY)
}

async function fetchData(params) {
  const pair = params.pair
  const ticker = await coinbase.fetchTicker(pair)
  return {
    market: ticker.symbol,
    price: ticker.last.toString(),
    timestamp: ticker.timestamp * 1000
  }
}

exports.main = async (req, res) => {
  const data = await fetchData(req.query)
  const signedData = signAndPackPrice(
    data.price, 
    data.timestamp,
    data.market
  )
  res.send(Object.assign(data, signedData))
};
