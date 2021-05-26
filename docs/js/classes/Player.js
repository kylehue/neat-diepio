class Player {
	constructor(brain) {
		this.brain = brain;
		let position = createVector(random(-game.map.size / 2, game.map.size / 2), random(-game.map.size / 2, game.map.size / 2));
		this.radius = 15;

		this.body = Bodies.circle(position.x, position.y, this.radius, {
			self: this,
			density: 0.3,
			friction: 0.1,
			frictionAir: 0.03,
			restitution: 0
		});

		World.add(world, this.body);

		this.acceleration = 0.3;
		this.speed = 3;
		this.health = 100;
		this.healthBarOpacity = 0;
		let colors = [{
			fill: "#f25972",
			stroke: "#e6405b"
		},{
			fill: "#59f2ac",
			stroke: "#38ed9a"
		},{
			fill: "#da4bf4",
			stroke: "#d532f3"
		},{
			fill: "#394454",
			stroke: "#303b4b"
		}];
		let color = random(colors);
		this.defaultColor = color.fill;
		this.color = color.fill;
		this.defaultStroke = color.stroke;
		this.stroke = color.stroke;

		this.gun = new Gun(this);

		//Fitness calculation
		this.score = 0;
		this.lifespan = 0;
		this.totalHits = 0.01;
		this.totalFires = 0.01;
	}

	render() {
		//For stroke
		fill(this.stroke);
		noStroke();
		beginShape();
		circle(this.body.position.x, this.body.position.y, this.radius * 2)
		endShape();

		//Inner color
		fill(this.color);
		beginShape();
		circle(this.body.position.x, this.body.position.y, this.radius * 1.6)
		endShape();

		//Health bar
		let width = this.radius * 3;
		fill(215, 50, 90, this.healthBarOpacity);
		beginShape();
		rect(this.body.position.x - width / 2, this.body.position.y - this.radius - 10, width, 5);
		endShape();
		fill(0, 255, 176, this.healthBarOpacity);
		beginShape();
		let widthHealth = map(this.health, 0, 100, 0, width);
		widthHealth = constrain(widthHealth, 0, width);
		rect(this.body.position.x - width / 2, this.body.position.y - this.radius - 10, widthHealth, 5);
		endShape();

		//Hide health bar with transition
		if (this.healthBarOpacity > 0) {
			this.healthBarOpacity -= 2;
		}
	}

	checkControls() {
		if (keyIsDown(87)) this.moveUp();
		if (keyIsDown(83)) this.moveDown();
		if (keyIsDown(65)) this.moveLeft();
		if (keyIsDown(68)) this.moveRight();
		if (this == game.players[0]) {
			if (mouseIsPressed) this.gun.shoot()
		} else {
			if (keyIsDown(70)) this.gun.rotation += 0.008;
			if (keyIsDown(71)) this.gun.rotation -= 0.008;
			if (keyIsDown(32)) this.gun.shoot();
			//else this.gun.shootCount = 0;
		}
	}

	think() {
		let outputs = this.brain.feedforward(this.getInputs());
		if (outputs[0] < 0.5) {
			this.moveUp();
		} else {
			this.moveDown();
		}

		if (outputs[1] < 0.5) {
			this.moveLeft();
		} else {
			this.moveRight();
		}


		if (outputs[2] < 0.5) {
			this.gun.rotation += 0.15;
		}

		if (outputs[3] < 0.5) {
			this.gun.rotation -= 0.15;
		}

		if (outputs[4] < 0.5) {
			this.gun.shoot();
		}
	}

	calculateFitness() {
		let fitness = this.score;
		fitness += this.lifespan;
		fitness *= this.totalHits;
		this.brain.fitness = fitness;
	}

	update() {
		this.lifespan += 0.001;
		if (!debugMode && this.health < 100) this.health += 0.2;
		this.gun.update();
		//Change back to normal color
		this.color = this.defaultColor;
		this.stroke = this.defaultStroke;

		//D E A T H
		if (this.health <= 0) {
			this.dispose();
		}

		//Check if this player is good enough to be the best player
		if (game.bestPlayer) {
			game.bestPlayer = this.brain.fitness > game.bestPlayer.brain.fitness ? this : game.bestPlayer;
		}


		if (this == game.players[0]) {
			this.checkControls();
			this.defaultColor = "#3a84ff";
			this.defaultStroke = "#186fff";
			let mouse = game.camera.screenToWorld(mouseX, mouseY);
			this.gun.angle = Math.atan2(mouse.y - this.body.position.y, mouse.x - this.body.position.x);
			//this.health = 100;
		} else {
			//Think
			if (!debugMode) this.think();
		}


		//Check collisions
		this.checkBulletCollision();
		this.checkPlayerCollision();

		if (debugMode) {
			if (this == game.players[0]) {
				this.checkControls();
				let inputs = this.getInputs()
				if (frameCount % 50 == 0) {
					//console.log(inputs);
				}
			}
		}
	}

	updateQuadtree() {
		for (let bullet of this.gun.bullets) {
			bullet.addToQuadtree();
		}
		this.addToQuadtree();
	}

	checkBulletCollision() {
		//Retrieve from quadtree
		let objects = game.map.quadtree.retrieve({
			x: this.body.position.x - this.radius,
			y: this.body.position.y - this.radius,
			width: this.radius * 2,
			height: this.radius * 2
		});

		for (let object of objects) {
			if (object) {
				//Check if the object is a bullet
				if (object.self instanceof Bullet) {
					if (object.self.player != this) {
						//Check if colliding
						let distance = dist(this.body.position.x, this.body.position.y, object.x, object.y);
						if (distance < this.radius) {
							//Change color on hit
							this.color = color(floor(random(100, 255)), floor(random(200)), floor(random(200)));
							this.stroke = color(floor(random(100, 255)), floor(random(200)), floor(random(200)));
							//Deduct some health
							this.health -= object.self.damage;

							//Show health bar
							this.healthBarOpacity = 255;

							//Add shooter some score
							let score = this.health <= 5 ? 200 : 5;
							object.self.player.score += score;
							object.self.player.totalHits += 1;

							if (this.health <= 5) {
								object.self.player.health = 100;
							}
							if (object.self.player.health < 100) object.self.player.health += 1;

							//Delete the bullet
							object.self.dispose();

						}
					}
				}
			}
		}
	}

	checkPlayerCollision() {
		//Retrieve from quadtree
		let objects = game.map.playerQuadtree.retrieve({
			x: this.body.position.x - this.radius,
			y: this.body.position.y - this.radius,
			width: this.radius * 2,
			height: this.radius * 2
		});

		for (let object of objects) {
			if (object) {
				//Check if the object is a player
				if (object.self instanceof Player) {
					if (object.self != this) {
						//Check if colliding
						let distance = dist(this.body.position.x, this.body.position.y, object.x, object.y);
						if (distance < this.radius * 2) {
							//Deduct some health
							this.health -= 0.03;

							//Show health bar
							this.healthBarOpacity = 255;
						}
					}
				}
			}
		}
	}

	addToQuadtree() {
		game.map.playerQuadtree.insert({
			x: this.body.position.x,
			y: this.body.position.y,
			width: this.radius * 2,
			height: this.radius * 2,
			self: this
		});
	}

	moveUp() {
		if (this.body.velocity.y > -this.speed) {
			Body.applyForce(this.body, this.body.position, {
				x: 0,
				y: -this.acceleration
			})
		}
	}

	moveDown() {
		if (this.body.velocity.y < this.speed) {
			Body.applyForce(this.body, this.body.position, {
				x: 0,
				y: this.acceleration
			});
		}
	}

	moveLeft() {
		if (this.body.velocity.x > -this.speed) {
			Body.applyForce(this.body, this.body.position, {
				x: -this.acceleration,
				y: 0
			});
		}
	}

	moveRight() {
		if (this.body.velocity.x < this.speed) {
			Body.applyForce(this.body, this.body.position, {
				x: this.acceleration,
				y: 0
			});
		}
	}

	dispose() {
		for (var i = 0; i < game.players.length; i++) {
			let player = game.players[i];
			if (player) {
				if (player == this) {
					//Burst effect
					game.bursts.push(new Burst(this.body.position.x, this.body.position.y, {
						color: this.defaultColor,
						count: 30
					}));

					//Delete physics body
					World.remove(world, this.body);

					//Remove from players array
					game.players.splice(i, 1);

					//Respawn
					game.spawnPlayer(this.brain);
					break;
				}
			}
		}
	}

	getInputs() {
		let detectionRadius = 300;
		//Input #1 & #2: This player's position
		let playerPosition = [
			map(this.body.position.x, -game.map.size / 2 + this.radius, game.map.size / 2 - this.radius, 0, 1),
			map(this.body.position.y, -game.map.size / 2 + this.radius, game.map.size / 2 - this.radius, 0, 1)
		];

		//Input #3: Aim accuracy
		//Retrieve players from quadtree 
		let players = game.map.playerQuadtree.retrieve({
			x: this.body.position.x - this.radius,
			y: this.body.position.y - this.radius,
			width: this.radius * 2,
			height: this.radius * 2
		});

		for (let index in players) {
			let player = players[index];
			//Remove this player from the array
			if (player.self == this) {
				players.splice(index, 1);
			}

			//Remove if the enemy is too far
			if (dist(this.body.position.x, this.body.position.y, player.x, player.y) > detectionRadius) {
				//players.splice(index, 1);
			}
		}

		//Sort by closest
		players.sort((a, b) => {
			return dist(this.body.position.x, this.body.position.y, a.x, a.y) - dist(this.body.position.x, this.body.position.y, b.x, b.y);
		});

		let aimAccuracy = 0;

		if (players[0]) {
			let enemy = players[0].self;

			//Get the distance between this player and the enemy
			let enemyDistance = dist(this.body.position.x, this.body.position.y, enemy.body.position.x, enemy.body.position.y);

			//Polar coords
			let x = this.body.position.x + cos(this.gun.angle) * enemyDistance;
			let y = this.body.position.y + sin(this.gun.angle) * enemyDistance;

			aimAccuracy = dist(x, y, enemy.body.position.x, enemy.body.position.y);

			//Normalize
			aimAccuracy = map(aimAccuracy, 0, enemyDistance * 2, 1, 0);
		}

		const inputs = playerPosition.slice();
		inputs.push(aimAccuracy);

		return inputs;
	}
}