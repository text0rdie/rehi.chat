let callbacks = []

var hex = []

for (var i = 0; i < 256; i++) {
    hex[i] = (i < 16 ? '0' : '') + (i).toString(16).toUpperCase()
}

const tabHeads = document.querySelectorAll('.tabs > .head > div')

for (const th of tabHeads) {
    th.addEventListener('click', function(event) {
        const th = event.target
        
        th.parentNode.querySelector('.active').classList.remove('active')
        th.classList.add('active')
        
        tabBodys = th.parentNode.parentNode.querySelectorAll('.body')
        
        for (const tb of tabBodys) {
            if (tb.getAttribute('id') == th.getAttribute('data-id')) {
                tb.style.display = tb.getAttribute('data-type')
            } else {
                tb.style.display = 'none'
            }
        }
    })
}

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
                    channelMessage(content)
                    break
                case 'channel-users' :
                    channelUsers(content)
                    break
            }
        }
    } catch (error) {
        console.log(error)
    }
}

function channelMessage(content) {
    nameFind = /(<span class="highlight-name">)(.*?)(<\/span>)/
    nameReplace = '$1<a href="/user/" target="_blank">$2</a>$3'
    content = content.replace(nameFind, nameReplace)
    content = '<div class="content">' + content + '</div>'
    
    const date = new Date().toLocaleString()
    const data = '<div class="data">' + date + '</div>'
    
    var div = document.createElement('div')
    div.className = 'message'
    div.innerHTML = content + data
    
    document.querySelector('#chat #output').appendChild(div)
    
    var scrollbar = document.querySelector('#chat .scrollbar')
    scrollbar.scrollTop = scrollbar.scrollHeight - scrollbar.clientHeight
}

function channelUsers(users) {
    var userList = document.createElement('ul')
    
    for (var id in users) {
        var userItem = document.createElement('li')
        userItem.innerHTML = '<a href="/user/" target="_blank">' + users[id].name + '</a>'
        
        userList.appendChild(userItem)
    }
    
    document.querySelector('#channel #users').innerHTML = userList.outerHTML
}

function createMessage(message, type, callback) {
    id = UUID4()
    
    if (callback) {
        callbacks[id] = callback
    }
    
    return JSON.stringify({
        id: id,
        content: message,
        type: type
    })
}

// https://gist.github.com/jed/982883#gistcomment-2403369
function UUID4() {
    var r = crypto.getRandomValues(new Uint8Array(16))
    
    r[6] = r[6] & 0x0F | 0x40
    r[8] = r[8] & 0x3F | 0x80
    
    return (
        hex[r[0]] +
        hex[r[1]] +
        hex[r[2]] +
        hex[r[3]] +
        '-' +
        hex[r[4]] +
        hex[r[5]] +
        '-' +
        hex[r[6]] +
        hex[r[7]] +
        '-' +
        hex[r[8]] +
        hex[r[9]] +
        '-' +
        hex[r[10]] +
        hex[r[11]] +
        hex[r[12]] +
        hex[r[13]] +
        hex[r[14]] +
        hex[r[15]]
    )
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
    
    ws.send(createMessage(account, 'account-create', function(message) {
        if (message.type === 'success') {
            document.querySelector('#signup #signup-form').style.display = 'none'
            document.querySelector('#signup #signup-submit').style.display = 'none'
            document.querySelector('#signup #signup-goback').style.display = 'none'
            document.querySelector('#signup #signup-close').style.display = 'block'
            
            messageHTML  = '<div class="alert-success">'
            messageHTML += 'We have sent an account confirmation link to <strong>' + account.email + '</strong><br>'
            messageHTML += 'Please click the link within <em>30 minutes</em> to complete registration and login.'
            messageHTML += '</div>'
        } else {
            messageHTML = '<div class="alert-error">' + message.content + '</div>'
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
        ws.send(createMessage(event.target.value, 'channel-message'))
        
        event.target.select()
        event.preventDefault()
    }
})