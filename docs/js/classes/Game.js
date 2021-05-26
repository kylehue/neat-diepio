class Game {
	constructor() {
		this.camera = new Camera2D(drawingContext, {
			moveTransitionSpeed: 0.1,
			zoomTransitionSpeed: 0.2
		});
		this.map = new Map();
		this.players = [];
		this.playerCount = 30;
		this.bursts = [];
		this.squares = [];
		this.bestPlayer = {
			brain: {
				fitness: 0
			},
			body: {
				position: {
					x: 0,
					y: 0
				}
			}
		};
	}

	update() {
		//Update quadtree before updating player
		for (let player of this.players) {
			player.updateQuadtree();
		}

		for (let player of this.players) {
			player.update();
		}

		//Clear quadtree
		this.map.quadtree.clear();
		this.map.playerQuadtree.clear();

		if (!this.players.includes(this.bestPlayer)) {
			this.bestPlayer = this.players[0];
		}
	}

	render() {
		this.camera.begin();

		//Focus to best player
		if (this.players[0]) {
			this.camera.moveTo(this.players[0].body.position.x, this.players[0].body.position.y);
		}

		this.camera.zoomTo(width + 200);

		this.map.render();
		for (let square of this.squares) {
			if (this.isVisible(square.body.position, 20)) {
				square.render();
			}
		}

		for (let player of this.players) {
			if (player) {
				if (this.isVisible(player.body.position, player.radius + player.gun.width)) {
					player.gun.render();
					player.render();
				}
			}
		}

		for (let burst of this.bursts) {
			if (burst) {
				burst.render();
				burst.update();
			}
		}

		this.camera.end()
	}

	spawnPlayer(genome) {
		this.players.push(new Player(genome));
	}

	isVisible(position, offset) {
		offset = offset || 0;
		if (position.x + offset > this.camera.viewport.left && position.x - offset < this.camera.viewport.right && position.y + offset > this.camera.viewport.top && position.y - offset < this.camera.viewport.bottom) {
			return true;
		}

		return false;
	}

	static Config = {
		background: "#e6e9ef"
	}
}