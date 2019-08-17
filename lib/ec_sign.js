const Web3 = require('web3')

const provider = new Web3.providers.HttpProvider(
  process.env.WEB3_PROVIDER_URL,
  'http://localhost:8545'
)
const web3 = new Web3(provider)


// The returned `messageHash` is equivalent to:
//  web3.sha3('\x19Ethereum Signed Message:\n32{dataHash}')
//
// The dataHash is equivlent to:
//  keccak256(abi.encodePacked(price, time, market))
function signAndPackPrice(price, timestamp, market) {
  let dataHash = web3.utils.soliditySha3(
    {t: 'uint256', v: price},
    {t: 'uint256', v: timestamp},
    {t: 'bytes32', v: web3.utils.toHex(market)
  })

  return web3.eth.accounts.sign(dataHash, process.env.PROXY_SECRET_KEY)
}

module.exports = {
  signAndPackPrice
}