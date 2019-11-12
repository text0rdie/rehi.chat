const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const util = require('./util.js')
const send = require('./send.js')
const message = require('./message.js')
const channel = require('./channel.js')

module.exports = {
    create: function(account, reid, ws, deleted = false) {
        const notAvailable = ['admin', 'moderator', 'guest', 'rehi']
        let invalid = ''
        
        if (account.username.length < 2 || account.username.length > 15) {
            invalid = 'Your username must be between 2 - 15 characters.'
        } else if (/[^A-Za-z0-9\!\@\#\$\%\^\&\*\(\)\[\]\{\}\-\+\=\|\'\:\.\;\~\`\?]/.test(account.username)) {
            invalid = 'Your username has invalid characters.'
        } else if (notAvailable.some(function(b) { return account.username.toLowerCase().indexOf(b) >= 0 })) {
            invalid = 'This username is not available.'
        }
        
        if (invalid !== '') {
            ws.send(message.create(invalid, 'invalid', reid))
        } else {
            let query = 'SELECT * FROM rehi_user WHERE username = ?'
        
            global.db.query(query, account.username, function (error, results, fields) {
                if (error) {
                    const errorCode = util.logError(error, error.sql)
                    ws.send(message.create(errorCode, 'error', reid))
                } else if (results.length > 0) {
                    const loginExpired = parseInt(results[0].login_created) + (30 * 60)
                    const nowTimestamp = Math.floor(Date.now() / 1000)
                    
                    if (results[0].confirmed === 1 || loginExpired > nowTimestamp || deleted) {
                        invalid = 'This username is not available.'
                        ws.send(message.create(invalid, 'invalid', reid))
                    } else {
                        let query = 'DELETE FROM rehi_user WHERE id = ?'
                        
                        global.db.query(query, results[0].id, function (error, results, fields) {
                            if (error) {
                                const errorCode = util.logError(error, error.sql)
                                ws.send(message.create(errorCode, 'error', reid))
                            } else {
                                this.create(account, reid, ws, true)
                            }
                        })
                    }
                } else {
                    account.login = crypto.randomBytes(64).toString('base64')
                    account.login_created = Math.floor(Date.now() / 1000)
                    
                    global.db.query('INSERT INTO rehi_user SET ?', account, function (error, results, fields) {
                        let content = '{}'
                        
                        if (error) {
                            const errorCode = util.logError(error, error.sql)
                            content = message.create(errorCode, 'error', reid)
                        } else {
                            let link = global.paths.siteurl + '/login.html?key=' + encodeURIComponent(account.login)
                            let body = '<p><strong>Hi ' + account.username + '&nbsp;&nbsp;:-)</strong></p>'
                            body += '<p>Thanks for signing up!</p>'
                            body += '<p>Please click the following link to login to your new account.</p>'
                            body += '<p><a href="' + link + '">Login to Rehi</a></p>'
                            
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
                }
            })
        }
    },
    
    createGuest: function(clientId, ws) {
        global.guest++
        
        global.users[clientId] = {
            client: ws,
            clientId: clientId,
            name: 'Guest' + global.guest,
            isGuest: true
        }
        
        if (global.guest > 9999) {
            global.guest = 0
        }
    },
    
    login: function(key, reid, ws, clientId) {
        let query = 'SELECT * FROM rehi_user WHERE login = ? AND (login_created + (30 * 60)) >= UNIX_TIMESTAMP()'
        
        global.db.query(query, key, function (error, results, fields) {
            let content = '{}'
            
            if (error) {
                const errorCode = util.logError(error, error.sql)
                content = message.create(errorCode, 'error', reid)
            } else {
                if (results.length == 1) {
                    const uid = results[0].id
                    const username = results[0].username
                    const jti = util.UUID4()
                    
                    query = 'UPDATE rehi_user SET confirmed = 1, token = ?, login = "", login_created = 0 WHERE id = ?'
                    
                    global.db.query(query, [jti, uid], function (error, results, fields) {
                        if (error) {
                            const errorCode = util.logError(error, error.sql)
                            content = message.create(errorCode, 'error', reid)
                        } else {
                            const token = jwt.sign({
                                uid: uid,
                                username: username,
                                chk: Math.floor(Date.now() / 1000) + global.jwt.recheckIn,
                                exp: Math.floor(Date.now() / 1000) + global.jwt.expiresIn,
                                jti: jti
                            }, global.jwt.secret)
                            
                            content = message.create(token, 'success', reid)
                        }
                        
                        ws.send(content)
                    })
                    
                    return
                } else {
                    const errorCode = util.logError('Unable to login with the following key', key)
                    content = message.create(errorCode, 'error', reid)
                }    
            }
            
            ws.send(content)
        })
    },
    
    connect: function(user) {
        util.log('sys', user.name + ' has connected')
        send.all(message.highlight(user.name, 'name') + ' has connected', 'channel-message', user.client)
        
        channel.users(user.client)
        
        let welcome = ''
        
        if (user.isGuest) {
            welcome = 'Welcome! Your name has been auto-generated as ' + message.highlight(user.name, 'name')
        } else {
            welcome = 'Welcome! You are logged in as ' + message.highlight(user.name, 'name')
        }
        
        user.client.send(message.create(user, 'account-connect'))
        user.client.send(message.create(welcome, 'channel-message'))
    }
}