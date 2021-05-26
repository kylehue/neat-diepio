class Square {
	constructor() {
		let position = createVector(random(-game.map.size / 2, game.map.size / 2), random(-game.map.size / 2, game.map.size / 2));
		this.size = 20;
		this.body = Bodies.rectangle(position.x, position.y, this.size, this.size, {
			restitution: 0.5,
			density: 0.1
		});

		World.add(world, this.body);
	}

	render() {
		fill("#ffee5d");
		stroke("#f8e436");
		strokeWeight(3);
		push();
		translate(this.body.position.x, this.body.position.y);
		rotate(this.body.angle);
		beginShape();
		rect(-this.size / 2, -this.size / 2, this.size, this.size);
		endShape();
		pop();
	}
}