import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { initEngine, scene, camera, renderer, updateDayNight } from './engine.js';
import { initWorld, colliders, interactables } from './world.js';
import { initPlayer, updatePlayer, playerGroup } from './player.js';
import { initControls, Input } from './controls.js';
import { Storage } from './storage.js';

let lastTime = performance.now();
let saveTimer = 0;
let currentInteractable = null;

// UI Elements
const uiLayer = document.getElementById('ui-layer');
const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');
const interactPrompt = document.getElementById('interaction-prompt');
const settingsMenu = document.getElementById('settings-menu');

async function startGame() {
    try {
        // Init Subsystems
        loadingText.innerText = "Initializing Graphics Engine...";
        initEngine(document.getElementById('game-container'));
        
        loadingText.innerText = "Generating World...";
        initWorld(scene);
        
        loadingText.innerText = "Spawning Player...";
        initPlayer(scene, camera);
        
        loadingText.innerText = "Loading UI...";
        initControls();
        setupUI();

        // Apply loaded settings
        const time = Storage.load('timeOfDay', 12);
        document.getElementById('setting-time').value = time;
        updateDayNight(time);
        
        Input.sensitivity = parseFloat(Storage.load('sensitivity', 1.0));
        document.getElementById('setting-sensitivity').value = Input.sensitivity;

        // Start Loop
        loadingScreen.style.display = 'none';
        uiLayer.style.display = 'block';
        renderer.setAnimationLoop(animate);

    } catch (e) {
        console.error(e);
        loadingText.innerText = "ERROR Loading Game: " + e.message;
        loadingText.style.color = "red";
    }
}

function setupUI() {
    document.getElementById('btn-settings').addEventListener('click', () => {
        settingsMenu.style.display = 'flex';
        uiLayer.style.display = 'none';
    });

    document.getElementById('btn-close-settings').addEventListener('click', () => {
        settingsMenu.style.display = 'none';
        uiLayer.style.display = 'block';
    });

    document.getElementById('btn-reset-save').addEventListener('click', () => {
        Storage.clear();
        location.reload();
    });

    document.getElementById('setting-time').addEventListener('input', (e) => {
        const t = parseFloat(e.target.value);
        updateDayNight(t);
        Storage.save('timeOfDay', t);
    });

    document.getElementById('setting-sensitivity').addEventListener('input', (e) => {
        Input.sensitivity = parseFloat(e.target.value);
        Storage.save('sensitivity', Input.sensitivity);
    });
    
    document.getElementById('setting-graphics').addEventListener('change', (e) => {
        if(e.target.value === 'low') {
            renderer.shadowMap.enabled = false;
            renderer.setPixelRatio(1);
        } else {
            renderer.shadowMap.enabled = true;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
        scene.traverse(child => {
            if (child.material) child.material.needsUpdate = true;
        });
    });
}

function checkInteractions() {
    if(!playerGroup) return;
    let found = null;
    const pPos = playerGroup.position;
    
    // Simple distance check instead of expensive raycast for prototype
    for(let obj of interactables) {
        let worldPos = new THREE.Vector3();
        obj.getWorldPosition(worldPos);
        if(pPos.distanceTo(worldPos) < 4) {
            found = obj;
            break;
        }
    }

    if(found !== currentInteractable) {
        currentInteractable = found;
        if(currentInteractable) {
            interactPrompt.style.display = 'block';
            interactPrompt.innerText = "Tap: " + currentInteractable.userData.name;
        } else {
            interactPrompt.style.display = 'none';
        }
    }

    // Process Interaction execution
    if(Input.interactTriggered && currentInteractable) {
        Input.interactTriggered = false; // consume input
        handleInteraction(currentInteractable);
    } else {
        Input.interactTriggered = false; // clear if nothing to interact with
    }
}

function handleInteraction(obj) {
    if(obj.userData.action === 'door') {
        obj.userData.open = !obj.userData.open;
        // Swing door visually
        obj.rotation.y = obj.userData.open ? Math.PI / 2 : 0;
        obj.position.x = obj.userData.open ? -0.7 : 0;
    } else if(obj.userData.action === 'monolith') {
        // Change color randomly
        obj.material.color.setHex(Math.random() * 0xffffff);
    }
}

function animate() {
    const time = performance.now();
    const dt = Math.min((time - lastTime) / 1000, 0.1); // Cap delta to prevent huge jumps
    lastTime = time;

    updatePlayer(dt, camera, colliders);
    checkInteractions();

    renderer.render(scene, camera);

    // Auto-save every 2 seconds
    saveTimer += dt;
    if(saveTimer > 2.0 && playerGroup) {
        Storage.save('playerPos', { x: playerGroup.position.x, y: playerGroup.position.y, z: playerGroup.position.z });
        saveTimer = 0;
    }
}

// Ensure browser allows time to paint UI before locking up thread loading Three.js
setTimeout(startGame, 100);
          
