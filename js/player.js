import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { Input } from './controls.js';
import { Storage } from './storage.js';

export let playerGroup;
let velocity = new THREE.Vector3();
let isGrounded = true;
let cameraYaw = 0;
let cameraPitch = 0;

const speedWalk = 5;
const speedRun = 10;
const jumpForce = 12;
const gravity = -30;
const playerRadius = 0.5;
const playerHeight = 2.0;

export function initPlayer(scene, camera) {
    // Create Low-Poly Character
    playerGroup = new THREE.Group();
    
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x3498db });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.45;
    head.castShadow = true;

    playerGroup.add(body);
    playerGroup.add(head);
    scene.add(playerGroup);

    // Load Position
    const savedPos = Storage.load('playerPos', { x: 0, y: 5, z: 0 });
    playerGroup.position.set(savedPos.x, savedPos.y, savedPos.z);
}

export function updatePlayer(dt, camera, colliders) {
    if(!playerGroup) return;

    // 1. Camera Look (Orbit around player)
    cameraYaw -= Input.cameraDelta.x;
    cameraPitch -= Input.cameraDelta.y;
    cameraPitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, cameraPitch));
    
    // Reset camera delta so it stops moving when touch stops
    Input.cameraDelta = { x: 0, y: 0 };

    // 2. Calculate Movement based on Camera Yaw
    const speed = Input.isRunning ? speedRun : speedWalk;
    const moveDir = new THREE.Vector3(Input.movement.x, 0, Input.movement.y);
    
    if (moveDir.length() > 0.1) {
        // Rotate input vector by camera yaw
        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
        
        // Rotate player model to face movement direction
        const targetRotation = Math.atan2(moveDir.x, moveDir.z);
        playerGroup.rotation.y = targetRotation;
        
        velocity.x = moveDir.x * speed;
        velocity.z = moveDir.z * speed;
    } else {
        velocity.x *= 0.8; // friction
        velocity.z *= 0.8;
    }

    // 3. Jump & Gravity
    if (Input.isJumping && isGrounded) {
        velocity.y = jumpForce;
        isGrounded = false;
        Input.isJumping = false;
    }
    velocity.y += gravity * dt;

    // 4. Apply Position & Simple Collision
    const nextPos = playerGroup.position.clone();
    nextPos.x += velocity.x * dt;
    nextPos.z += velocity.z * dt;
    nextPos.y += velocity.y * dt;

    // AABB Collision vs World Objects (X/Z axis)
    const playerAABB = new THREE.Box3();
    playerAABB.setFromCenterAndSize(
        new THREE.Vector3(nextPos.x, nextPos.y + playerHeight/2, nextPos.z),
        new THREE.Vector3(playerRadius*2, playerHeight, playerRadius*2)
    );

    let hitWall = false;
    for(let box of colliders) {
        if(playerAABB.intersectsBox(box)) {
            hitWall = true;
            break;
        }
    }

    if(!hitWall) {
        playerGroup.position.x = nextPos.x;
        playerGroup.position.z = nextPos.z;
    } else {
        velocity.x = 0; velocity.z = 0;
    }

    // Floor Collision (Y axis) - Keep it simple flat ground for prototype + simple boxes
    if (playerGroup.position.y < 0) {
        playerGroup.position.y = 0;
        velocity.y = 0;
        isGrounded = true;
    } else {
        playerGroup.position.y = nextPos.y;
    }

    // 5. Update Camera Position
    const camOffset = new THREE.Vector3(
        Math.sin(cameraYaw) * Math.cos(cameraPitch) * 6,
        Math.sin(cameraPitch) * 6 + 2,
        Math.cos(cameraYaw) * Math.cos(cameraPitch) * 6
    );
    camera.position.copy(playerGroup.position).add(camOffset);
    camera.lookAt(playerGroup.position.x, playerGroup.position.y + 1.5, playerGroup.position.z);
    
    // Save state periodically (handled in main loop)
}
