function Range(start, end) {
	var array = new Array();
	var index = 0;
	for(var i=start; i<=end; i++)
		array[index++] = i;
	return array;
}

//Input Controller
function InputController(game) {
	this.game = game;
	this.functionMapping = {
		37:function() { game.movePieceLeft() },
		38:function() { game.rotatePiece() },
		39:function() { game.movePieceRight() },
		40:function() { game.movePieceDown() },
	};
}
InputController.prototype.handleKeyPress = function(e) {
	var e = window.event || e
	var key = e.charCode || e.keyCode

	if(this.functionMapping[key] !== undefined)
		this.functionMapping[key]();
}
InputController.prototype.play = function(window) {
	game.play(window);
}
InputController.prototype.pause = function(window) {
	game.pause(window);
}

//Pieces
function LinePiece(startingPoint) {
	this.point = startingPoint;
	this.representations = [[new Point(0, 0), new Point(0, -1), new Point(0, -2), new Point(0, -3)],
							[new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0)]];
	this.timesRotated = 0;
}
LinePiece.prototype.moveLeft = function() {
	this.point = new Point(this.point.x - 1, this.point.y);
}
LinePiece.prototype.moveRight = function() {
	this.point = new Point(this.point.x + 1, this.point.y);
}
LinePiece.prototype.moveDown = function() {
	this.point = new Point(this.point.x, this.point.y + 1);
}
LinePiece.prototype.rotate = function() {
	this.timesRotated++;
}
LinePiece.prototype.move = function(point) {
	this.point = point;
}
LinePiece.prototype.getUnits = function() {
	var $this = this;
	var currentRepresentation = this.representations[this.timesRotated % this.representations.length];
	return currentRepresentation.map(function(point) {
		var unit = new LineUnit();
		unit.point = point.translate($this.point);
		return unit;
	});
}

//Point
function Point(x, y) {
	this.x = x;
	this.y = y;
}
Point.prototype.translate = function(point) {
	return new Point(this.x + point.x, this.y + point.y);
}
Point.prototype.equals = function(point) {
	return point.x === this.x && point.y === this.y;
}

//Units
function EmptyUnit() { }
EmptyUnit.prototype.isEmpty = function() { return true; }

function LineUnit() { }
LineUnit.prototype.isEmpty = function() { return false; }

//Board
function Board(width, height) {
	this.width = width;
	this.height = height;
	this.units = new Range(0, height-1).map(function(x) {
		return new Range(0, width-1).map(function(y) {
			return new EmptyUnit()
		})
	});
}
Board.prototype.getUnits = function() {
	var x, y = 0;
	return this.units.map(function(line) {
		x = 0;
		var lineUnits = line.map(function(unit) {
			unit.point = new Point(x++, y);
			return unit;
		});
		y++;
		return lineUnits;
	}).reduce(function(first, second) { return first.concat(second); });
}
Board.prototype.addPiece = function(piece) {
	var board = this;
	piece.getUnits().forEach(function(unit) { board.units[unit.point.y][unit.point.x] = unit })
}
Board.prototype.clearLines = function() {
	var board = this;
	while(this.hasCompletedLine()) {
		this.removeLine(this.getCompletedLine());
	}
}
Board.prototype.hasCompletedLine = function() {
	return this.units.some(function(line) { return line.every(function(unit) { return !unit.isEmpty() }) });
}
Board.prototype.getCompletedLine = function() {
	return this.units.filter(function(line) { return line.every(function(unit) { return !unit.isEmpty() }) })[0];
}
Board.prototype.removeLine = function(line) {
	var board = this;
	var lineIndex = this.units.indexOf(line);

	for(var i=lineIndex; i>=1; i--) {
		this.moveLineDown(this.units[i]);
	}

	for(var i=0; i<this.units[0].length; i++) {
		this.units[0][j] = new EmptyUnit();
	}
}
Board.prototype.moveLineDown = function(line) {
	var lineIndex = this.units.indexOf(line);

	for(var j=0; j<this.units[lineIndex].length; j++) {
		this.units[lineIndex][j] = this.units[lineIndex-1][j];
	}
}

//Game
function Game(board, hitDetector, pieceGenerator) {
	this.startingPoint = new Point(3, 0);
	this.board = board;
	this.hitDetector = hitDetector;
	this.pieceGenerator = pieceGenerator;
	this.pieceInPlay;
	this.timerId;
	this.move = function() { };

	this.playNewPiece();
}
Game.prototype.movePieceLeft = function() {
	this.movePiece(function(piece) { piece.moveLeft() });
}
Game.prototype.movePieceRight = function() {
	this.movePiece(function(piece) { piece.moveRight() });
}
Game.prototype.movePieceDown = function() {
	if(this.hitDetector.canMove(this.pieceInPlay, this.board, function(piece) { piece.moveDown() })) {
		this.pieceInPlay.moveDown();
		this.move();
	}
	else {
		this.settleCurrentPiece();
	}
}
Game.prototype.rotatePiece = function() {
	this.movePiece(function(piece) { piece.rotate() });
}
Game.prototype.movePiece = function(movement) {
	if(this.hitDetector.canMove(this.pieceInPlay, this.board, movement)) {
		movement(this.pieceInPlay);
		this.move();
	}
}
Game.prototype.settleCurrentPiece = function() {
	this.board.addPiece(this.pieceInPlay);
	this.board.clearLines();
	this.playNewPiece();
}
Game.prototype.playNewPiece = function() {
	this.pieceInPlay = this.pieceGenerator.pop();
	this.pieceInPlay.move(this.startingPoint);
}
Game.prototype.play = function(window) {
	var $this = this;
	this.timerId = window.setInterval(function() { $this.movePieceDown() }, 500);
}
Game.prototype.pause = function(window) {
	window.clearInterval(this.timerId);
}

//PieceGenerator
function PieceGenerator() {}
PieceGenerator.prototype.pop = function() {
	return new LinePiece();
}

//HitDetector
function HitDetector() {}
HitDetector.prototype.canMove = function(piece, board, movement) {
	var clonedPiece = jQuery.extend(true, {}, piece);
	movement(clonedPiece);

	if(!this.isInBounds(clonedPiece, board))
		return false;

	return clonedPiece.getUnits().every(function(pieceUnit) {
		return board.getUnits().every(function(boardUnit) {
			return !pieceUnit.point.equals(boardUnit.point) || boardUnit.isEmpty();
		});
	});
}
HitDetector.prototype.isInBounds = function(piece, board) {
	return piece.getUnits().every(function(pieceUnit) {
		return pieceUnit.point.x < board.width && pieceUnit.point.x >= 0 && pieceUnit.point.y < board.height;
	});
}

//Renderers
function GameRenderer(game, unitRenderers) {
	this.unitRenderers = unitRenderers;
	this.game = game;

	this.game.tick = function() { this.render(); };
}
GameRenderer.prototype.renderItem = function(itemToRender) {
	var $this = this;
	itemToRender.getUnits().forEach(function(unit) {
		var renderer = $this.unitRenderers.filter(function(renderer) { return renderer.canRender(unit); })[0];
		if(renderer === undefined)
			throw { name: "Missing Unit Renderer", message: "No renderer for unit [" + unit + "]" };

		renderer.render(unit);
	});
}
GameRenderer.prototype.render = function() {
	this.renderItem(this.game.board);
	this.renderItem(this.game.pieceInPlay);
}

function GenericUnitRenderer(canRender, className) {
	this.canRender = canRender;
	this.className = className;
}
GenericUnitRenderer.prototype.render = function(unit) {
	var className = "col" + (unit.point.x + 1);
	var cell = $("#row" + (unit.point.y + 1)).find("." + className);
	
	cell.removeClass();
	cell.addClass(className);
	cell.addClass(this.className);;
}

//Initialization
var board = new Board(10, 20);
var pieceGenerator = new PieceGenerator();
var game = new Game(board, new HitDetector(), pieceGenerator);
var inputController = new InputController(game);
var renderer = new GameRenderer(game, [new GenericUnitRenderer(function(unit) { return unit.isEmpty() }, "empty"), new GenericUnitRenderer(function(unit) { return !unit.isEmpty() }, "line")]);
game.move = function() { renderer.render() };

var playButton = document.getElementById('playButton');
var pauseButton = document.getElementById('pauseButton');
var window = this;

playButton.addEventListener('click', function() { inputController.play(window) });
pauseButton.addEventListener('click', function() { inputController.pause(window) });
document.addEventListener('keydown', inputController.handleKeyPress.bind(inputController));