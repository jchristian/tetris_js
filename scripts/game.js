var play = function() {
	console.log("Playing!");
}

var pause = function() {
	console.log("Paused!");
}

var playButton = document.getElementById('playButton');
var pauseButton = document.getElementById('pauseButton');

playButton.addEventListener('click', play);
pauseButton.addEventListener('click', pause);