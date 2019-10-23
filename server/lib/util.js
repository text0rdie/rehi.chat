module.exports = {
    log: function(type, message, error) {
        console.log('[' + type + '] ' + message)
        
        if (error) {
            if (global.debug || !error.message) {
                console.log('[dbg] ' + error)
            }
        }
    }
}