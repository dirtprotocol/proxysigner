## ProxySigner

A ProxySigner is a utility that fetches and signs message from any API for the [DIRT Protocol Oracle](https://github.com/dirtprotocol/dirtoracle). 

This ProxySigner repo fetches data from cryptocurrency exchanges using the [Cryptocurrency Exchange Trading Library - CCXT](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets). There are two methods in `index.js`: 
* `signAndPackPrice` - signs the message using your [private key](#generate-private-key). Allows onchain verification that that the message came from an approved source using your public key.
* `fetchData` - pulls data from cryptocurrency exchanges using CCXT. Modify this section to fetch data from other sources. 

For more details on the role of the ProxySigner in the DIRT Oracle network, read the [protocol design](https://github.com/dirtprotocol/dirtoracle/blob/master/Protocol-Design.md).

## Generate public / private key

See the [web3 documentation](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-accounts.html#create) to generate an Ethereum public / private key pair. 
**Do NOT share your private key**

## Run Locally
### Edit environment variables

Create an `.env` file, and add three environment variables:  
```
WEB3_PROVIDER_URL=https://ropsten.infura.io/[YOUR ID]
SOURCE=YOUR SOURCE FROM CCXT
PROXY_SECRET_KEY=YOUR PRIVATE KEY
```

Run `source .env`

### Run Locally

* `yarn install`
* `env $(cat .env) node index.js`
* Navigate to `localhost:3000`

## Deployment 

**Deploy on [Google Cloud Functions](https://cloud.google.com/functions/)**
Enter the script in your root directory:
`gcloud functions deploy myproxysigner --source=. --env-vars-file=.env --trigger-http`

The command above assumes the `.env` file is in the root directory of the project. Omit `--trigger-http` on subsequent deployments. 

**Check Status**
After deploying the ProxySigner, run this command to check the
HTTPS URL of the ProxySigner:

`gcloud functions describe myproxysigner`

The ProxySigner accepts a query string parameter `pair` and will return the
current price for that market pair from the current SOURCE. For example,
you could use this URL to test your ProxySigner:

`https://[your proxysigner URL]?pair=ETH/USD`
