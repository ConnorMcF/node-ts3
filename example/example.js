const TS3 = require('../index') // require('ts3')

const ts = new TS3({
	debug: true
})

ts.connect('127.0.0.1', 10011)
	.then(async () => {
		let auth = await ts.auth('serveradmin', 'supersecret', 1)
		console.log('authed', auth)

		ts.setName('node-ts3')

		ts.subscribe('server')
		ts.subscribe('channel', 0)
		ts.subscribe('textprivate')

		console.log(ts.clients)
	})

ts.on('clientJoin', (ev) => {
	console.log('joined', ev)
	ev.client.message('Hello world!')
})

ts.on('clientLeave', (ev) => {
	console.log('left', ev)
})

ts.on('clientMove', (ev) => {
	console.log('moved', ev.channel)
	console.log(ts.channels)
})

ts.on('clientMessage', (ev) => {
	console.log('msg', ev)
})

ts.on('clientPrivateMessage', (ev) => {
	console.log('private msg', ev)

	if(ev.message == '.test') {
		ev.client.message('what a nice command')
	}

	if(ev.message == '.moveme') {
		ev.client.message('sure')
		ev.client.move(ts.channels.find(ch => ch.name == 'a channel'))
	}

	if(ev.message == '.pokeme') {
		ev.client.message('sure')
		ev.client.poke('there you go')
	}

	if(ev.message.substr(0, 4) == '.gm ') {
		ts.gm(ev.message.substr(4))
	}
})