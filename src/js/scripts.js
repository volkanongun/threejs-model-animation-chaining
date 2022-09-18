import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'dat.gui'

const donkeyURL = new URL('../assets/Cow.gltf', import.meta.url);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xA3A3A3)
renderer.shadowMap.enabled = true
renderer.antialias = true

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

renderer.setClearColor(0xA3A3A3);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(7, 4, 7);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x999999)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1)
directionalLight.castShadow = true
directionalLight.position.set(-6.835,10,10)
const dlHelper = new THREE.DirectionalLightHelper( directionalLight, 5 )
scene.add( dlHelper )
scene.add( directionalLight )

const planeGeometry = new THREE.PlaneGeometry(30,30)
const planeMaterial = new THREE.MeshStandardMaterial({ color : 0xFFFFFF, side: THREE.DoubleSide })
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(plane)
plane.rotation.x = -.5 * Math.PI
plane.receiveShadow = true

const assetLoader = new GLTFLoader();

let mixer
assetLoader.load(donkeyURL.href, function(gltf) {
    const model = gltf.scene;
    scene.add(model);
        
    model.traverse(function (node) {
        if(node.isMesh)
            node.castShadow = true
    })

    const clips = gltf.animations
    mixer = new THREE.AnimationMixer(model)

    const idleClip = THREE.AnimationClip.findByName(clips, "Idle_2")
    const idleAction = mixer.clipAction(idleClip)
    idleAction.play()
    idleAction.loop = THREE.LoopOnce

    const eatingClip = THREE.AnimationClip.findByName(clips, "Eating")
    const eatingAction = mixer.clipAction(eatingClip)
    eatingAction.loop = THREE.LoopOnce

    mixer.addEventListener('finished', function(e){
        if(e.action._clip.name === "Eating"){
            idleAction.reset()
            idleAction.play()
        }else if(e.action._clip.name === "Idle_2"){
            eatingAction.reset()
            eatingAction.play()
        }
    })

}, undefined, function(error) {
    console.error(error);
});

const clock = new THREE.Clock()
function animate() {
    if(mixer)
        mixer.update(clock.getDelta())

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});