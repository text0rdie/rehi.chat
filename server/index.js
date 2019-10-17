const WebSocket = require('ws')

const config = { port: 8080 }
const server = new WebSocket.Server(config)

server.on('listening', function(ws, request) {
    console.log('listening on *:' + config.port)
})

server.on('connection', function(ws, request) {
    const clientId = request.headers['sec-websocket-key']
    
    ws.send('Welcome to Rehi v0.1.0')
    
    console.log(clientId + ' has connected')
    sendToAll(clientId + ' has connected', ws)
    
    ws.on('close', function() {
        console.log(clientId + ' has disconnected')
        sendToAll(clientId + ' has disconnected', ws)
    })
    
    ws.on('message', function(message) {
        console.log(clientId + ' has sent a message')
        sendToAll(message)
    })
})

function sendToAll(message, exclude) {
    server.clients.forEach(function each(client) {
        if (client != exclude && client.readyState === WebSocket.OPEN) {
            client.send(message)
        }
    })
}