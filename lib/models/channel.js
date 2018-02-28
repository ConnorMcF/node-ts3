const Const = require('../const')
const Utils = require('../utils')

/**
 * Teamspeak channel
 *
 * @class Channel
 * @constructor
 */
let Channel = function(ts3, data) {
	/**
	 * Channel ID
	 *
	 * @property cid
	 * @type Number
	 */
	this.cid = data.cid
	/**
	 * Channel PID
	 *
	 * @property pid
	 * @type Number
	 */
	this.pid = data.pid
	/**
	 * Channel name
	 *
	 * @property name
	 * @type String
	 */
	this.name = data.channel_name
	/**
	 * Channel order
	 *
	 * @property order
	 * @type Number
	 */
	this.order = data.channel_order
	/**
	 * Channel subscribe power
	 *
	 * @property subscribePower
	 * @type Number
	 */
	this.subscribePower = data.channel_needed_subscribe_power

	/**
	 * Channel clients
	 *
	 * @property clients
	 * @type Clients[]
	 */
	this.clients = [] //ts3.clients.filter((client) => { return client.cid == this.cid })

	/**
	 * Channel raw data
	 *
	 * @property raw
	 * @type Object
	 */
	this.raw = null

	/**
	 * Subscribe to channel
	 *
	 * @method subscribe
	 * @return {Promise} Resolves on success
	 */
	this.subscribe = async () => {
		return await ts3.subscribe('channel', this.cid)
	}

	/**
	 * Re-orders channel
	 *
	 * @method move
	 * @param {Channel} parent
	 * @param {Number} sort
	 * @return {Promise} Resolves on success
	 */
	this.move = async (parent, sort) => {
		return await ts3._sock.send('channelmove', {
			cid: this.cid,
			cpid: parent.cid,
			order: (sort ? sort : undefined)
		})
	}

	/**
	 * Deletes channel
	 *
	 * @method delete
	 * @param {Boolean} force
	 * @return {Promise} Resolves on success
	 */
	this.delete = async (force) => {
		return await ts3._sock.send('channeldelete', {
			id: this.cid,
			force: (force ? 1 : 0)
		})
	}

	/**
	 * Updates channel
	 *
	 * @method update
	 * @return {Promise} Resolves on success
	 */
	this.update = async () => {
		let info = await ts3._sock.send('channelinfo', {
			cid: this.cid
		})

		this.cid = this.cid
		this.pid = info.pid
		this.name = info.channel_name
		this.order = info.channel_order
		this.subscribePower = info.channel_needed_subscribe_power

		this.clients = ts3.clients.filter((client) => { return client.cid == this.cid })

		this.raw = info

		return this.raw
	}
}

module.exports = Channel