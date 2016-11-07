let Winston = require('winston');
let WinstonMongo = require('winston-mongodb').MongoDB;
require('winston-ovh');

/**
 * This class need a valid DB connexion
 * levels: error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 
 * @class Logger
 */
class Logger {

  constructor() {
    this.winston = new Winston.Logger({

      transports: [
        // Console Transport
        new Winston.transports.Console({
          name: "console",
          level: "debug",
          colorize: true,
          prettyPrint: true
        }),
        // Mongo Transport
        new WinstonMongo({
          name: 'mongo',
          level: 'info',
          db: process.env.PROXY_DB,
          collection: 'log',
          // Store hostname, for multiple instances
          storeHost: false,
          tryReconnect: true,
          decolorize: true
        })
      ]
    });

    if (process.env.PROXY_OVH_KEY !== undefined) {
      this.winston.add(Winston.transports.ovh, {
        token: process.env.PROXY_OVH_KEY
      });
    }
  }
  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
}
module.exports = Logger.getInstance().winston;