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

function signAndPackPrice(price, timestamp, market) {
  let dataHash = web3.utils.soliditySha3(
    {t: 'uint256', v: web3.utils.toWei(price)},
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
    timestamp: new Date().getTime()
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
