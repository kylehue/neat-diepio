let neat;
let useTrainedData = true;
let debugMode = false;


//Matter
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;
const Engine = Matter.Engine;
const engine = Engine.create();
const World = Matter.World;
const world = engine.world;
world.gravity.scale = 0;

let game;

function setup() {
	createCanvas(innerWidth, innerHeight);
	game = new Game();
	neat = new Neat(3, 2, 5, {
		populationSize: game.playerCount,
		mutationRate: 0,
		warnings: false
	});

	if (useTrainedData) {
		let genomes = neat.fromJSON(training);
		genomes.sort((a, b) => b.fitness - a.fitness);
		genomes.splice(round(genomes.length / 2));
		neat.import(genomes, 30, false)
	}

	Events.on(engine, "collisionActive", function(event) {
		for (let pair of event.pairs) {
			if (pair.bodyA.self instanceof Player && pair.bodyB.self instanceof Map) {
				if (!debugMode) pair.bodyA.self.dispose();
			} else if (pair.bodyB.self instanceof Player && pair.bodyA.self instanceof Map) {
				if (!debugMode) pair.bodyB.self.dispose();
			}
		}
	});

	for (var i = 0; i < neat.population.genomes.length; i++) {
		let genome = neat.population.genomes[i];
		game.players.push(new Player(genome));
	}

	for (var i = 0; i < game.map.size / 8; i++) {
		game.squares.push(new Square());
	}
}

function draw() {
	background(Game.Config.background);
	fill(255);
	stroke(255);
	game.render();
	Engine.update(engine);
	game.update();
}

function windowResized() {
	resizeCanvas(innerWidth, innerHeight)
}