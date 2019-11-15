function message(content) {
    const nameFind = /(<span class="highlight-name">)(.*?)(<\/span>)/
    const nameReplace = '$1<a href="/user/$2">$2</a>$3'
    
    content = content.replace(nameFind, nameReplace)
    content = '<div class="content">' + content + '</div>'
    
    const date = new Date().toLocaleString()
    const data = '<div class="data">' + date + '</div>'
    
    let div = document.createElement('div')
    div.className = 'message'
    div.innerHTML = content + data
    
    document.querySelector('#chat #output').appendChild(div)
    
    let scrollbar = document.querySelector('#chat .scrollbar')
    scrollbar.scrollTop = scrollbar.scrollHeight - scrollbar.clientHeight
}

function users(users) {
    let userList = document.createElement('ul')
    
    for (var id in users) {
        let userItem = document.createElement('li')
        userItem.innerHTML = '<a href="/user/" target="_blank">' + users[id].name + '</a>'
        
        userList.appendChild(userItem)
    }
    
    document.querySelector('#channel #users').innerHTML = userList.outerHTML
}

export { message, users }