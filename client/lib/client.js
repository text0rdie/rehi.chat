import * as util from './util.js'
import * as channel from './channel.js'
import * as account from './account.js'

let callbacks = []
let ws = null

function create(onOpen) {
    ws = new WebSocket('wss://' + window.location.hostname + ':8080')

    ws.onmessage = function(message) {
        try {
            message = JSON.parse(message.data)
            const content = message.content
            
            if (typeof message.reid !== 'undefined') {
                callbacks[message.reid](message)
                delete callbacks[message.reid]
            } else {
                switch (message.type) {
                    case 'account-connect' :
                        account.connect(content)
                        break
                    case 'account-token'   :
                        account.token(content)
                        break
                    case 'account-logout'  :
                        account.logout(content, ws)
                        break
                    case 'channel-message' :
                        channel.message(content)
                        break
                    case 'channel-users'   :
                        channel.users(content)
                        break
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    ws.onclose = function() {
        if (window.user) {
            account.disconnect()
        }
        
        setTimeout(function() {
            create(onOpen)
        }, 10000)
    }
    
    ws.onopen = onOpen
}

function createMessage(message, type, callback) {
    const id = util.UUID4()
    
    if (callback) {
        callbacks[id] = callback
    }
    
    return JSON.stringify({
        id: id,
        content: message,
        type: type,
        jwt: sessionStorage.getItem('jwt') || localStorage.getItem('jwt')
    })
}

export { ws, create, createMessage }