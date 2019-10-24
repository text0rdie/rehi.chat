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
        
        switch (message.type) {
            case 'channel-message' :
                channelMessage(content)
                break
            case 'channel-users' :
                channelUsers(content)
                break
        }
    } catch (e) {
        console.log(e)
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

function createMessage(message, type) {
    return JSON.stringify({
        content: message,
        type: type
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
    
    ws.send(createMessage(account, 'account-create'))
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