const TS3Sock = require('./sock')
const Utils = require('./utils')
const Handlers = require('./handlers')

const Const = require('./const')
const Cache = require('./cache')
const Channel = require('./models/channel')

/**
 * Teamspeak server query client instance
 *
 * @class TS3
 * @constructor
 */
let TS3 = function(conf = {}) {
	let sock = new TS3Sock(this, conf)
	/**
	 * TS3Sock
	 *
	 * @property _sock
	 * @type TS3Sock
	 */
	this._sock = sock

	/**
	 * Connected virtual server
	 *
	 * @property server
	 * @type Number
	 */
	this.server = null

	/**
	 * Server network bindings
	 *
	 * @property binding
	 * @type Array
	 */
	this.binding = null

	/**
	 * Server query client ID
	 *
	 * @property clientID
	 * @type String
	 */
	this.clientID = null

	/**
	 * Array of server clients
	 *
	 * @property clients
	 * @type Client[]
	 */
	this.clients = []
	/**
	 * Array of server channels
	 *
	 * @property channels
	 * @type Channel[]
	 */
	this.channels = []

	/**
	 * Cache instance
	 *
	 * @property cache
	 * @type Cache
	 */
	this.cache = new Cache(this, conf)

	/**
	 * Connect to a teamspeak server
	 *
	 * @method connect
	 * @param {String} ip
	 * @param {Number} port
	 * @return {Promise} Resolves on success
	 */
	this.connect = async (ip = '127.0.0.1', port = 10011) => {
		return new Promise((resolve, reject) => {
			sock.connect(ip, port)
		
			sock.once('connected', () => {
				resolve()
			})
		})
	}

	sock.on('connected', () => {
		this.emit('connected')
	})

	sock.on('sockConnected', () => {
		this.emit('sockConnected')
	})

	/**
	 * Authenticate to server query
	 *
	 * @method auth
	 * @param {String} username
	 * @param {String} password
	 */
	this.auth = async (user, pass, server = 1) => {
		await sock.send('login', {
			'client_login_name': Utils.escape(user),
			'client_login_password': Utils.escape(pass)
		})
		await this.use(server)
		await this.whoAmI()
		await this.getChannels()
		await this.getClients()
		await this.getBinding()
	}

	/**
	 * Deauthenticate from server query
	 *
	 * @method deauth
	 * @return {Promise} Resolves on success
	 */
	this.deauth = async () => {
		return await sock.send('logout')
	}

	/**
	 * Disconnect from server query
	 *
	 * @method quit
	 * @return {Promise} Resolves on success
	 */
	this.quit = async () => {
		return await sock.send('quit')
	}

	/**
	 * Select virtual server
	 *
	 * @method use
	 * @param {Number} sid
	 * @return {Promise} Resolves on success
	 */
	this.use = async (sid) => {
		this.server = sid
		return await sock.send('use', {
			sid
		})
	}

	/**
	 * Subscribe to event
	 *
	 * @method subscribe
	 * @param {String} event
	 * @example
	 * 	ts.subscribe('server')
	 * 	ts.subscribe('channel', 0)
	 * 	ts.subscribe('textprivate')
	 * @return {Promise} Resolves on success
	 */
	this.subscribe = async (event, uid) => {
		let data = { event }
		if(uid || uid == 0) {
			data = { event, id: uid }
		}
		return await sock.send('servernotifyregister', data)
	}

	/**
	 * Unsubscribes from all events
	 *
	 * @method unsubscribe
	 * @return {Promise} Resolves on success
	 */
	this.unsubscribe = async () => {
		return await sock.send('servernotifyunregister')
	}

	/**
	 * Sets server query client's name (ie for DMs and pokes)
	 *
	 * @method setName
	 * @param {String} name
	 * @return {Promise} Resolves on success
	 */
	this.setName = async (name) => {
		return await sock.send('clientupdate', {
			client_nickname: Utils.escape(name, true)
		})
	}

	/**
	 * Adds to the TS server's log
	 *
	 * @method log
	 * @param {String} msg 
	 * @param {Number} level=4
	 * @return {Promise} Resolves on success
	 */
	this.log = async (msg, level = 4) => {
		return await sock.send('logadd', {
			loglevel: level,
			logmsg: Utils.escape(msg)
		})
	}

	/**
	 * Sends a global message to the server
	 *
	 * @method gm
	 * @param {String} msg 
	 * @return {Promise} Resolves on success
	 */
	this.gm = async (msg) => {
		return await sock.send('gm', {
			msg: Utils.escape(msg)
		})
	}

	/**
	 * Fetches server network binding
	 *
	 * @method getBinding
	 * @private
	 * @return {Array} IPs
	 */
	this.getBinding = async () => {
		let bindings = await sock.send('bindinglist')

		if(bindings instanceof Object) {
			this.binding = [bindings.ip]
		} else {
			this.binding = bindings.map((binding) => {
				return binding.ip
			})
		}
		
		return this.binding
	}

	/**
	 * Fetches server channels
	 *
	 * @method getChannels
	 * @private
	 * @return {Channel[]} Channels
	 */
	this.getChannels = async () => {
		let channels = await sock.send('channellist')
		this.channels = channels.map((channel) => {
			return new Channel(this, channel)
		})
		return this.channels
	}

	/**
	 * Fetches server clients
	 *
	 * @method getClients
	 * @private
	 * @return {Client[]} Clients
	 */
	this.getClients = async () => {
		let clients = await sock.send('clientlist')

		clients.forEach(async (client) => {
			client = await this.cache.fetch(Const.CACHE_TYPE.CLIENT, client)
			let channel = this.channels.find((ch) => ch.cid == client.cid)

			client.channel = channel

			if(channel && channel.clients.indexOf(client) == -1) {
				channel.clients.push(client)
			}
		})

		return clients
	}

	/**
	 * Fetches self data
	 *
	 * @method whoAmI
	 * @return {Object} Self data
	 */
	this.whoAmI = async () => {
		let iam = await sock.send('whoami')
		this.clientID = iam.client_id
		return iam
	}

	/**
	 * Emitted when the serverquery is ready
	 *
	 * @event connected
	 */

	/**
	 * Emitted when the socket is ready
	 *
	 * @event sockConnected
	 */

	/**
	 * Emitted when a client connects to the server
	 *
	 * @event clientJoin
	 * @param {TS3Event} event
	 * @param {Client} event.client
	 */

	/**
	 * Emitted when a client disconnects from the server
	 *
	 * @event clientLeave
	 * @param {TS3Event} event
	 * @param {Client} event.client
	 */

	/**
	 * Emitted when a client changes channel
	 *
	 * @event clientMoved
	 * @param {TS3Event} event
	 * @param {Client} event.client
	 * @param {Channel} event.channel
	 * @param {Channel} event.from
	 */

	/**
	 * Emitted when a client sends a text message
	 *
	 * @event clientMessage
	 * @param {TS3Event} event
	 * @param {Client} event.client
	 * @param {String} event.message
	 */

	/**
	 * Emitted when a client sends a text message privately to you
	 *
	 * @event clientPrivateMessage
	 * @param {TS3Event} event
	 * @param {Client} event.client
	 * @param {String} event.message
	 */

	/**
	 * Emitted when the server sends a message
	 *
	 * @event serverMessage
	 * @param {TS3Event} event
	 * @param {Client} event.client
	 * @param {String} event.message
	 */

	/**
	 * Emitted when a client creates a channel
	 *
	 * @event channelCreate
	 * @param {TS3Event} event
	 * @param {Client} event.client
	 * @param {Channel} event.channel
	 */

	/**
	 * Emitted when a client deletes a channel
	 *
	 * @event channelDelete
	 * @param {TS3Event} event
	 * @param {Client} event.client
	 * @param {Channel} event.channel
	 */




}


require('util').inherits(TS3, require('events').EventEmitter)

module.exports = TS3