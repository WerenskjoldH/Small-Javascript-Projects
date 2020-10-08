var scene = new THREE.Scene();

// Parameters: FOV, Ratio (w/h), near clipping plane, far clipping plane
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Define shape
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var Update = function () {

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

window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
 });