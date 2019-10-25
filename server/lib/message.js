const util = require('./util.js')

module.exports = {
    create: function(content, type, reid) {
        id = util.UUID4()
        
        return JSON.stringify({
            id: id,
            content: content,
            type: type,
            reid: reid
        })
    },
    
    highlight: function(text, type) {
        return '<span class="highlight-' + type + '">' + text + '</span>'
    }
}