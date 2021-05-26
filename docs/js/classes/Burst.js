class Burst {
	constructor(x, y, options) {
		options = options || {};
		this.position = createVector(x, y);
		this.color = options.color || "red";
		this.pieces = [];
		let count = options.count || 50;
		for (var i = 0; i < count; i++) {
			this.pieces.push(new Piece(this, this.position.x, this.position.y, this.color));
		}
	}

	render() {
		for (let piece of this.pieces) {
			if (game.isVisible(piece.position, piece.diameter * 2)) piece.render();
		}
	}

	update() {
		let opacitySum = 0;
		for (let piece of this.pieces) {
			piece.update();
			opacitySum+= piece.opacity;
		}

		if (opacitySum <= 100 || this.pieces.length <= 1) {
			this.dispose();
		}
	}

	dispose() {
		for (var i = 0; i < game.bursts.length; i++) {
			let burst = game.bursts[i];
			if (burst) {
				if (burst == this) {
					game.bursts.splice(i, 1);
				}
			}
		}
	}
}

class Piece {
	constructor(burst, x, y, color) {
		this.position = createVector(x, y);
		this.speed = random(1, 3);
		this.color = color;
		this.burst = burst;
		this.velocity = createVector(random(-this.speed, this.speed), random(-this.speed, this.speed));
		this.diameter = random(2, 10);
		this.opacity = 255;
	}

	render() {
		noStroke();
		let clr = color(this.color)
		fill(clr.levels[0], clr.levels[1], clr.levels[2], this.opacity);
		beginShape();
		circle(this.position.x, this.position.y, this.diameter);
		endShape();
	}

	update() {
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		this.opacity -= random(0, 20);

		if (this.opacity <= 20) {
			this.dispose();
		}
	}

	dispose() {
		for (let i in this.burst.pieces) {
			let piece = this.burst.pieces[i];
			if (piece) {
				if (piece == this) {
					this.burst.pieces.splice(i, 1);
				}
			}
		}
	}
}