import * as util from './util.js'
import * as channel from './channel.js'

let callbacks = []

// chrome://flags/#allow-insecure-localhost must be enabled when testing locally in Chrome
const ws = new WebSocket('wss://' + window.location.hostname + ':8080')

ws.onmessage = function(message) {
    try {
        message = JSON.parse(message.data)
        content = message.content
        
        if (typeof message.reid !== 'undefined') {
            callbacks[message.reid](message)
            delete callbacks[message.reid]
        } else {
            switch (message.type) {
                case 'channel-message' :
                    channel.message(content)
                    break
                case 'channel-users' :
                    channel.users(content)
                    break
            }
        }
    } catch (error) {
        console.log(error)
    }
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
        jwt: localStorage.getItem('jwt')
    })
}

export { ws, createMessage }