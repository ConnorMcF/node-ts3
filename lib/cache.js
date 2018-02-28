const Client = require('./models/client')
const Const = require('./const')

/**
 * Teamspeak user cache
 *
 * @class Cache
 * @constructor
 * @private
 */
let Cache = function(ts3, conf) {
	/**
	 * Cache enabled
	 *
	 * @property enabled
	 * @type Boolean
	 */
	this.enabled = true

	/**
	 * Fetches and adds a client to the cache
	 *
	 * @method fetch
	 * @param {String} type
	 * @param {Object} data
	 * @return {Promise} Resolves on success
	 */
	this.fetch = async (type, data) => {

		if(type == Const.CACHE_TYPE.CLIENT) {
			let clid = data.clid || data.invokerid
			data.clid = clid

			if(!this.enabled) {
				return new Client(data)
			}

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