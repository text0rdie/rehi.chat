const send = require('./send.js')
const message = require('./message.js')

module.exports = {
    message: function(content, clientName) {
        msgName = message.highlight(clientName, 'name') + ' says'
        content = message.highlight(content, 'message')
        content = message.highlight(msgName, 'says') + content
        
        send.all(content, 'channel-message')
    }
}