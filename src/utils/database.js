const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const log = require('./logger');

/**
 * This class cannot use logger service
 * @params uri must be like "mongodb://USER:PASSWORD@HOST:PORT/DATABASE"
 * @class Db
 */
class Db {
  
  /**
   * Creates an instance of Db.
   * 
   * @param {any} [uri=null]
   * 
   * @constructor
   * @memberOf Db
   */
  constructor(uri = null) {
    this.uri = (uri === null) ? process.env.PROXY_DB : uri;
    mongoose.Promise = Promise;

    mongoose.connect(this.uri, {
      server: {
        auto_reconnect: true,
        socketOptions: {
          /*connectTimeoutMS: 2000,
          socketTimeoutMS: 5000*/
        }
      }
    });

    mongoose.connection.once('open', () => {
      log.info("connected to database");
    });
    /* mongoose.connection.on('error', err => {
      if (err) {
        console.log(err);
      }
    });*/

    this.models = {};
    this.loadModels();
  }

  /**
   * 
   * 
   * @memberOf Db
   */
  loadModels() {
    let models = fs.readdirSync(path.join(__dirname, "../models"));
    let name = "";
    for (let model of models) {
      // just keep filename
      name = model.slice(0, -1 * path.extname(model).length);
      name = name.charAt(0).toUpperCase() + name.slice(1);
      this.models[name] = require('../models/' + model);
    }
  }

  /**
   * 
   * 
   * @static
   * @returns
   * 
   * @memberOf Db
   */
  static getInstance() {
    if (!(Db.instance instanceof Db)) 
      Db.instance = new Db();
    return Db.instance;
  }
}

module.exports = Db.getInstance();

// EXEMPLES


// NEW ROUTE

// let tmpRoute = new (Db.getInstance().models.route)();
// tmpRoute.active = true;
// tmpRoute.subDomain = "test";
// tmpRoute.save((err) => {
//   console.log(err);
// });

// GET ROUTES

//  Db.getInstance().models.route.find((err, routes) => {
//    console.log(err);
//    console.log(routes);
//  });
