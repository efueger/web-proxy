http        = require 'http'
httpProxy   = require 'http-proxy'

Routes      = require "./routes.json"

domain      = 'rcdinfo.fr'
routes      = {}
routed      = false
proxy       = httpProxy.createProxyServer({})


http.createServer (req, res)->
    hostname = req.headers.host.split(":")[0]

    console.log "Request on #{hostname}"

    for route in Routes
        do (route)->
            if "#{route.sdom}.#{domain}" == hostname

                routed = true
                proxy.web req, res,
                    target: "http://localhost:#{route.port}"
                console.log "-> http://localhost:#{route.port}"

    unless routed
        res.writeHead 418,
            'Content-Type': 'text/plain'
        #res.write "proxy default: #{req.url} \n #{JSON.stringify(req.headers, true, 2)}"
        res.write "Quelque chose me dit que vous ne savez pas ce que vous faites içi, aller je suis gentil <a href=\"http://rcdinfo.fr\">cliquez</a> là "
        res.end()


.listen 80, ->
    console.log 'Server started...'

# SSL Proxy
###
http.createServer (req, res)->
    hostname = req.headers.host.split(":")[0]

    console.log "Request on #{hostname}"

    for route in Routes
        do (route)->
            if "#{route.sdom}.#{domain}" == hostname

                proxy.web req, res,
                    target: "http://localhost:#{route.ssl}"
.listen 443, ->
    console.log 'Server started...'

http.createServer (req, res)->
    console.log req.url
    res.writeHead 200,
        'Content-Type': 'text/plain'
    res.write "proxy 2: #{req.url} \n #{JSON.stringify(req.headers, true, 2)}"
    res.end()
.listen(8002)

http.createServer (req, res)->
    console.log req.url
    res.writeHead 200,
        'Content-Type': 'text/plain'
    res.write "proxy3: #{req.url} \n #{JSON.stringify(req.headers, true, 2)}"
    res.end()
.listen(8003)

###
