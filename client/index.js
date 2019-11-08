import * as client from './lib/client.js'

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

document.querySelector('#welcome #welcome-signup').addEventListener('click', function(event) {
    document.querySelector('#welcome').style.display = 'none'
    document.querySelector('#signup').style.display = 'block'
})

document.querySelector('#signup #signup-submit').addEventListener('click', function(event) {
    const account = {
        username: document.querySelector('#signup #signup-username').value,
        email: document.querySelector('#signup #signup-email').value
    }
    
    client.ws.send(client.createMessage(account, 'account-create', function(message) {
        let messageHTML = ''
        
        if (message.type === 'error') {
            let error = '<strong>There was an error processing your request. Please try again.</strong>'
            error += '<br>' + message.content
            
            messageHTML = '<div class="alert-error">' + error + '</div>'
        } else {
            document.querySelector('#signup #signup-form').style.display = 'none'
            document.querySelector('#signup #signup-submit').style.display = 'none'
            document.querySelector('#signup #signup-goback').style.display = 'none'
            document.querySelector('#signup #signup-close').style.display = 'block'
            
            messageHTML  = '<div class="alert-success">'
            messageHTML += 'We have sent an account confirmation link to <strong>' + account.email + '</strong><br>'
            messageHTML += 'Please click the link within <em>30 minutes</em> to complete registration and login.'
            messageHTML += '</div>'
        }
        
        document.querySelector('#signup #signup-message').innerHTML = messageHTML
    }))
})

document.querySelector('#signup #signup-close').addEventListener('click', function(event) {
    document.querySelector('#signup').style.display = 'none'
    document.querySelector('#chat textarea').focus()
})

document.querySelector('#welcome #welcome-continue').addEventListener('click', function(event) {
    document.querySelector('#welcome').style.display = 'none'
    document.querySelector('#chat textarea').focus()
})

document.querySelector('#signup #signup-goback').addEventListener('click', function(event) {
    document.querySelector('#signup').style.display = 'none'
    document.querySelector('#welcome').style.display = 'block'
})

document.querySelector('#chat textarea').addEventListener('keydown', function(event) {
    if (event.keyCode == 13) {
        client.ws.send(client.createMessage(event.target.value, 'channel-message'))
        
        event.target.select()
        event.preventDefault()
    }
})