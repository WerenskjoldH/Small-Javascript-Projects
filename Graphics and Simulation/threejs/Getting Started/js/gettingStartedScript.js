var scene = new THREE.Scene();

// Parameters: FOV, Ratio (w/h), near clipping plane, far clipping plane
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Define shape
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: false});
var materialTwo = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: false});
var cube = new THREE.Mesh(geometry, material);
var cubeTwo = new THREE.Mesh(geometry, materialTwo);
scene.add(cube);
scene.add(cubeTwo);

camera.position.z = 3;

const STEPSIZE = 0.01;
var dt = 0;

var Update = function () {
    cube.position.y = 1.5 * Math.sin(dt);
    cube.position.x = 1.5 * Math.cos(dt);


    dt += STEPSIZE;
};

var Render = function () {
    renderer.render(scene, camera);
};

var GameLoop = function () {
    requestAnimationFrame(GameLoop);

    Update();

    Render();
}

GameLoop();

// Other

window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
 });