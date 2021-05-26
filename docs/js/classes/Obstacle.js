class Obstacle {
	constructor(x, y, w, h) {
		this.body = Bodies.rectangle(x, y, w, h, {
			isStatic: true
		});

		World.add(world, this.body);
	}

	render() {
		
	}
}