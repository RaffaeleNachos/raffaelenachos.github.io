// import three.js module
import * as THREE from '/build/three.module.js';
// import mouse view controls
import * as OBJ from '/modules/OrbitControls.js';
// import stl loader
import * as STL from '/modules/STLLoader.js';

var scene;
var camera;
var renderer;
var canvas = document.getElementById("secondcanvas");
canvas.focus({preventScroll:false});
var loader = new STL.STLLoader();
// var texture = new THREE.TextureLoader().load('/textures/moon.jpg');
var stem;
//var keycap;
var boing = 0;
var camera_pivot;
var y_axis = new THREE.Vector3( 0, 1, 0 );

function init_scene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 1000); // camera with param FOV, dim-canvas, min distance render, max distance render
    renderer = new THREE.WebGLRenderer({antialias: true, canvas: secondcanvas, alpha: true}); // render motor
    new OBJ.OrbitControls(camera, renderer.domElement);
    renderer.setClearColor( 0x000000, 0 );
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    document.getElementById('myWeb').appendChild( renderer.domElement );
    camera.position.z = 80;
    camera_pivot = new THREE.Object3D();
    scene.add( camera_pivot );
    camera_pivot.add( camera );
    camera.position.set( 50, 35, 0 );
    camera.lookAt( camera_pivot.position );
}

function enable_shadows() {
    var ambientlight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientlight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    var light = new THREE.PointLight(0xffffff, 0.4, 200);
    light.position.set(50, 50, 0);
    light.castShadow = true;
    light.shadow.camera.near = 0.2;
    light.shadow.camera.far = 100;
    scene.add(light);
}

function init_geometrics() {
    loader.load('../mesh/bottom.stl', function (geometry) {
        var material = new THREE.MeshPhongMaterial({color: 0x232b2b});
        var mesh = new THREE.Mesh(geometry, material);

        //mesh.rotation.set(0, -Math.PI / 4, 0);
        //mesh.scale.set(0.5, 0.5, 0.5);

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        //mesh.position.x = -7.5;
        //mesh.position.z = 7.5;

        scene.add(mesh);

    });
    loader.load('../mesh/top.stl', function (geometry) {
        var material = new THREE.MeshPhongMaterial({color: 0xdbf0ff, opacity: 0.5, transparent: true});
        var mesh = new THREE.Mesh(geometry, material);

        //mesh.rotation.set(0, -Math.PI / 4, 0);
        //mesh.scale.set(0.5, 0.5, 0.5);

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        //mesh.position.x = -7.5;
        //mesh.position.z = 7.5;
        mesh.position.y = 3,
        scene.add(mesh);

    });
    loader.load('../mesh/stem.stl', function (geometry) {
        var material = new THREE.MeshPhongMaterial({color: 0x6495ed});
        stem = new THREE.Mesh(geometry, material);

        //mesh.rotation.set(0, -Math.PI / 4, 0);

        stem.castShadow = true;
        stem.receiveShadow = true;
        //stem.position.x = -7.5;
        //stem.position.z = 7.5;

        scene.add(stem);

    });
    /*loader.load('../mesh/1u.stl', function (geometry) {
        var material = new THREE.MeshPhongMaterial({color: 0xF8F8FF});
        keycap = new THREE.Mesh(geometry, material);

        //mesh.rotation.set(0, -Math.PI / 4, 0);
        keycap.position.y = 30;
        keycap.castShadow = true;
        keycap.receiveShadow = true;

        scene.add(keycap);

    });*/
}

function animate() {
    requestAnimationFrame(animate);
    boing+=0.02;
    stem.position.y = Math.sin(boing)*1.9 + 4.6;
    //keycap.position.y = Math.sin(boing)*1.9 +3.8;
    renderer.render(scene, camera);
    camera_pivot.rotateOnAxis( y_axis, 0.01);
}

init_scene();
enable_shadows();
init_geometrics();
animate();
