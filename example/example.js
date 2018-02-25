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
		ts.subscribe('channel', 1)
		ts.subscribe('textprivate')
	})

ts.on('clientJoin', (ev) => {
	console.log('joined', ev)
	ev.user.message('Hello world!')
})

ts.on('clientLeave', (ev) => {
	console.log('left', ev)
})

ts.on('clientMove', (ev) => {
	console.log('moved', ev)
})

ts.on('clientMessage', (ev) => {
	console.log('msg', ev)
})

ts.on('clientPrivateMessage', (ev) => {
	console.log('private msg', ev)

	if(ev.message == '.test') {
		ev.user.message('what a nice command')
	}

	if(ev.message == '.moveme') {
		ev.user.message('sure')
		ev.user.move(ts.channels.find(ch => ch.name == 'a channel'))
	}

	if(ev.message == '.pokeme') {
		ev.user.message('sure')
		ev.user.poke('there you go')
	}

	if(ev.message.substr(0, 4) == '.gm ') {
		ts.gm(ev.message.substr(4))
	}
})