const util = require('./util.js')
const message = require('./message.js')

module.exports = {
    create: function(account, reid, ws) {
        // TODO: add username validation and create the login link
        // NOTE: do we need to use a new type for invalid data (i.e. NOT error)
        
        global.db.query('INSERT INTO rehi_user SET ?', account, function (error, results, fields) {
            let content
            
            if (error) {
                // TODO: create a function for logging error codes
                let errorCode = 'Error Code #' + util.UUID4()
                
                util.log('err', errorCode, error, error.sql)
                
                content = message.create(errorCode, 'error', reid)
            } else {
                content = message.create(results.insertId, 'success', reid)
            }
            
            ws.send(content)
        })
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