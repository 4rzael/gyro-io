'use strict';

// partie serveur : Envoie les pages HTML au client web et au client mobile

// protocole socket.io:
//	initialisation :
//		web => serveur :
//			topic : web-sync
//		serveur => web :
//			topic : sync-num
//			payload : Number : syncNumber
//		phone => serveur :
//			topic : phone-sync
//			payload : Number : syncNumber
//		serveur => phone :
//			topic : sync
//			payload : Boolean : success
//		serveur => web :
//			topic : sync
//	boucle :
//		phone => serveur :
//			topic : gyro
//			payload : {acceleration: {x, y, z}, rotationRate: {x, y, z}} : data
//		serveur => web :
//			topic : gyro
//			payload : {acceleration: {x, y, z}, rotationRate: {x, y, z}} : data
//	deconnexion :
//		serveur => web :
//			topic : disconnection

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

// attribue à un code de synchro un client web (PC)
// Int => Socket
var syncSockets = {};

// quand une connexion socket.io (communication temps réel) arrive
io.on('connection', function (socket) {
	var syncNumber = undefined;

	// When a web client asks for a synchronisation number
	socket.on('web-sync', function () {
		syncNumber = generateSyncNumber();
		syncSockets[syncNumber] = socket;
		socket.emit('sync-num', syncNumber)
	});

	// When a phone client sends his synchronisation number
	socket.on('phone-sync', function (number) {
		number = parseInt(number, 10);
		// check that it is a number
		if (typeof number !== 'number') {
			console.log('error in sync number : not a number : ' + typeof number);
			return ;
		}

		// check that a web client asked for this sync number
		if (syncSockets[number] !== undefined) {
			syncNumber = number;
			socket.emit('sync', true);
			syncSockets[number].emit('sync');
		}
		else {
			socket.emit('sync', false)
		}
	});

	// quand un message de type 'gyro' arrrive
	socket.on('gyro', function (data) {
		if (syncNumber !== undefined &&
				syncSockets[syncNumber] !== undefined) {
			syncSockets[syncNumber].emit('gyro', data);
		}
	});

	// quand un client (web ou portable) se déconnecte
	socket.on('disconnect', function () {
		// s'il est synchronisé
		if (syncNumber !== undefined) {
			if (syncSockets[syncNumber]) {
				// prévient le client web associé
				syncSockets[syncNumber].emit('disconnection');
			}
			syncSockets[syncNumber] = undefined;
		}
	});
})

server.listen(3000);

// génère un nouveau nombre de synchronisation aléatoire unique
function generateSyncNumber() {
	var num;
	do {
		num = Math.floor(Math.random() * 100000); // nombre de 0 à 99999
	} while (syncSockets[num] != undefined);
	return num;
}
