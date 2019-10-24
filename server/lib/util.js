module.exports = {
    log: function(type, message, error) {
        console.log('[' + type + '] ' + message)
        
        if (error) {
            if (global.debug || !error.message) {
                error = error.message || JSON.stringify(error)
                console.log('[dbg] ' + error)
            }
        }
    }
}