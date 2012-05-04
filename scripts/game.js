function Range(start, end) {
	var array = new Array();
	var index = 0;
	for(var i=start; i<end; i++)
		array[index] = i;
	return array;
}

//Input Controller
function InputController(game) {
	this.game = game;
	this.functionMapping = {
		37:game.movePieceLeft,
		38:game.rotatePiece,
		39:game.movePieceRight,
		40:game.movePieceDown,
	};
}
InputController.prototype.handleKeyPress = function(e) {
	var e = window.event || e
	var key = e.charCode || e.keyCode

	if(this.functionMapping[key] != undefined)
		this.functionMapping[key]();
}
InputController.prototype.play = function(window) {
	game.play(window);
}
InputController.prototype.pause = function(window) {
	game.pause(window);
}

//Pieces
function LinePiece() {

}
LinePiece.prototype.moveLeft = function() {
	console.log("Moved Left");
}
LinePiece.prototype.moveRight = function() {
	console.log("Moved Right");
}
LinePiece.prototype.moveDown = function() {
	console.log("Moved Down");
}
LinePiece.prototype.rotate = function() {
	console.log("Rotated");
}

//Units
function EmptyUnit() {

}

//Board
function Board() {
	this.units = new Range(0, 19).map(function(x) { return new Range(0, 9).map(function(y) { return new EmptyUnit() }) });
}

//Game
function Game(board) {
	this.board = board;
	this.pieceInPlay = new LinePiece();
	this.timerId;
}
Game.prototype.movePieceLeft = function() {
	this.pieceInPlay.moveLeft();
}
Game.prototype.movePieceRight = function() {
	this.pieceInPlay.moveRight();
}
Game.prototype.movePieceDown = function() {
	this.pieceInPlay.moveDown();
}
Game.prototype.rotatePiece = function() {
	this.pieceInPlay.rotate();
}
Game.prototype.play = function(window) {
	var $this = this;
	this.timerId = window.setInterval(function() { $this.movePieceDown() }, 500);
}
Game.prototype.pause = function(window) {
	window.clearInterval(this.timerId);
}

//BoardRenderer
function BoardRenderer() {}
BoardRenderer.prototype.render = function(board) {

}

var board = new Board();
var game = new Game(board);
var inputController = new InputController(game);

var playButton = document.getElementById('playButton');
var pauseButton = document.getElementById('pauseButton');
var window = this;

playButton.addEventListener('click', function() { inputController.play(window) });
pauseButton.addEventListener('click', function() { inputController.pause(window) });
document.addEventListener('keydown', inputController.handleKeyPress);