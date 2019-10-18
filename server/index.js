const WebSocket = require('ws')

const config = { port: 8080 }
const server = new WebSocket.Server(config)

var users = []
var guest = 0

server.on('listening', function(ws, request) {
    console.log('listening on *:' + config.port)
})

server.on('connection', function(ws, request) {
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
    server.clients.forEach(function each(client) {
        if (client != exclude && client.readyState === WebSocket.OPEN) {
            client.send(message)
        }
    })
}