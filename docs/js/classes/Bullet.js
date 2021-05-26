class Bullet {
	constructor(gun) {
		this.gun = gun;
		this.range = random(30, 45);
		this.damage = random(15, 20);
		this.speed = 10;
		this.diameter = 7;
		this.health = 100;
		this.opacity = 255;
		this.traveledFrames = 0;
		this.player = this.gun.player;
		let rand = random(-this.gun.recoil, this.gun.recoil);
		this.velocity = createVector(cos(this.gun.angle + rand), sin(this.gun.angle + rand));

		let offset = this.player.radius + this.gun.width + rand;
		this.position = createVector(this.player.body.position.x + this.velocity.x * offset, this.player.body.position.y + this.velocity.y * offset);
		this.color = this.player.defaultColor;
	}

	render() {
		//Bullet
		let clr = color(this.color).levels;
		fill(clr[0], clr[1], clr[2], this.opacity);
		noStroke();
		beginShape();
		circle(this.position.x, this.position.y, this.diameter);
		endShape();

		//Trail
		let trailLength = 15;
		let trailOpacity = 40;
		noFill();
		stroke(clr[0], clr[1], clr[2], trailOpacity);
		strokeWeight(this.diameter);
		strokeCap(ROUND);
		beginShape();
		vertex(this.position.x, this.position.y);
		vertex(this.position.x - this.velocity.x * trailLength, this.position.y - this.velocity.y * trailLength);
		endShape();
	}

	update() {
		this.position.x += this.velocity.x * this.speed;
		this.position.y += this.velocity.y * this.speed;
		this.speed *= 0.992;

		if (this.health <= 0 || this.opacity <= 0) {
			this.dispose();
		}

		if (this.traveledFrames > this.range) {
			this.opacity -= 30;
		}

		this.traveledFrames++;
	}


	checkBulletCollision() {
		//Retrieve from quadtree
		let closeBullets = game.map.quadtree.retrieve({
			x: this.position.x - this.diameter,
			y: this.position.y - this.diameter,
			width: this.diameter * 2,
			height: this.diameter * 2
		});

		for (let bullet of closeBullets) {
			if (bullet) {
				//Check if the colliding bullets didn't come from the same player
				if (bullet.self.player != this.player) {
					if (dist(this.position.x, this.position.y, bullet.x, bullet.y) < this.diameter) {
						//Delete the bullet
						this.health -= 20;
					}
				}
			}
		}
	}

	addToQuadtree() {
		game.map.quadtree.insert({
			x: this.position.x,
			y: this.position.y,
			width: this.diameter,
			height: this.diameter,
			self: this
		});
	}

	dispose() {
		for (var i = this.gun.bullets.length - 1; i >= 0; i--) {
			let bullet = this.gun.bullets[i];
			if (bullet) {
				if (bullet == this) {
					this.gun.bullets.splice(i, 1);
					break;
				}
			}
		}
	}
}