// partie serveur : Envoie les pages HTML au client web et au client mobile

var express = require('express');
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);

// lit les fichiers HTML a envoyer aux clients
var fs = require('fs');
var phone = fs.readFileSync('./phone.html');
var web = fs.readFileSync('./web.html');

// permet de detecter si PC ou mobile
var device = require('express-device');
// app.use(bodyParser());
app.use(device.capture());

// si on se connecte sur www.monsite.com
app.get('/', function(req, res) {
	// verifie le type d'appareil
	if (req.device.type === 'tablet' || req.device.type === 'phone')
		res.send(phone.toString());
	else
		res.send(web.toString());
});

// quand une connexion socket.io (communication temps réel) arrive
io.on('connection', function(socket)
{
	// quand un message de type 'gyro' arrrive
	socket.on('gyro', function(data) {
		// le renvoie à tous les autres clients connectés
		// (faudra le changer, avec le systeme de code de dadagafa pour les faire marche par paire)
		socket.broadcast.emit('gyro', data);
	});
})

server.listen(3000);