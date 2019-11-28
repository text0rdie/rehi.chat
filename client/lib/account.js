function connect(user) {
    document.querySelector('#connect').style.display = 'none'
    
    document.querySelector('#server #name').innerHTML = '@ ' + user.name
    
    if (user.isGuest) {
        document.querySelector('#welcome').style.display = ''
    }
    
    window.user = user
}

function disconnect() {
    document.querySelector('#connect').style.display = 'block'
}

function token(token) {
    let tokenDecoded
    
    try {
        tokenDecoded = JSON.parse(atob(token.split('.')[1]))
    } catch (e) {
        let error = '<strong>An invalid refresh token was returned. Please login again.</strong>'
        
        let messageHTML = '<div class="alert-unknown">' + error + '</div>'
        document.querySelector('#logout-message').innerHTML = messageHTML
        
        this.logout()
        
        return
    }
    
    if (tokenDecoded.remember === 1) {
        sessionStorage.removeItem('jwt')
        
        try {
            localStorage.setItem('jwt', token)
        } catch (e) {
            let error = '<strong>Your local storage is full. Please delete it and login again.</strong>'
            
            let messageHTML = '<div class="alert-unknown">' + error + '</div>'
            document.querySelector('#logout-message').innerHTML = messageHTML
            
            this.logout()
            
            return
        }
    } else {
        localStorage.removeItem('jwt')
        
        sessionStorage.setItem('jwt', token)
    }
}

function logout(errorCode, ws) {
    localStorage.removeItem('jwt')
    sessionStorage.removeItem('jwt')
    
    if (typeof errorCode == 'string' && errorCode !== '') {
        let error = '<strong>There was an authentication error. Please login again.</strong>'
        error += '<br>' + errorCode
                
        let messageHTML = '<div class="alert-unknown">' + error + '</div>'
        document.querySelector('#logout-message').innerHTML = messageHTML
    }
    
    document.querySelector('#logout').style.display = ''
    
    ws.close()
}

export { connect, disconnect, token, logout }