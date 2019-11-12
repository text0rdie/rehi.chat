import * as util from './lib/util.js'
import * as client from './lib/client.js'

client.ws.onopen = function(event) {
    setTimeout(function() {
        client.ws.send(client.createMessage(util.queryString['key'], 'account-login', function(message) {
            if (message.type === 'error') {
                let error = '<strong>This login link has expired. Please login again.</strong>'
                error += '<br>' + message.content
                
                let messageHTML = '<div class="alert-unknown">' + error + '</div>'
                document.querySelector('#login').innerHTML = messageHTML
            } else {
                let token = message.content
                let tokenDecoded
                
                try {
                    tokenDecoded = JSON.parse(atob(token.split('.')[1]))
                } catch (e) {
                    let error = '<strong>An invalid login token was returned.</strong>'
                    
                    let messageHTML = '<div class="alert-unknown">' + error + '</div>'
                    document.querySelector('#login').innerHTML = messageHTML
                    
                    return
                }
                
                if (tokenDecoded.remember === 1) {
                    sessionStorage.removeItem('jwt')
                    
                    try {
                        localStorage.setItem('jwt', token)
                    } catch (e) {
                        let error = '<strong>Your local storage is full. Please delete it and login again.</strong>'
                        
                        let messageHTML = '<div class="alert-unknown">' + error + '</div>'
                        document.querySelector('#login').innerHTML = messageHTML
                        
                        return
                    }
                    
                    // wait until the data has been written
                    while (localStorage.getItem('jwt') !== token) {}
                    
                    window.location.href = '/'
                } else {
                    localStorage.removeItem('jwt')
                    
                    sessionStorage.setItem('jwt', token)
                    
                    // wait until the data has been written
                    while (sessionStorage.getItem('jwt') !== token) {}
                    
                    window.location.href = '/'
                }
            }
        }))
    }, 3000)
}