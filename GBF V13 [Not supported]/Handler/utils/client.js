const GBFClient = require('../handler/clienthandler');

class Client extends GBFClient {
    constructor(options) {
        super(options);
    }
}

module.exports = Client;
