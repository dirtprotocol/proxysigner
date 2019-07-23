const express = require('express')
const app = express()
const port = 3000

const fetch = require('node-fetch')

const EcSign = require('./lib/ec_sign')

app.get('/', async (req, res) => {
  const data = await fetchData(req.query)
  console.log(data)
  const signedData = EcSign.signAndPackPrice(
    data.price, 
    data.timestamp,
    data.market
  )
  res.send(Object.assign(data, signedData))
})

// This is specific to the source that is being proxied. Replace this with
// logic appropriate to your source.
async function fetchData(params) {
  const pair = params.pair
  const url = `https://api.kraken.com/0/public/Ticker?pair=${pair}`
  const ret = await fetch(url)
  const json = await ret.json()
  return {
    market: pair,
    price: json.result[pair].c[0],
    timestamp: new Date().getTime()
  }
}

app.listen(port, () => console.log(`App listening on port ${port}!`))