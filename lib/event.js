let TS3Event = function(type, data) {
	this.type = type
	
	Object.keys(data).forEach((key) => {
		this[key] = data[key]
	})
}

module.exports = TS3Event