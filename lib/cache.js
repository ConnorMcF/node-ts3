const Client = require('./models/client')
const Const = require('./const')

let Cache = function(ts3, conf) {
	this.enabled = true

	this.fetch = async (type, data) => {

		if(type == Const.CACHE_TYPE.CLIENT) {
			let clid = data.clid || data.invokerid
			data.clid = clid

			if(!ts3.clients[clid]) {
				ts3.clients[clid] = new Client(ts3, data)
				await ts3.clients[clid].update()
			}

			if(!ts3.clients[clid].nick) {
				await ts3.clients[clid].update()
			}

			return ts3.clients[clid]
		}
		
	}
}

module.exports = Cache