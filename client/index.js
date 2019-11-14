import * as client from './lib/client.js'

/* IMPORTANT
 * 
 * Your web server must be configured with a short expiration time for HTML, CSS and JavaScript files.
 * The JavaScript files are the most important as browsers appear to cache them aggressively.
 * The usual solution of appending a dynamic timestamp doesn't work with the import/export module system,
 * and I don't want to add an extra build step to populate a version statically. The files are tiny right 
 * now, and so it shouldn't introduce much overhead, but I may have to revisit this in the future.
 *
 * e.g. Apache with a 1 second expiration (mod_expires and mod_headers must be enabled)
 *
 * <FilesMatch "\.(html|css|js)$">
 *     ExpiresActive On
 *     ExpiresDefault A1
 *     Header append Cache-Control must-revalidate
 * </FilesMatch>
 *
 * Your browser must have the following flag enabled when testing locally on Chrome
 * chrome://flags/#allow-insecure-localhost
 *
 */

client.ws.onopen = function(event) {
    client.ws.send(client.createMessage('', 'account-connect'))
}

const tabHeads = document.querySelectorAll('.tabs > .head > div')

for (const th of tabHeads) {
    th.addEventListener('click', function(event) {
        const th = event.target
        
        th.parentNode.querySelector('.active').classList.remove('active')
        th.classList.add('active')
        
        const tabBodys = th.parentNode.parentNode.querySelectorAll('.body')
        
        for (const tb of tabBodys) {
            if (tb.getAttribute('id') == th.getAttribute('data-id')) {
                tb.style.display = tb.getAttribute('data-type')
            } else {
                tb.style.display = 'none'
            }
        }
    })
}

document.querySelector('#welcome #welcome-username').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        document.querySelector('#welcome #welcome-submit').click()
    }
})

document.querySelector('#welcome #welcome-submit').addEventListener('click', function(event) {
    const account = {
        username: document.querySelector('#welcome #welcome-username').value,
        remember: (document.querySelector('#welcome #welcome-remember').checked) ? 1 : 0
    }
    
    client.ws.send(client.createMessage(account, 'account-login-link', function(message) {
        let messageHTML = ''
        
        switch (message.type) {
            case 'success' :
                messageHTML  = '<div class="alert-success">'
                messageHTML += 'We have sent a login link to your email address.'
                messageHTML += '</div>'
                
                break
            case 'invalid' :
                messageHTML = '<div class="alert-invalid">' + message.content + '</div>'
                
                break
            default :
                let error = '<strong>There was an error processing your request. Please try again.</strong>'
                error += '<br>' + message.content
                
                messageHTML = '<div class="alert-unknown">' + error + '</div>'
        }
        
        document.querySelector('#welcome .modal-title').style.display = 'none'
        document.querySelector('#welcome #welcome-message').innerHTML = messageHTML
    }))
})

document.querySelector('#welcome #welcome-signup').addEventListener('click', function(event) {
    document.querySelector('#welcome').style.display = 'none'
    document.querySelector('#signup').style.display = 'block'
    document.querySelector('#signup #signup-username').focus()
})

document.querySelector('#welcome #welcome-continue').addEventListener('click', function(event) {
    document.querySelector('#welcome').style.display = 'none'
    document.querySelector('#chat textarea').focus()
})

document.querySelector('#signup #signup-close').addEventListener('click', function(event) {
    document.querySelector('#signup').style.display = 'none'
    document.querySelector('#chat textarea').focus()
})

document.querySelector('#signup #signup-goback').addEventListener('click', function(event) {
    document.querySelector('#signup').style.display = 'none'
    document.querySelector('#welcome').style.display = 'block'
    document.querySelector('#welcome #welcome-username').focus()
})

document.querySelector('#signup #signup-email').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        document.querySelector('#signup #signup-submit').click()
    }
})

document.querySelector('#signup #signup-submit').addEventListener('click', function(event) {
    const account = {
        username: document.querySelector('#signup #signup-username').value,
        email: document.querySelector('#signup #signup-email').value
    }
    
    client.ws.send(client.createMessage(account, 'account-create', function(message) {
        let messageHTML = ''
        
        switch (message.type) {
            case 'success' :
                document.querySelector('#signup #signup-form').style.display = 'none'
                document.querySelector('#signup #signup-submit').style.display = 'none'
                document.querySelector('#signup #signup-goback').style.display = 'none'
                document.querySelector('#signup #signup-close').style.display = 'block'
                
                messageHTML  = '<div class="alert-success">'
                messageHTML += 'We have sent an account confirmation link to <strong>' + account.email + '</strong><br>'
                messageHTML += 'Please click the link within <em>30 minutes</em> to complete registration and login.'
                messageHTML += '</div>'
                
                break
            case 'invalid' :
                messageHTML = '<div class="alert-invalid">' + message.content + '</div>'
                
                break
            default :
                let error = '<strong>There was an error processing your request. Please try again.</strong>'
                error += '<br>' + message.content
                
                messageHTML = '<div class="alert-unknown">' + error + '</div>'
        }
        
        document.querySelector('#signup #signup-message').innerHTML = messageHTML
    }))
})

document.querySelector('#logout #logout-submit').addEventListener('click', function(event) {
    window.location.href = '/'
})

document.querySelector('#chat textarea').addEventListener('keydown', function(event) {
    if (event.keyCode == 13) {
        client.ws.send(client.createMessage(event.target.value, 'channel-message'))
        
        event.target.select()
        event.preventDefault()
    }
})