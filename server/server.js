const fs = require('fs')
const path = require('path')
const https = require('https')
const mysql = require('mysql')
const websocket = require('ws')

const util = require('./lib/util.js')
const send = require('./lib/send.js')
const message = require('./lib/message.js')
const channel = require('./lib/channel.js')
const account = require('./lib/account.js')

global.debug = false
global.users = []
global.guest = 0
global.db = null

let config
let db

let tlsPort
let tlsServer
let tlsConfig
let wssServer

try {
    config = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, 'config.json'))
    )
    
    if (typeof config.debug === 'boolean') {
        global.debug = config.debug
    }
} catch (error) {
    util.log('err', 'Unable to parse config.json', error)
    process.exit(1)
}

try {
    if (!config.db.host) {
        throw 'config.json is missing db.host'
    }
    
    if (!config.db.user) {
        throw 'config.json is missing db.user'
    }
    
    if (!config.db.password) {
        throw 'config.json is missing db.password'
    }
    
    if (!config.db.database) {
        throw 'config.json is missing db.database'
    }
    
    global.db = mysql.createConnection({
        host : config.db.host,
        user : config.db.user,
        password : config.db.password,
        database : config.db.database
    })
} catch (error) {
    util.log('err', 'Unable to create database connection', error)
    process.exit(1)
}

global.db.on('error', function(error) {
    if (error.code === 'ECONNREFUSED') {
        util.log('err', 'Unable to connect to the database', error)
        process.exit(1)
    } else {
        util.log('err', 'MySQL Error', error)
    }
})

global.db.connect()

try {
    tlsPort = 8080
    tlsServer = https.createServer({
        cert: fs.readFileSync(path.resolve(__dirname, 'public.pem')),
         key: fs.readFileSync(path.resolve(__dirname, 'secret.pem'))
    })

    tlsConfig = { server: tlsServer }
    wssServer = new websocket.Server(tlsConfig)
} catch (error) {
    util.log('err', 'Unable to start the web socket server', error)
    process.exit(1)
}

wssServer.on('error', function(error) {
    util.log('err', 'WebSocket Error', error)
})

wssServer.on('listening', function(ws, request) {
    util.log('sys', 'Listening on *:' + tlsPort)
})

wssServer.on('connection', function(ws, request) {
    const clientId = request.headers['sec-websocket-key']
    let clientName = 'Ghost'
    
    if (users.hasOwnProperty(clientId) === false) {
        account.createGuest(clientId, ws)
    }
    
    clientName = users[clientId].name
    
    util.log('sys', clientName + ' has connected')
    send.all(message.highlight(clientName, 'name') + ' has connected', 'channel-message', ws)
    
    send.users(ws)
    
    const welcome = 'Welcome! Your name has been auto-generated as ' + message.highlight(clientName, 'name')
    const content = message.create(welcome, 'channel-message')
    ws.send(content)
    
    ws.on('close', function() {
        util.log('sys', clientName + ' has disconnected')
        send.all(message.highlight(clientName, 'name') + ' has disconnected', 'channel-message', ws)
        
        send.users(ws)
    })
    
    ws.on('message', function(msg) {
        // TODO: validate token
        
        try {
            msg = JSON.parse(msg)
            const content = msg.content
            
            switch (msg.type) {
                case 'channel-message' :
                    channel.message(content, clientName)
                    break
                case 'account-create' :
                    account.create(content, msg.id, ws)
                    break
            }
        } catch (e) {
            util.log('err', 'Unable to parse message', e)
        }
    })
})

tlsServer.on('close', function() {
    global.db.end()
})

tlsServer.listen(tlsPort)