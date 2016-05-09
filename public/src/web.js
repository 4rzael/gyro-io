'use strict';

// des variables pour bouger la sphère (accéleration, vitesse, position)
var x = 0, y = 0,
    vx = 0, vy = 0,
	ax = 0, ay = 0;

// établit une connexion temps réel avec le serveur
var socket = io();

var sphere = document.getElementById("sphere");

// quand un message de type 'gyro' arrive depuis le serveur
socket.on('gyro', function (data) {
	// récupère et affiche les données
	ax = data.acceleration.x * 5;
	ay = data.acceleration.y * 5;
	document.getElementById("accelerationX").innerHTML = data.acceleration.x;
	document.getElementById("accelerationY").innerHTML = data.acceleration.y;
	document.getElementById("accelerationZ").innerHTML = data.acceleration.z;

	if ( data.rotationRate ) {
		document.getElementById("rotationAlpha").innerHTML = data.rotationRate.alpha;
		document.getElementById("rotationBeta").innerHTML = data.rotationRate.beta;
		document.getElementById("rotationGamma").innerHTML = data.rotationRate.gamma;
	}
});

// reçoit le code de synchronisation à afficher
socket.on('sync-num', function (num) {
	document.getElementById("mainText").innerHTML =
	"Connectez vous avec votre portable puis entrez ce code de synchronisation : " +
	num;
});

// quand la synchronisation est effectuée
socket.on('sync', function () {
	document.getElementById("mainText").innerHTML =
	"synchronisation effectuée avec succès. Amusez vous bien ;)";
})

// quand le portable se déconnecte
socket.on('disconnection', function () {
  document.getElementById("mainText").innerHTML =
  "portable déconnecté";
  ax = 0;
  ay = 0;
  vx = 0;
  vy = 0;
})

// demande un code de synchronisation
socket.emit('web-sync');

// bouge la balle (40 fois par secondes)
setInterval( function() {
	var landscapeOrientation = window.innerWidth/window.innerHeight > 1;
	if ( landscapeOrientation) {
		vx = vx + ay;
		vy = vy + ax;
	} else {
		vy = vy - ay;
		vx = vx + ax;
	}
	vx = vx * 0.98;
	vy = vy * 0.98;
	y = parseInt(y + vy / 50);
	x = parseInt(x + vx / 50);

	boundingBoxCheck();

	sphere.style.top = y + "px";
	sphere.style.left = x + "px";

}, 25);

// fait rebondir la balle sur les bords
function boundingBoxCheck(){
	if (x<0) { x = 0; vx = -vx; }
	if (y<0) { y = 0; vy = -vy; }
	if (x>document.documentElement.clientWidth-20) { x = document.documentElement.clientWidth-20; vx = -vx; }
	if (y>document.documentElement.clientHeight-20) { y = document.documentElement.clientHeight-20; vy = -vy; }

}
