import * as THREE from "https://unpkg.com/three@0.112/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js";

// the model
const FRONT = 0;
const BACK = 1;
const LEFT = 2;
const RIGHT = 3;
const UP = 4;
const DOWN = 5;
const NUMBER_OF_DIRECTIONS = 6;

const CLOSED = 0;
const OPEN = 1;

let CUBE_SIZE = 7;  // Default value

function randomInt(max) {
	return Math.floor(Math.random() * max);
}

class MonkeyMap {
	constructor() {
		this.vls = new Map();
		this.ks = new Map();
	}
	set(key, value) {
		this.ks.set(key.toString(), key);
		this.vls.set(key.toString(), value);
	}

	get(key) {
		return this.vls.get(key.toString());
	}

	has(key) {
		return this.vls.has(key.toString());
	}

	keys() {
		return this.ks.values();
	}

	size() {
		return this.ks.size;
	}
}

function createModel() {
	var cube = new MonkeyMap();

	//select first posistion
	let x1 = randomInt(CUBE_SIZE);
	let x2 = randomInt(CUBE_SIZE);
	let x3 = randomInt(CUBE_SIZE);
	let pos = [x1, x2, x3];
	cube.set(pos, new Set());

	while (cube.size() < (CUBE_SIZE * CUBE_SIZE * CUBE_SIZE)) {

		// select the position to work on next
		let pos = Array.from(cube.keys())[randomInt(cube.size())];
		var directions = cube.get(pos);


		let direction = randomInt(NUMBER_OF_DIRECTIONS);

		// check direction
		if (directions.has(direction)) continue;
		// check neighbour
		if (direction == FRONT) {
			let n_x1 = pos[0] + 1;
			if (n_x1 < CUBE_SIZE) {
				let n_pos = [n_x1, pos[1], pos[2]]
				if (!cube.has(n_pos)) {
					directions.add(direction);
					let n_directions = new Set([BACK]);
					cube.set(n_pos, n_directions);

				}
			}
		}
		else if (direction == BACK) {
			let n_x1 = pos[0] - 1;
			if (n_x1 >= 0) {
				let n_pos = [n_x1, pos[1], pos[2]]
				if (!cube.has(n_pos)) {
					directions.add(direction);
					let n_directions = new Set([FRONT]);
					cube.set(n_pos, n_directions);
				}
			}
		}
		else if (direction == LEFT) {
			let n_x2 = pos[1] - 1;
			if (n_x2 >= 0) {
				let n_pos = [pos[0], n_x2, pos[2]]
				if (!cube.has(n_pos)) {
					directions.add(direction);
					let n_directions = new Set([RIGHT]);
					cube.set(n_pos, n_directions);
				}
			}
		}
		else if (direction == RIGHT) {
			let n_x2 = pos[1] + 1;
			if (n_x2 < CUBE_SIZE) {
				let n_pos = [pos[0], n_x2, pos[2]]
				if (!cube.has(n_pos)) {
					directions.add(direction);
					let n_directions = new Set([LEFT]);
					cube.set(n_pos, n_directions);
				}
			}
		}
		else if (direction == UP) {
			let n_x3 = pos[2] + 1;
			if (n_x3 < CUBE_SIZE) {
				let n_pos = [pos[0], pos[1], n_x3];
				if (!cube.has(n_pos)) {
					directions.add(direction);
					let n_directions = new Set([DOWN]);
					cube.set(n_pos, n_directions);
				}
			}
		}
		else if (direction == DOWN) {
			let n_x3 = pos[2] - 1;
			if (n_x3 >= 0) {
				let n_pos = [pos[0], pos[1], n_x3]
				if (!cube.has(n_pos)) {
					directions.add(direction);
					let n_directions = new Set([UP]);
					cube.set(n_pos, n_directions);
				}
			}
		}
	}
	return cube;
}

function defineCubeCenter(pos, direction) {
	let group = new THREE.Group();
	if (direction.has(UP)) {
		let line = defineLine(pos[0], pos[1], pos[2], pos[0], pos[1], pos[2] + 0.5, 0xFF00AA);
		group.add(line);
	}
	if (direction.has(DOWN)) {
		let line = defineLine(pos[0], pos[1], pos[2], pos[0], pos[1], pos[2] - 0.5, 0xAA00AA);
		group.add(line);
	}
	if (direction.has(LEFT)) {
		let line = defineLine(pos[0], pos[1], pos[2], pos[0], pos[1] - 0.5, pos[2], 0x00AA00);
		group.add(line);
	}
	if (direction.has(RIGHT)) {
		let line = defineLine(pos[0], pos[1], pos[2], pos[0], pos[1] + 0.5, pos[2], 0x00FF00);
		group.add(line);
	}
	if (direction.has(FRONT)) {
		let line = defineLine(pos[0], pos[1], pos[2], pos[0] + 0.5, pos[1], pos[2], 0x9933FF);
		group.add(line);
	}
	if (direction.has(BACK)) {
		let line = defineLine(pos[0], pos[1], pos[2], pos[0] - 0.5, pos[1], pos[2], 0x3311FF);
		group.add(line);
	}
	return group;
}

// the view
function defineLine(x1, y1, z1, x2, y2, z2, lineColor) {
	const lmaterial = new THREE.LineBasicMaterial({ color: lineColor });
	const points = [new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)];
	const lgeometry = new THREE.BufferGeometry().setFromPoints(points);
	const line = new THREE.Line(lgeometry, lmaterial);
	return line;
}

let currentScene = null;
let currentRenderer = null;
let currentControls = null;

function clearScene() {
    if (currentScene) {
        while(currentScene.children.length > 0) { 
            currentScene.remove(currentScene.children[0]); 
        }
    }
    if (currentRenderer) {
        currentRenderer.dispose();
    }
    if (currentControls) {
        currentControls.dispose();
    }
}

function main() {
    clearScene();
    const cube = createModel();

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        canvas,
        preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    currentRenderer = renderer;

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 4 * CUBE_SIZE;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2 * CUBE_SIZE;
    camera.position.y = CUBE_SIZE / 2;

    const controls = new OrbitControls(camera, renderer.domElement);
    currentControls = controls;

    const scene = new THREE.Scene();
    currentScene = scene;
    scene.background = new THREE.Color(0xEEE9EE); // set background to light pink
	{

		const color = 0xFFFFFF;
		const intensity = 3;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(- 1, 2, 4);
		scene.add(light);

	}

	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

	const material = new THREE.MeshPhongMaterial({ color: 0x99aabb }); // greenish blue

	// render a line
	const lmaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });

	const group = new THREE.Group();

	// render the way inside the maze

	for (const e of cube.keys()) {
		let cubeCenter = defineCubeCenter(e, cube.get(e));
		group.add(cubeCenter);
	}
	scene.add(group);

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = canvas.clientWidth * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        return needResize;
    }

    function animate() {
        resizeRendererToDisplaySize(renderer);
        controls.update();
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);
}

main();

export function updateCubeSize() {
    const input = document.getElementById('cubeSize');
    const newSize = parseInt(input.value);
    if (newSize > 0) {
        CUBE_SIZE = newSize;
        main();
    }
}