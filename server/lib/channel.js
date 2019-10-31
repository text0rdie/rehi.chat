const websocket = require('ws')

const send = require('./send.js')
const message = require('./message.js')

module.exports = {
    message: function(content, user) {
        msgName = message.highlight(user.name, 'name') + ' says'
        content = message.highlight(content, 'message')
        content = message.highlight(msgName, 'says') + content
        
        send.all(content, 'channel-message')
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
        
        send.all(usersInChannel, 'channel-users')
    }
}