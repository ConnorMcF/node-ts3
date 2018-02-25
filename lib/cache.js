const User = require('./models/user')

let Cache = function(ts3, conf) {
	this.enabled = true

	this.users = {}

	this.fetch = async (type, data) => {
		console.log('fetch data', data)
		if(!this.users[data.clid]) {
			this.users[data.clid] = new User(ts3, data)
			await this.users[data.clid].update()
		}
		return this.users[data.clid]
	}
}

module.exports = Cache