class Map {
	constructor() {
		this.size = 5000;
		this.quadtree = new Quadtree({
			x: -this.size / 2,
			y: -this.size / 2,
			width: this.size,
			height: this.size
		}, 14)

		this.playerQuadtree = new Quadtree({
			x: -this.size / 2,
			y: -this.size / 2,
			width: this.size,
			height: this.size
		}, 8)

		const thickness = 20;
		this.walls = {
			top: Bodies.rectangle(0, -this.size / 2 - thickness / 2, this.size, thickness, {
				isStatic: true,
				self: this
			}),
			right: Bodies.rectangle(this.size / 2 + thickness / 2, 0, thickness, this.size, {
				isStatic: true,
				self: this
			}),
			bottom: Bodies.rectangle(0, this.size / 2 + thickness / 2, this.size, thickness, {
				isStatic: true,
				self: this
			}),
			left: Bodies.rectangle(-this.size / 2 - thickness / 2, 0, thickness, this.size, {
				isStatic: true,
				self: this
			})
		}

		World.add(world, [this.walls.top, this.walls.right, this.walls.bottom, this.walls.left])
	}

	render() {
		//Flat color
		fill("#f3f5fb");
		noStroke();
		beginShape();
		rect(-this.size / 2, -this.size / 2, this.size, this.size);
		endShape();

		//Grid
		noFill();
		stroke(0, 30);
		strokeWeight(1);
		let size = 60;
		let count = this.size / size;
		beginShape();
		for (var i = -floor(count); i < floor(count); i++) {
			let pos = i * (size / 2);
			//Vertical Lines
			if (game.isVisible({x: pos, y: game.camera.movement.y})) line(pos, -this.size / 2, pos, this.size / 2);

			//Horizontal Lines
			if (game.isVisible({x: game.camera.movement.x, y: pos})) line(-this.size / 2, pos, this.size / 2, pos);
		}
		endShape();
	}
}