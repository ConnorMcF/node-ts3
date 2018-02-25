const Const = require('../const')
const Utils = require('../utils')

const durationParse = require('parse-duration')

let User = function(ts3, data) {
	this.clid = data.clid || data.invokerid
	this.uuid = data.client_unique_identifier || data.invokeruid
	this.nick = data.client_nickname || data.invokername
	this.meta = data.client_meta_data

	this.raw = data

	this.message = async (msg) => {
		return await ts3._sock.send('sendtextmessage', {
			targetmode: Const.TEXTMSG_TARGET_MODE.CLIENT,
			target: this.clid,
			msg: Utils.escape(msg, true)
		})
	}

	this.poke = async (msg) => {
		return await ts3._sock.send('clientpoke', {
			clid: this.clid,
			msg: Utils.escape(msg, true)
		})
	}

	this.move = async (channel) => {
		return await ts3._sock.send('clientmove', {
			clid: this.clid,
			cid: channel.cid
		})
	}

	this.banUID = async (reason, duration = -1) => {
		duration = durationParse(duration)

		return await ts3._sock.send('banadd', {
			uid: this.uid,
			banreason: Utils.escape(reason, true),
			time: (duration == 0 ? undefined : duration)
		})
	}

	this.banIP = async (reason, duration = -1) => {
		duration = durationParse(duration)

		if(!this.raw.connection_client_ip) {
			await this.update()
		}

		return await ts3._sock.send('banadd', {
			ip: this.raw.connection_client_ip,
			banreason: Utils.escape(reason, true),
			time: (duration == 0 ? undefined : duration)
		})
	}

	this.update = async () => {
		let info = await ts3._sock.send('clientinfo', {
			clid: this.clid
		})

		this.clid = data.clid
		this.uuid = data.client_unique_identifier
		this.nick = data.client_nickname
		this.meta = data.client_meta_data

		this.raw = data

		return this.raw
	}
}

module.exports = User