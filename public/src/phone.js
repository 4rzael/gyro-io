'use strict';

// etablit une connexion temps réel
var socket = io();
var syncNumber = undefined;

var gyroDataToSend = undefined;

// s'il y a un gyroscope/accelerometre
if (window.DeviceMotionEvent !== undefined) {
	// quand le portable bouge :
	window.ondevicemotion = function(e) {
  	// si non-connecté, ne rien faire
  	if (syncNumber === undefined)
  		return;

    gyroDataToSend = e;
  };
  // envoie les données du gyroscope jusqu'a 10x par seconde
  // (limite pour éviter une trop grand consomation de données)
  // (et encore, c'est beaucoup)
  setInterval(function () {
    if (gyroDataToSend !== undefined) {
      // envoie les infos au serveur via un message de "type" 'gyro'.
      socket.emit('gyro',
        {
          acceleration: {
            x: gyroDataToSend.accelerationIncludingGravity.x,
            y: gyroDataToSend.accelerationIncludingGravity.y,
            z: gyroDataToSend.accelerationIncludingGravity.z
          },
          rotationRate: gyroDataToSend.rotationRate ? {
            alpha: gyroDataToSend.rotationRate.alpha,
            beta: gyroDataToSend.rotationRate.alpha,
            gamma: gyroDataToSend.rotationRate.alpha
          } : undefined
        });
    }
    gyroDataToSend = undefined;
  }, 100);

}

// envoie le code de synchronisation
function sendSyncNumber() {
	var num = document.getElementById("syncNumber").value;

	if (num !== undefined)
		socket.emit('phone-sync', num);
}

// validation de la synchronisation (ou erreur)
socket.on('sync', function (succeed) {
	if (succeed) {
		syncNumber = document.getElementById("syncNumber").value;
	}
	else {
		alert('error while synchronising. Did you enter the good code ?')
	}
});
