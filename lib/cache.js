const Client = require('./models/client')
const Const = require('./const')

let Cache = function(ts3, conf) {
	this.enabled = true

	this.fetch = async (type, data) => {

		if(type == Const.CACHE_TYPE.CLIENT) {
			let clid = data.clid || data.invokerid
			data.clid = clid

			let client = ts3.clients.find((cl) => cl.clid == clid)

			if(!client) {
				client = new Client(ts3, data)
				ts3.clients.push(client)
				await client.update()
			}

			if(!client.nick) {
				await client.update()
			}

			return client
		}
		
	}
}

module.exports = Cache