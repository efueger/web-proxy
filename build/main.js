(function() {
  var Routes, domain, http, httpProxy, proxy, routes;

  http = require('http');

  httpProxy = require('http-proxy');

  Routes = require("./routes.json");

  domain = 'rcdinfo.fr';

  routes = {};

  proxy = httpProxy.createProxyServer({});

  http.createServer(function(req, res) {
    var hostname, i, len, results, route;
    hostname = req.headers.host.split(":")[0];
    console.log("Request on " + hostname);
    results = [];
    for (i = 0, len = Routes.length; i < len; i++) {
      route = Routes[i];
      results.push((function(route) {
        if ((route.sdom + "." + domain) === hostname) {
          return proxy.web(req, res, {
            target: "http://localhost:" + route.port
          });
        }
      })(route));
    }
    return results;
  }).listen(8000, function() {
    return console.log('Server started...');
  });

  http.createServer(function(req, res) {
    var hostname, i, len, results, route;
    hostname = req.headers.host.split(":")[0];
    console.log("Request on " + hostname);
    results = [];
    for (i = 0, len = Routes.length; i < len; i++) {
      route = Routes[i];
      results.push((function(route) {
        if ((route.sdom + "." + domain) === hostname) {
          return proxy.web(req, res, {
            target: "http://localhost:" + route.ssl
          });
        }
      })(route));
    }
    return results;
  }).listen(443, function() {
    return console.log('Server started...');
  });

  http.createServer(function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.write("proxy 1: " + req.url + " \n " + (JSON.stringify(req.headers, true, 2)));
    return res.end();
  }).listen(8001);

  http.createServer(function(req, res) {
    console.log(req.url);
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.write("proxy 2: " + req.url + " \n " + (JSON.stringify(req.headers, true, 2)));
    return res.end();
  }).listen(8002);

  http.createServer(function(req, res) {
    console.log(req.url);
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.write("proxy3: " + req.url + " \n " + (JSON.stringify(req.headers, true, 2)));
    return res.end();
  }).listen(8003);

}).call(this);
