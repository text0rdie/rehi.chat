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

const ws = new WebSocket("ws://localhost:8080")

ws.onmessage = function(message) {
    var content = document.createElement('div')
    content.innerHTML = message.data
    
    document.querySelector('#chat #output').appendChild(content)
}

document.querySelector('#chat textarea').addEventListener('keydown', function(event) {
    if (event.keyCode == 13) {
        ws.send(event.target.value)
        
        event.target.select()
        event.preventDefault()
    }
})