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

const ws = new WebSocket('wss://' + window.location.hostname + ':8080')

ws.onmessage = function(message) {
    try {
        message = JSON.parse(message.data)
        
        switch (message.type) {
            case 'channel-message' :
                channelMessage(message.content)
                break
            case 'channel-users' :
                channelUsers(message.content)
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
        userItem.innerHTML = users[id].name
        
        userList.appendChild(userItem)
    }
    
    document.querySelector('#channel #users').innerHTML = userList.outerHTML
}

document.querySelector('#chat textarea').addEventListener('keydown', function(event) {
    if (event.keyCode == 13) {
        ws.send(event.target.value)
        
        event.target.select()
        event.preventDefault()
    }
})