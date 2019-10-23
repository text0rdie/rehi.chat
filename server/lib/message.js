module.exports = {
    create: function(content, type) {
        return JSON.stringify({
            content: content,
            type: type
        })
    },
    
    highlight: function(text, type) {
        return '<span class="highlight-' + type + '">' + text + '</span>'
    }
}