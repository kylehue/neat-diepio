class Gun {
	constructor(player) {
		this.player = player;
		this.width = 10;
		this.height = 7;
		this.rotation = random(0, 100);
		this.angle = 0;
		this.bullets = [];
		this.automatic = 0.95;
		this.recoil = 0.1;
		this.shootCount = 0;
	}

	render() {
		for (let bullet of this.bullets) {
			if (game.isVisible(bullet.position)) bullet.render();
		}

		strokeWeight(2);
		stroke("#79848c");
		fill("#838c92");
		push();
		translate(this.player.body.position.x, this.player.body.position.y);
		rotate(this.angle);
		beginShape();
		rect(this.player.radius, -this.height / 2, this.width, this.height);
		endShape();
		pop();
	}

	update() {
		if (this.player != game.players[0]) this.angle = Math.atan2(sin(this.rotation), cos(this.rotation));
		for (let bullet of this.bullets) {
			if (bullet) {
				bullet.update();
			}
		}
		this.shootCount++;
	}

	shoot() {
		let aut = Math.round(map(this.automatic, 0, 1, 20, 1));
		if (this.shootCount % aut == 0) {
			this.bullets.push(new Bullet(this));
			this.player.totalFires += 1;
		}
	}
}