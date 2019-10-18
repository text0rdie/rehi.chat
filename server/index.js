const fs = require('fs')
const path = require('path')
const https = require('https')
const WebSocket = require('ws')

const port = 8080
const tlsServer = https.createServer({
    cert: fs.readFileSync(path.resolve(__dirname, 'public.pem')),
     key: fs.readFileSync(path.resolve(__dirname, 'secret.pem'))
})

const config = { server: tlsServer }
const wssServer = new WebSocket.Server(config)

var users = []
var guest = 0

wssServer.on('listening', function(ws, request) {
    console.log('listening on *:' + port)
})

wssServer.on('connection', function(ws, request) {
    const clientId = request.headers['sec-websocket-key']
    var clientName = 'Ghost'
    
    if (users.hasOwnProperty(clientId) === false) {
        createGuest(clientId)
    }
    
    clientName = users[clientId].name
    
    console.log(clientName + ' has connected')
    sendToAll(highlight(clientName, 'name') + ' has connected', ws)
    
    ws.send('Welcome! Your name has been auto-generated as ' + highlight(clientName, 'name'))
    
    ws.on('close', function() {
        console.log(clientName + ' has disconnected')
        sendToAll(highlight(clientName, 'name') + ' has disconnected', ws)
    })
    
    ws.on('message', function(message) {
        message = highlight(message, 'message')
        message = highlight(highlight(clientName, 'name') + ' says', 'says') + message
        
        sendToAll(message)
    })
})

tlsServer.listen(port)

function highlight(text, type) {
    return '<span class="highlight-' + type + '">' + text + '</span>'
}

function createGuest(clientId) {
    guest++
    
    users[clientId] = {
        name: 'Guest' + guest
    }
    
    if (guest > 9999) {
        guest = 0
    }
}

function sendToAll(message, exclude) {
    wssServer.clients.forEach(function each(client) {
        if (client != exclude && client.readyState === WebSocket.OPEN) {
            client.send(message)
        }
    })
}