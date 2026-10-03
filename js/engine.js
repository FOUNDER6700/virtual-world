import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export let scene, camera, renderer;
export let sunLight, hemiLight;
export let timeOfDay = 12; // 0-24

export function initEngine(container) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 20, 80);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);

    renderer = new THREE.WebGLRenderer({ antialias: false }); // False for mobile perf
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemiLight);

    sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024; // Lower for mobile
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    const d = 40;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

export function updateDayNight(time) {
    timeOfDay = time;
    // Map time 0-24 to angle 0 - PI
    const angle = ((timeOfDay - 6) / 12) * Math.PI; 
    
    sunLight.position.x = Math.cos(angle) * 50;
    sunLight.position.y = Math.sin(angle) * 50;
    sunLight.position.z = 20;

    if(sunLight.position.y < 0) {
        sunLight.intensity = 0; // Night
        scene.background.setHex(0x0a0a2a);
        scene.fog.color.setHex(0x0a0a2a);
        hemiLight.intensity = 0.1;
    } else {
        sunLight.intensity = 1.2; // Day
        // Sunset/Sunrise color shifts
        if(sunLight.position.y < 15) {
            scene.background.setHex(0xfd5e53);
            scene.fog.color.setHex(0xfd5e53);
        } else {
            scene.background.setHex(0x87ceeb);
            scene.fog.color.setHex(0x87ceeb);
        }
        hemiLight.intensity = 0.6;
    }
      }
          
