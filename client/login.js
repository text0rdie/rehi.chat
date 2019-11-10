import * as util from './lib/util.js'
import * as client from './lib/client.js'

client.ws.onopen = function(event) {
    setTimeout(function() {
        client.ws.send(client.createMessage(util.queryString['key'], 'account-login', function(message) {
            if (message.type === 'error') {
                let error = '<strong>This login link has expired. Please login again.</strong>'
                error += '<br>' + message.content
                
                let messageHTML = '<div class="alert-error">' + error + '</div>'
                document.querySelector('#login').innerHTML = messageHTML
            } else {
                try {
                    localStorage.setItem('jwt', message.content)
                    
                    // wait until the data has been written
                    while (localStorage.getItem('jwt') !== message.content) {}
                    
                    window.location.href = '/'
                } catch (e) {
                    let error = '<strong>Your local storage is full. Please delete it and login again.</strong>'
                    let messageHTML = '<div class="alert-error">' + error + '</div>'
                    document.querySelector('#login').innerHTML = messageHTML
                }
            }
        }))
    }, 3000)
}