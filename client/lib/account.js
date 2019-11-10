function connect(user) {
    document.querySelector('#server #name').innerHTML = '@ ' + user.name
    
    if (user.isGuest) {
        document.querySelector('#welcome').style.display = ''
    }
}

export { connect }