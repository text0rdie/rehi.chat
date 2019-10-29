const crypto = require('crypto')

let hex = []

for (let i = 0; i < 256; i++) {
    hex[i] = (i < 16 ? '0' : '') + (i).toString(16).toUpperCase()
}

module.exports = {
    log: function(type, message, error, extra) {
        console.log('[' + type + '] ' + message)
        
        if (error) {
            if (global.debug || !error.message) {
                if (error.message) {
                    error = error.message
                } else {
                    if (typeof error === 'object') {
                        error = JSON.stringify(error)
                    }
                }
                
                console.log('[dbg] ' + error)
                
                if (extra) {
                    console.log('[dbg] ' + extra)
                }
            }
        }
    },
    
    // https://gist.github.com/jed/982883
    UUID4: function() {
        let r = crypto.randomBytes(16)
        
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
}