const User = require('./models/user')

let Cache = function(ts3, conf) {
	this.enabled = true

	this.users = {}

	this.fetch = async (type, data) => {
		let clid = data.clid || data.invokerid
		data.clid = clid

		if(!this.users[clid]) {
			this.users[clid] = new User(ts3, data)
			await this.users[clid].update()
		}

		if(!this.users[clid].nick) {
			await this.users[clid].update()
		}

		return this.users[clid]
	}
}

module.exports = Cache