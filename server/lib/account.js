const util = require('./util.js')

module.exports = {
    create: function(account) {
        util.log('dbg', 'account-create', account)
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