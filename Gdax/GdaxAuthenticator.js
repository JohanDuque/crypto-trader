const privatekeys = require('../privateKeys.json');
//const privatekeys = require('../sandBoxPrivateKeys.json');//SANDBOX

class GdaxAuthenticator {
    constructor() {
        this.key = privatekeys.key;
        this.secret = privatekeys.secret;
        this.passphrase = privatekeys.passphrase;

        this.ETH_ACCOUNT_ID = privatekeys.ETH_ACCOUNT_ID;

        this.apiURI = 'https://api.gdax.com';
//        this.apiURI = 'https://api-public.sandbox.gdax.com'; //SANDBOX
    }
}

module.exports = Object.freeze(new GdaxAuthenticator());