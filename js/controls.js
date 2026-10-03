export const Input = {
    movement: { x: 0, y: 0 }, // Normalized joystick output
    cameraDelta: { x: 0, y: 0 }, // Touch drag delta
    isJumping: false,
    isRunning: false,
    interactTriggered: false,
    sensitivity: 1.0
};

let joyBase, joyKnob;
let joystickCenter = { x: 0, y: 0 };
let activeLeftTouch = null;
let activeRightTouch = null;
let lastRightPos = { x: 0, y: 0 };

export function initControls() {
    joyBase = document.getElementById('joystick-base');
    joyKnob = document.getElementById('joystick-knob');
    
    const zoneLeft = document.getElementById('touch-zone-left');
    const zoneRight = document.getElementById('touch-zone-right');

    // Left Joystick Logic
    zoneLeft.addEventListener('pointerdown', (e) => {
        if(activeLeftTouch !== null) return;
        activeLeftTouch = e.pointerId;
        joystickCenter = { x: e.clientX, y: e.clientY };
        joyBase.style.display = 'block';
        joyBase.style.left = joystickCenter.x + 'px';
        joyBase.style.top = joystickCenter.y + 'px';
        updateJoystick(e.clientX, e.clientY);
    });

    zoneLeft.addEventListener('pointermove', (e) => {
        if(e.pointerId === activeLeftTouch) updateJoystick(e.clientX, e.clientY);
    });

    const resetLeft = (e) => {
        if(e.pointerId === activeLeftTouch) {
            activeLeftTouch = null;
            joyBase.style.display = 'none';
            Input.movement = { x: 0, y: 0 };
            joyKnob.style.transform = `translate(0px, 0px)`;
        }
    };
    zoneLeft.addEventListener('pointerup', resetLeft);
    zoneLeft.addEventListener('pointercancel', resetLeft);

    // Right Camera Look Logic
    zoneRight.addEventListener('pointerdown', (e) => {
        if(activeRightTouch !== null) return;
        activeRightTouch = e.pointerId;
        lastRightPos = { x: e.clientX, y: e.clientY };
    });

    zoneRight.addEventListener('pointermove', (e) => {
        if(e.pointerId === activeRightTouch) {
            Input.cameraDelta.x = (e.clientX - lastRightPos.x) * 0.005 * Input.sensitivity;
            Input.cameraDelta.y = (e.clientY - lastRightPos.y) * 0.005 * Input.sensitivity;
            lastRightPos = { x: e.clientX, y: e.clientY };
        }
    });

    const resetRight = (e) => {
        if(e.pointerId === activeRightTouch) {
            activeRightTouch = null;
            Input.cameraDelta = { x: 0, y: 0 };
        }
    };
    zoneRight.addEventListener('pointerup', resetRight);
    zoneRight.addEventListener('pointercancel', resetRight);

    // Buttons
    const btnJump = document.getElementById('btn-jump');
    const btnRun = document.getElementById('btn-run');
    const btnInteract = document.getElementById('interaction-prompt');

    btnJump.addEventListener('pointerdown', () => Input.isJumping = true);
    btnJump.addEventListener('pointerup', () => Input.isJumping = false);
    
    btnRun.addEventListener('pointerdown', () => Input.isRunning = true);
    btnRun.addEventListener('pointerup', () => Input.isRunning = false);

    btnInteract.addEventListener('pointerdown', () => {
        Input.interactTriggered = true;
        btnInteract.style.background = "white";
        btnInteract.style.color = "black";
        setTimeout(() => {
            btnInteract.style.background = "rgba(0,0,0,0.7)";
            btnInteract.style.color = "white";
        }, 200);
    });
}

function updateJoystick(clientX, clientY) {
    const maxDist = 50;
    let dx = clientX - joystickCenter.x;
    let dy = clientY - joystickCenter.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    if(distance > maxDist) {
        dx = (dx / distance) * maxDist;
        dy = (dy / distance) * maxDist;
    }
    
    joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    // Normalize to -1 to 1 (invert Y so forward is negative Z in 3D)
    Input.movement.x = dx / maxDist;
    Input.movement.y = dy / maxDist; 
                              }
           
