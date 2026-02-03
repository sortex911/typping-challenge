import * as THREE from 'three';

class KeyboardRobots {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'keyboard-robots-container';
        this.container.style.position = 'fixed';
        this.container.style.left = '0';
        this.container.style.top = '0';
        this.container.style.width = '35vw';
        this.container.style.height = '100vh';
        this.container.style.zIndex = '2';
        this.container.style.pointerEvents = 'none';
        this.container.style.opacity = '1';
        document.body.appendChild(this.container);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, (window.innerWidth * 0.35) / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.updateSize();
        this.container.appendChild(this.renderer.domElement);

        this.keys = [];
        this.robots = [];
        this.labels = [
            ['1', '2', '3', '4', '5', '6', '7', '8'],
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ','],
            ['Ctrl', 'Alt', ' ', ' ', ' ', ' ', 'Alt', 'Ctrl']
        ];

        this.initScene();
        this.animate();

        window.addEventListener('resize', () => this.updateSize());
    }

    updateSize() {
        const width = window.innerWidth * 0.35;
        const height = window.innerHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    createKeyTexture(label) {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, size, size);

        // Border
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 15;
        ctx.strokeRect(5, 5, size - 10, size - 10);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 120px Arial'; // Use common font for safety
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    initScene() {
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 1.2);
        spotLight.position.set(-5, 10, 5);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        this.scene.add(spotLight);

        const pointLight = new THREE.PointLight(0xa855f7, 1);
        pointLight.position.set(5, 5, -5);
        this.scene.add(pointLight);

        // Keyboard Base
        const rows = 5;
        const cols = 8;
        const keySize = 0.8;
        const spacing = 0.15;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const label = this.labels[r][c];
                const keyGeometry = new THREE.BoxGeometry(keySize, 0.4, keySize);

                // Realistic PBR Material
                const topMat = new THREE.MeshStandardMaterial({
                    map: this.createKeyTexture(label),
                    roughness: 0.2,
                    metalness: 0.1,
                    emissive: 0x3b82f6,
                    emissiveIntensity: 0.1
                });

                const sideMat = new THREE.MeshStandardMaterial({
                    color: 0x0f172a,
                    roughness: 0.5,
                    metalness: 0.1
                });

                // Apply texture only to top face
                const materials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];

                const key = new THREE.Mesh(keyGeometry, materials);
                key.position.set(
                    (c - cols / 2) * (keySize + spacing) - 2, // Shifted left
                    0,
                    (r - rows / 2) * (keySize + spacing)
                );
                key.castShadow = true;
                key.receiveShadow = true;
                this.scene.add(key);
                this.keys.push(key);
            }
        }

        // Camera positioning
        this.camera.position.set(-8, 10, 10);
        this.camera.lookAt(-2, 0, 0);

        // Create 4 Robots with better materials
        for (let i = 0; i < 4; i++) {
            const robot = this.createRobot(i);
            this.scene.add(robot);
            this.robots.push({
                mesh: robot,
                targetKey: this.getRandomKey(),
                currentKey: this.getRandomKey(),
                lerp: 0,
                speed: 0.015 + Math.random() * 0.015,
                jumpHeight: 1.2 + Math.random() * 0.8
            });
            robot.position.copy(this.robots[i].currentKey.position);
            robot.position.y += 0.5;
        }
    }

    createRobot(index) {
        const group = new THREE.Group();
        const colors = [0xef4444, 0x10b981, 0x3b82f6, 0xf59e0b];

        // Body (Glowy Orb)
        const bodyGeo = new THREE.SphereGeometry(0.35, 32, 32);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: colors[index],
            emissive: colors[index],
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.5
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.castShadow = true;
        group.add(body);

        // Eyes (Neon)
        const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.15, 0.1, 0.25);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.15, 0.1, 0.25);
        group.add(rightEye);

        // Core light
        const light = new THREE.PointLight(colors[index], 1, 3);
        group.add(light);

        return group;
    }

    getRandomKey() {
        return this.keys[Math.floor(Math.random() * this.keys.length)];
    }

    setVisible(visible) {
        this.container.style.display = visible ? 'block' : 'none';
        this.isPaused = !visible;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.isPaused) return;

        this.robots.forEach(robot => {
            robot.lerp += robot.speed;

            if (robot.lerp >= 1) {
                const landedKey = robot.targetKey;
                landedKey.position.y = -0.25;
                // Stronger emissive feedback on key top (index 2)
                landedKey.material[2].emissive.setHex(0x3b82f6);
                landedKey.material[2].emissiveIntensity = 2;

                robot.currentKey = robot.targetKey;
                robot.targetKey = this.getRandomKey();
                robot.lerp = 0;
            }

            const startPos = robot.currentKey.position.clone();
            const endPos = robot.targetKey.position.clone();
            startPos.y += 0.5;
            endPos.y += 0.5;

            robot.mesh.position.lerpVectors(startPos, endPos, robot.lerp);
            robot.mesh.position.y += Math.sin(robot.lerp * Math.PI) * robot.jumpHeight;
            robot.mesh.lookAt(endPos.x, robot.mesh.position.y, endPos.z);
        });

        this.keys.forEach(key => {
            if (key.position.y < 0) {
                key.position.y += 0.03;
                key.material[2].emissiveIntensity *= 0.9;
            } else {
                key.position.y = 0;
                key.material[2].emissiveIntensity = 0;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }
}

let keyboardInstance = null;

export function initKeyboardRobots() {
    if (typeof THREE !== 'undefined') {
        keyboardInstance = new KeyboardRobots();
    }
}

export function setKeyboardVisibility(visible) {
    if (keyboardInstance) {
        keyboardInstance.setVisible(visible);
    }
}
