const httpProxy = require('http-proxy');
const Db = require('./utils/database');
const Log = require('./utils/logger');

/**
 * 
 * 
 * @class Router
 */
class Router {

  /**
   * Creates an instance of Router.
   * 
   * @constructor
   */
  constructor() {
    // An array of Route model
    this.routes = [];
    // Initialise Routes
    this.loadRoutes();
    // Proxy Core
    this.proxy = httpProxy.createProxyServer({
      ws: true,
      // Donn't verify SSl certs
      secure: false,
      proxyTimeout: 300 // ms
    })
    .on('error', Log.error);
  }

  /**
   * Singleton
   * 
   * @static
   * @return {Router}
   * 
   * @memberOf Router
   */ 
  static getInstance() {
    if (!(Router.instance instanceof Router)) 
      Router.instance = new Router();
    return Router.instance;
  }

  /**
   * Load Routes from Mongo database
   * 
   * @memberOf Router
   */
  loadRoutes() {
    Db.models.Route.find(null, (err, routes) => {
      if (err) {
        Log.error(err);
      } else {
        this.routes = routes;
      }
    });
  }

  /**
   * Create a new Route Return a Promise
   * 
   * @param {Object} Object with Route attributes
   * @returns {Promise}
   * 
   * @memberOf Router
   */
  addRoute(obj) {
    return new Promise((resolve, reject) => {
      let tmp = new (Db.models.Route)(obj);
      tmp.save(err => {
        if (err) {
          Log.error('Failed to save new Route : ' + tmp.subDomain, obj);
          reject(err);
        } 
        else {
          this.routes.push(tmp);
          Log.debug("OK add new Route", tmp.toObject());
          resolve(tmp);
          this.loadRoutes();
        }
      });
    });
  }

  /**
   * Remove an existing route
   * 
   * @param {Route} route
   * @returns {Promise}
   * 
   * @memberOf Router
   */
  removeRoute(route) {
    return new Promise((resolve, reject) => {
      route.remove(err => {
        if (err) {
          Log.error("Fail to remove this Route", route.toObject());
          reject(err);
        } else {
          Log.debug("Route deleted", route.toObject());
          resolve(route);
          this.loadRoutes();
        }
      });
    });
  }

  /**
   * Modify an existing route
   * 
   * @param {Route} route
   * @returns {Promise}
   * 
   * @memberOf Router
   */
  editRoute(route) {
    return new Promise((resolve, reject) => { 
      route.save((err) => {
        if (err) {
          Log.error('Fail to update route', route.toObject());
          reject(err);
        } else {
          resolve(route);
        }
      });
    });
  }

  /**
   * HTTP Request handle to proxy response
   * Return an handler
   * @return {Function}
   * 
   * @memberOf Router
   */
  getProxyApp() {
    return (req, res) => {
      // detect subDomain
      let splited   = req.headers.host.split(/(\w+)\b/ig);
      let subDomain = splited[splited.length - 6];
      Log.debug(`Proxy request for ${subDomain}`);

      let route = this.findRouteByHost(subDomain);
      Log.debug(route);
      if (route === null) {
        res.writeHead(404, {'Content-Type': 'application/json'})
        return res.write(JSON.stringify({
          err: "Proxy don't know your route"
        }));
      }

      let target = `http${route.forwardSSL? 's': ''}://${route.destHost}:${route.destPort}`;
      Log.debug(target);
      this.proxy.web(req, res, { 
        target: target  
      }, (err) => {
        if (err) {
          Log.error(err);
          res.writeHead(500, {'Content-Type': 'application/json'})
          res.end(JSON.stringify({
            err: 'An error occured'
          }));
        } 
      });
    };
  }

  /**
   * Find a route with a unique ID
   * 
   * @param {Number} id
   * @return {Route}
   * 
   * @memberOf Router
   */
  findRouteById(id) {
    for (let route of this.routes) {
      if (route._id.toHexString() === id) return route;
    }
    return null;
  }

  /**
   * Find a route with a Host name
   * 
   * @param {String} host
   * @returns {Route}
   * 
   * @memberOf Router
   */
  findRouteByHost(host) {
    for (let route of this.routes) {
      if (route.subDomain === host) return route;
    }
    return null;
  }
}

module.exports = Router.getInstance();
