// partie serveur : Envoie les pages HTML au client web et au client mobile

var express = require('express');
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);

// récupère le nom complet du sous-dossier public/
var path = require('path');
var publicFolder = path.join(__dirname, 'public');

// toutes les requêtes à des fichiers (html, js, css, etc) iront les chercher dans le dossier public
app.use(express.static(publicFolder));

// permet de detecter si PC ou mobile
var device = require('express-device');
app.use(device.capture());

// si on se connecte sur www.monsite.com/
app.get('/', function(req, res) {
	// verifie le type d'appareil
	if (req.device.type === 'tablet' || req.device.type === 'phone') {
		res.redirect('phone.html');
	}

	else {
		res.redirect('web.html');
	}
});

// quand une connexion socket.io (communication temps réel) arrive
io.on('connection', function(socket)
{
	// quand un message de type 'gyro' arrrive
	socket.on('gyro', function(data) {
		// le renvoie à tous les autres clients connectés
		// (faudra le changer, avec le systeme de code de dadagafa pour les faire marcher par paire)
		socket.broadcast.emit('gyro', data);
	});
})

server.listen(3000);
