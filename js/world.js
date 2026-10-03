import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export let colliders = [];
export let interactables = [];

export function initWorld(scene) {
    // 1. Terrain (Grass)
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x2d6a4f });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 2. Lake (Water)
    const waterGeo = new THREE.PlaneGeometry(30, 30);
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x0077b6, transparent: true, opacity: 0.8 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(40, 0.1, -30);
    scene.add(water);

    // 3. Central Village (Houses)
    createHouse(scene, 0, 0, 10, 0x8b4513, 0xff0000);
    createHouse(scene, 15, 0, 15, 0xd2b48c, 0x0000ff);
    createHouse(scene, -15, 0, 10, 0x808080, 0x00ff00);

    // 4. Forest (Procedural Trees)
    for(let i=0; i<40; i++) {
        let x = (Math.random() - 0.5) * 150;
        let z = (Math.random() - 0.5) * 150;
        // Keep trees away from spawn/village
        if(Math.abs(x) < 25 && Math.abs(z) < 25) continue;
        if(x > 25 && z < -15) continue; // Keep out of water
        createTree(scene, x, z);
    }

    // 5. Mysterious Locked Area
    createMysteriousArea(scene);
}

function createHouse(scene, x, y, z, wallColor, roofColor) {
    const houseGrp = new THREE.Group();
    houseGrp.position.set(x, y, z);

    // Walls
    const wallGeo = new THREE.BoxGeometry(6, 4, 6);
    const wallMat = new THREE.MeshLambertMaterial({ color: wallColor });
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    houseGrp.add(walls);

    // Roof
    const roofGeo = new THREE.ConeGeometry(5, 3, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: roofColor });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 5.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    houseGrp.add(roof);
    
    // Door (Interactable)
    const doorGeo = new THREE.BoxGeometry(1.5, 2.5, 0.2);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x4a2311 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.25, 3.1);
    door.userData = { 
        interactable: true, 
        action: 'door', 
        open: false,
        name: "Village House"
    };
    houseGrp.add(door);
    interactables.push(door);

    scene.add(houseGrp);

    // Add Collider
    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 2, z), new THREE.Vector3(6, 4, 6));
    colliders.push(box);
}

function createTree(scene, x, z) {
    const treeGrp = new THREE.Group();
    treeGrp.position.set(x, 0, z);

    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    
    const leavesGeo = new THREE.ConeGeometry(2, 4, 5);
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x228b22 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 4;
    leaves.castShadow = true;

    treeGrp.add(trunk);
    treeGrp.add(leaves);
    scene.add(treeGrp);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 1.5, z), new THREE.Vector3(1, 3, 1));
    colliders.push(box);
}

function createMysteriousArea(scene) {
    const mystGrp = new THREE.Group();
    mystGrp.position.set(-40, 0, -40);

    // Monoliths
    for(let i=0; i<8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const geo = new THREE.BoxGeometry(2, 8, 2);
        const mat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const pillar = new THREE.Mesh(geo, mat);
        pillar.position.set(Math.cos(angle)*10, 4, Math.sin(angle)*10);
        pillar.castShadow = true;
        mystGrp.add(pillar);
        
        const box = new THREE.Box3();
        box.setFromCenterAndSize(new THREE.Vector3(mystGrp.position.x + pillar.position.x, 4, mystGrp.position.z + pillar.position.z), new THREE.Vector3(2, 8, 2));
        colliders.push(box);
    }

    // Glowing center
    const glowGeo = new THREE.BoxGeometry(3,3,3);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x8a2be2, wireframe: true });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 2;
    glow.userData = { interactable: true, action: 'monolith', name: "Strange Artifact" };
    interactables.push(glow);
    mystGrp.add(glow);

    scene.add(mystGrp);
      }
      
