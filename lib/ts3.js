const TS3Sock = require('./sock')
const Utils = require('./utils')
const Handlers = require('./handlers')

const Const = require('./const')
const Cache = require('./cache')
const Channel = require('./models/channel')

let TS3 = function(conf) {
	let sock = new TS3Sock(this, conf)
	this._sock = sock

	this.server = null

	this.binding = null

	this.clientID = null

	this.clients = []
	this.channels = []

	this.cache = new Cache(this, conf)

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

	this.deauth = async () => {
		await sock.send('logout')
	}

	this.quit = async () => {
		await sock.send('quit')
	}

	this.use = async (sid) => {
		this.server = sid
		return await sock.send('use', {
			sid
		})
	}

	this.subscribe = async (event, uid) => {
		let data = { event }
		if(uid || uid == 0) {
			data = { event, id: uid }
		}
		return await sock.send('servernotifyregister', data)
	}

	this.unsubscribe = async () => {
		return await sock.send('servernotifyunregister')
	}

	this.setName = async (name) => {
		return await sock.send('clientupdate', {
			client_nickname: Utils.escape(name, true)
		})
	}

	this.log = async (msg, level = 4) => {
		return await sock.send('logadd', {
			loglevel: level,
			logmsg: Utils.escape(msg)
		})
	}

	this.gm = async (msg) => {
		return await sock.send('gm', {
			msg: Utils.escape(msg)
		})
	}

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

	this.getChannels = async () => {
		let channels = await sock.send('channellist')
		this.channels = channels.map((channel) => {
			return new Channel(this, channel)
		})
		return this.channels
	}

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

	this.whoAmI = async () => {
		let iam = await sock.send('whoami')
		this.clientID = iam.client_id
		return iam
	}


}


require('util').inherits(TS3, require('events').EventEmitter)

module.exports = TS3