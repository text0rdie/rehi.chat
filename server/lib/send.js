const websocket = require('ws')

const send = require('./send.js')
const message = require('./message.js')

module.exports = {
    all: function(content, type, exclude) {
        for (var id in global.users) {
            var client = global.users[id].client
            
            if (client != exclude && client.readyState === websocket.OPEN) {
                client.send(message.create(content, type))
            }
        }
    },

    users: function(ws) {
        var usersInChannel = []
        
        for (var id in global.users) {
            if (global.users[id].client.readyState === websocket.OPEN) {
                var user = Object.assign({}, global.users[id])
                delete user.client
                
                usersInChannel.push(user)
            }
        }
        
        this.all(usersInChannel, 'channel-users')
    }
}