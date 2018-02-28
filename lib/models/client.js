const Const = require('../const')
const Utils = require('../utils')

const durationParse = require('parse-duration')

/**
 * Teamspeak client
 *
 * @class Client
 * @constructor
 */
let Client = function(ts3, data) {
	/**
	 * Client ID
	 *
	 * @property clid
	 * @type Number
	 */
	this.clid = data.clid || data.invokerid
	/**
	 * Client UUID
	 *
	 * @property uuid
	 * @type String
	 */
	this.uuid = data.client_unique_identifier || data.invokeruid
	/**
	 * Client nickname
	 *
	 * @property nick
	 * @type String
	 */
	this.nick = data.client_nickname || data.invokername
	/**
	 * Client metadata
	 *
	 * @property meta
	 * @type String
	 */
	this.meta = data.client_meta_data
	/**
	 * Client platform
	 *
	 * @property platform
	 * @type String
	 */
	this.platform = data.client_platform

	/**
	 * Is serverquery?
	 *
	 * @property serverquery
	 * @type Boolean
	 */
	this.serverquery = (data.client_platform == 'ServerQuery')

	/**
	 * Channel ID
	 *
	 * @property cid
	 * @type Number
	 */
	this.cid = data.cid
	/**
	 * Channel
	 *
	 * @property channel
	 * @type Channel
	 */
	this.channel = ts3.channels.find((ch) => ch.cid == this.cid)

	/**
	 * Client IP
	 *
	 * @property ip
	 * @type String
	 */
	this.ip = data.connection_client_ip

	/**
	 * Client raw data
	 *
	 * @property raw
	 * @type Object
	 */
	this.raw = data

	/**
	 * Sends client private message
	 *
	 * @method message
	 * @param {String} msg
	 * @return {Promise} Resolves on success
	 */
	this.message = async (msg) => {
		return await ts3._sock.send('sendtextmessage', {
			targetmode: Const.TEXTMSG_TARGET_MODE.CLIENT,
			target: this.clid,
			msg: Utils.escape(msg, true)
		})
	}

	/**
	 * Pokes client with message
	 *
	 * @method poke
	 * @param {String} msg
	 * @return {Promise} Resolves on success
	 */
	this.poke = async (msg) => {
		return await ts3._sock.send('clientpoke', {
			clid: this.clid,
			msg: Utils.escape(msg, true)
		})
	}

	/**
	 * Moves client to another channel
	 *
	 * @method move
	 * @param {Channel} channel
	 * @return {Promise} Resolves on success
	 */
	this.move = async (channel) => {
		return await ts3._sock.send('clientmove', {
			clid: this.clid,
			cid: channel.cid
		})
	}

	/**
	 * Bans client by their UUID
	 *
	 * @method banUID
	 * @param {String} reason
	 * @param {String} duration
	 * @return {Promise} Resolves on success
	 */
	this.banUID = async (reason, duration = -1) => {
		duration = durationParse(duration)

		return await ts3._sock.send('banadd', {
			uid: this.uid,
			banreason: Utils.escape(reason, true),
			time: (duration == 0 ? undefined : duration)
		})
	}

	/**
	 * Bans client by their IP
	 *
	 * @method banUID
	 * @param {String} reason
	 * @param {String} duration
	 * @return {Promise} Resolves on success
	 */
	this.banIP = async (reason, duration = -1) => {
		duration = durationParse(duration)

		if(!this.raw.connection_client_ip) {
			return Promise.reject('IP unknown')
		}

		return await ts3._sock.send('banadd', {
			ip: this.raw.connection_client_ip,
			banreason: Utils.escape(reason, true),
			time: (duration == 0 ? undefined : duration)
		})
	}

	/**
	 * Updates client
	 *
	 * @method update
	 * @return {Promise} Resolves on success
	 */
	this.update = async () => {
		let info = await ts3._sock.send('clientinfo', {
			clid: this.clid
		})

		this.clid = this.clid
		this.uuid = info.client_unique_identifier
		this.nick = info.client_nickname
		this.meta = info.client_meta_data
		this.platform = info.client_platform

		this.serverquery = (info.client_platform == 'ServerQuery')

		this.cid = info.cid

		this.ip = info.connection_client_ip

		// this.raw = info

		return this
	}
}

module.exports = Client