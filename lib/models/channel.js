const Const = require('../const')
const Utils = require('../utils')

let Channel = function(ts3, data) {
	this.cid = data.cid
	this.pid = data.pid
	this.name = data.channel_name
	this.order = data.channel_order
	this.subscribePower = data.channel_needed_subscribe_power

	this.clients = [] //ts3.clients.filter((client) => { return client.cid == this.cid })

	this.raw = null

	this.subscribe = async () => {
		return await ts3.subscribe('channel', this.cid)
	}

	this.move = async (parent, sort) => {
		return await ts3._sock.send('channelmove', {
			cid: this.cid,
			cpid: parent.cid,
			order: (sort ? sort : undefined)
		})
	}

	this.delete = async (force) => {
		return await ts3._sock.send('channeldelete', {
			id: this.cid,
			force: (force ? 1 : 0)
		})
	}

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