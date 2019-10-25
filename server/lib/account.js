const util = require('./util.js')
const message = require('./message.js')

module.exports = {
    create: function(account, reid, ws) {
        // TODO: add username validation and create the account
        // var query = connection.query('INSERT INTO user SET ?', post, function (error, results, fields) {})
        
        const content = message.create(123, 'success', reid)
        ws.send(content)
    },
    
    createGuest: function(clientId, ws) {
        global.guest++
        
        global.users[clientId] = {
            client: ws,
            clientId: clientId,
            name: 'Guest' + global.guest
        }
        
        if (global.guest > 9999) {
            global.guest = 0
        }
    }
}