const crypto = require('crypto')

const util = require('./util.js')
const message = require('./message.js')

module.exports = {
    create: function(account, reid, ws) {
        // TODO: add username validation
        // NOTE: do we need to use a new type for invalid data (i.e. NOT error)
        
        account.login = crypto.randomBytes(64).toString('base64')
        account.login_created = Math.floor(Date.now() / 1000)
        
        global.db.query('INSERT INTO rehi_user SET ?', account, function (error, results, fields) {
            let content
            
            if (error) {
                // TODO: create a function for logging error codes
                let errorCode = 'Error Code #' + util.UUID4()
                
                util.log('err', errorCode, error, error.sql)
                
                content = message.create(errorCode, 'error', reid)
            } else {
                let link = 'https://rehi.chat/login.html?key=' + encodeURIComponent(account.login)
                let body = '<p><strong>Hi ' + account.username + '&nbsp;&nbsp;:-)</strong></p>'
                body += '<p>Thanks for signing up! Please click the following link to login to your new account.</p>'
                body += '<p><a href="' + link + '">Login @ Rehi</a></p>'
                
                const email = {
                    to: account.email,
                    from: global.email.from,
                    subject: 'Rehi New Account',
                    html: body,
                }
                
                global.sendgrid.send(email)
                
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