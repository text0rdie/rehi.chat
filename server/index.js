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
        createGuest(clientId, ws)
    }
    
    clientName = users[clientId].name
    
    console.log(clientName + ' has connected')
    sendToAll(highlight(clientName, 'name') + ' has connected', 'channel-message', ws)
    
    sendUsers(ws)
    
    const welcome = 'Welcome! Your name has been auto-generated as ' + highlight(clientName, 'name')
    const message = createMessage(welcome, 'channel-message')
    ws.send(message)
    
    ws.on('close', function() {
        console.log(clientName + ' has disconnected')
        sendToAll(highlight(clientName, 'name') + ' has disconnected', 'channel-message', ws)
        
        sendUsers(ws)
    })
    
    ws.on('message', function(message) {
        message = highlight(message, 'message')
        message = highlight(highlight(clientName, 'name') + ' says', 'says') + message
        
        sendToAll(message, 'channel-message')
    })
})

tlsServer.listen(port)

function highlight(text, type) {
    return '<span class="highlight-' + type + '">' + text + '</span>'
}

function createGuest(clientId, ws) {
    guest++
    
    users[clientId] = {
        client: ws,
        clientId: clientId,
        name: 'Guest' + guest
    }
    
    if (guest > 9999) {
        guest = 0
    }
}

function createMessage(message, type) {
    return JSON.stringify({
        content: message,
        type: type
    })
}

function sendToAll(message, type, exclude) {
    for (var id in users) {
        var client = users[id].client
         
        if (client != exclude && client.readyState === WebSocket.OPEN) {
            client.send(createMessage(message, type))
        }
    }
}

function sendUsers(ws) {
    var usersInChannel = []
    
    for (var id in users) {
        if (users[id].client.readyState === WebSocket.OPEN) {
            var user = Object.assign({}, users[id])
            delete user.client
            
            usersInChannel.push(user)
        }
    }
    
    sendToAll(usersInChannel, 'channel-users')
}