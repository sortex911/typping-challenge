import * as THREE from 'three';

export function initThief() {
    // allow manual trigger for verification
    window.addEventListener('spawnThief', () => {
        spawnThief();
    });

    // Start the theft cycle - every 3 seconds as requested
    setInterval(() => {
        spawnThief();
    }, 3000);
}

function spawnThief() {
    const letters = document.querySelectorAll('.letter:not(.stolen)');
    if (letters.length === 0) return;

    const targetLetter = letters[Math.floor(Math.random() * letters.length)];
    const robotContainer = create3DRobotElement();
    document.body.appendChild(robotContainer);

    // Initial position (off-screen)
    const startFromLeft = Math.random() > 0.5;
    const startX = startFromLeft ? -150 : window.innerWidth + 150;
    const startY = Math.random() * window.innerHeight;

    robotContainer.style.left = `${startX}px`;
    robotContainer.style.top = `${startY}px`;

    // Step 1: Fly to letter
    setTimeout(() => {
        const letterRect = targetLetter.getBoundingClientRect();
        const targetX = letterRect.left + letterRect.width / 2 - 40;
        const targetY = letterRect.top + letterRect.height / 2 - 40;

        // Smooth flight to target
        robotContainer.style.transition = 'all 2s cubic-bezier(0.4, 0, 0.2, 1)';
        robotContainer.style.left = `${targetX}px`;
        robotContainer.style.top = `${targetY}px`;

        // Step 2: "Grab" the letter
        setTimeout(() => {
            if (targetLetter.classList.contains('stolen')) {
                // Someone else got it? Just fly away
                flyAway(robotContainer, startFromLeft);
                return;
            }

            targetLetter.classList.add('stolen');

            // Make letter follow robot
            const followLetter = () => {
                const robotRect = robotContainer.getBoundingClientRect();
                targetLetter.style.position = 'fixed';
                targetLetter.style.left = `${robotRect.left + 30}px`;
                targetLetter.style.top = `${robotRect.top + 30}px`;
                if (document.body.contains(robotContainer)) {
                    requestAnimationFrame(followLetter);
                }
            };
            followLetter();

            // Step 3: Fly away
            setTimeout(() => {
                flyAway(robotContainer, startFromLeft, targetLetter);
            }, 1000);
        }, 2000);
    }, 100);
}

function flyAway(container, startFromLeft, targetLetter = null) {
    const exitX = startFromLeft ? window.innerWidth + 300 : -300;
    const exitY = Math.random() * window.innerHeight;

    container.style.transition = 'all 2.5s cubic-bezier(0.4, 0, 1, 1)';
    container.style.left = `${exitX}px`;
    container.style.top = `${exitY}px`;

    // Step 4: Cleanup
    setTimeout(() => {
        container.remove();
        if (targetLetter) {
            const char = targetLetter.textContent;
            const letterClass = targetLetter.className.split(' ').find(c => c.startsWith('letter-'));
            targetLetter.remove();
            respawnLetter(char, letterClass);
        }
    }, 2500);
}

function create3DRobotElement() {
    const container = document.createElement('div');
    container.className = 'robot-thief-3d';
    container.style.position = 'fixed';
    container.style.width = '160px';
    container.style.height = '160px';
    container.style.zIndex = '10000';
    container.style.pointerEvents = 'none';
    container.style.filter = 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.9))';

    // Three.js Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(160, 160);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Robot Model (Improved 3D)
    // Head/Body
    const bodyGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0x3b82f6,
        shininess: 100,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    scene.add(body);

    // Eyes (Bright eyes)
    const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.4, 0.3, 0.6);
    body.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.4, 0.3, 0.6);
    body.add(rightEye);

    // Arms
    const armGeometry = new THREE.BoxGeometry(1.0, 0.25, 0.25);
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-1.0, -0.2, 0);
    leftArm.rotation.z = Math.PI / 4;
    body.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(1.0, -0.2, 0);
    rightArm.rotation.z = -Math.PI / 4;
    body.add(rightArm);

    // Thruster glow (Brighter)
    const thrusterGeometry = new THREE.CylinderGeometry(0.4, 0, 0.8, 16);
    const thrusterMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.9
    });
    const thruster = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
    thruster.position.y = -1.0;
    body.add(thruster);

    // Lighting (Stronger)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2.0);
    pointLight.position.set(2, 2, 5);
    scene.add(pointLight);

    camera.position.z = 3.0;

    // Animation Loop
    let animationId;
    function animate() {
        if (!document.body.contains(container)) {
            cancelAnimationFrame(animationId);
            renderer.dispose();
            return;
        }
        animationId = requestAnimationFrame(animate);

        body.rotation.y += 0.08;
        body.rotation.x = Math.sin(Date.now() * 0.005) * 0.3;
        thruster.scale.y = 1 + Math.sin(Date.now() * 0.02) * 0.3;
        thruster.material.opacity = 0.5 + Math.random() * 0.5;

        renderer.render(scene, camera);
    }
    animate();

    return container;
}


function respawnLetter(char, letterClass) {
    const container = document.querySelector('.floating-letters');
    if (!container) return;

    setTimeout(() => {
        const newLetter = document.createElement('span');
        newLetter.className = `letter ${letterClass}`;
        newLetter.textContent = char;
        container.appendChild(newLetter);
    }, 5000); // Respawn after 5s
}

