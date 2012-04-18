function Game(gameBoard) {
	var gameBoard = gameBoard;
	var timerId;

	this.play = function() {
		timerId = setInterval(gameBoard.moveNext, 500);
	}

	this.pause = function() {
		clearInterval(timerId);
	}
}

function GameBoard(pieceGenerator) {
	var pieceGenerator = pieceGenerator;
	var pieceInPlay = new EmptyPiece();

	this.moveNext = function() {
		if(!isSettled(pieceInPlay)) {
			pieceInPlay.moveDown();
			checkForCompletedLines();
		}
		else {
			pieceInPlay = pieceGenerator.pop();
			pieceInPlay.moveToTop();			
		}
	}

	var isSettled = function(piece) {
		return !piece.canMoveDown(gameBoard);
	}

	var checkForCompletedLines = function() {
		
	}
}

function PieceGenerator() {
	this.pop = function() {
		return new LinePiece();
	}
}

function LinePiece() {
	this.moveToTop = function() {
		console.log("Line Piece moved to top");
	}

	this.moveDown = function() {
		console.log("Line Piece moved down");
	}

	this.canMoveDown = function(gameBoard) {
		return true;
	}
}

function EmptyPiece() {
	this.canMoveDown = function(gameBoard) {
		return false;
	}
}

var pieceGenerator = new PieceGenerator();
var gameBoard = new GameBoard(pieceGenerator);
var game = new Game(gameBoard);

var moveNext = function() {
	gameBoard.moveNext();
}

var play = function() {
	timerId = setInterval(moveNext, 500);
}

var pause = function() {
	clearInterval(timerId);
}

var playButton = document.getElementById('playButton');
var pauseButton = document.getElementById('pauseButton');

playButton.addEventListener('click', game.play);
pauseButton.addEventListener('click', game.pause);