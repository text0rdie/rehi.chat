var queryString = []

location.search.substr(1).split('&').forEach(function (param) {
    let keyVal = param.split('=')
    queryString[keyVal[0]] = decodeURIComponent(keyVal[1])
})

// https://gist.github.com/jed/982883
function UUID4() {
    let hex = []
    let ui8 = crypto.getRandomValues(new Uint8Array(16))
    
    for (let i = 0; i < 256; i++) {
        hex[i] = (i < 16 ? '0' : '') + (i).toString(16).toUpperCase()
    }
    
    ui8[6] = ui8[6] & 0x0F | 0x40
    ui8[8] = ui8[8] & 0x3F | 0x80
    
    return (
        hex[ui8[0]] +
        hex[ui8[1]] +
        hex[ui8[2]] +
        hex[ui8[3]] +
        '-' +
        hex[ui8[4]] +
        hex[ui8[5]] +
        '-' +
        hex[ui8[6]] +
        hex[ui8[7]] +
        '-' +
        hex[ui8[8]] +
        hex[ui8[9]] +
        '-' +
        hex[ui8[10]] +
        hex[ui8[11]] +
        hex[ui8[12]] +
        hex[ui8[13]] +
        hex[ui8[14]] +
        hex[ui8[15]]
    )
}

export { queryString, UUID4 }