//import three.js module
import * as THREE from '/build/three.module.js';
//import mouse view controls
import * as OBJ from '/modules/OrbitControls.js';

var canvas = document.getElementById("firstcanvas");
var scene;
var camera;
var renderer;
var texture = new THREE.TextureLoader().load('/textures/moon.jpg');
var boing = 0;
var sphere;

function init_scene(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 40, canvas.clientWidth / canvas.clientHeight, 0.1, 1000 ); //camera with param FOV, dim-canvas, min distance render, max distance render
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: firstcanvas }); //render motor
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );
    new OBJ.OrbitControls( camera, renderer.domElement );
    document.getElementById('myWeb').appendChild( renderer.domElement );
    camera.position.z = 40;
}

function enable_shadows(){
    var ambientlight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientlight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    var light = new THREE.PointLight( 0xffffff, 0.4, 200);
    light.position.set(50,50,0);
    light.castShadow = true;
    light.shadow.camera.near = 0.2;
    light.shadow.camera.far = 100;
    scene.add(light);
}

function init_geometrics(){
    //moon
    var moon = new THREE.SphereGeometry( 5, 64, 64 ); //geometria, struttra che contiene tutti i vertici ecc...
    var moon_material = new THREE.MeshPhongMaterial( { map: texture} );
    sphere = new THREE.Mesh( moon, moon_material ); //a questo punto creiamo la mesh sulla base della geometria e del materiale
    sphere.receiveShadow = true;
    sphere.castShadow = true;
    scene.add(sphere);
    //base
    var base = new THREE.CylinderGeometry( 8, 8, 2, 64 );
    var base_material = new THREE.MeshPhongMaterial( { color: 0x91a3b0} );
    var cy = new THREE.Mesh( base, base_material );
    cy.receiveShadow = true;
    cy.castShadow = true;
    cy.position.y = -8.5;
    scene.add(cy);
    //capsule
    var dome_capsule = new THREE.SphereGeometry( 8, 64, 64, 0, Math.PI*2, 0, Math.PI/2);
    var glassy_material = new THREE.MeshPhongMaterial( { color: 0xa8ccd7, opacity: 0.3, transparent: true,} );
    glassy_material.side = THREE.FrontSide;
    var glasstop = new THREE.Mesh( dome_capsule, glassy_material );
    glasstop.position.y= 3.5;
    glasstop.receiveShadow = true;
    scene.add(glasstop);
    var cy_capsule = new THREE.CylinderGeometry( 8, 8, 11, 64, 1, true );
    cy_capsule = new THREE.Mesh(cy_capsule, glassy_material);
    cy_capsule.receiveShadow = true;
    cy_capsule.position.y=-2;
    scene.add(cy_capsule);
}

function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.x += 0.001;
    sphere.rotation.y += 0.005;
    boing+=0.01;
    sphere.position.y = Math.sin(boing) + 0.5;
    renderer.render(scene, camera);
}

init_scene();
enable_shadows();
init_geometrics();
animate();
