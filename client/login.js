import * as util from './lib/util.js'
import * as client from './lib/client.js'

client.ws.onopen = function(event) {
    client.ws.send(client.createMessage(util.queryString['key'], 'account-login'))
}