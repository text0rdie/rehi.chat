import * as util from './lib/util.js'
import * as client from './lib/client.js'

client.ws.onopen = function(event) {
    setTimeout(function() {
        client.ws.send(client.createMessage(util.queryString['key'], 'account-login', function(message) {
            let messageHTML = ''
            
            if (message.type === 'error') {
                let error = '<strong>This login link has expired. Please try again.</strong>'
                error += '<br>' + message.content
                
                messageHTML = '<div class="alert-error">' + error + '</div>'
            } else {
                localStorage.setItem('jwt', message.content)
                // TODO: redirect to index.html and authenticate with JWT
            }
            
            document.querySelector('#login').innerHTML = messageHTML
        }))
    }, 3000)
}