import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById("scene-container").appendChild(renderer.domElement);

// Thêm dải ngân hà
function createGalaxy() {
  const galaxyGeometry = new THREE.BufferGeometry();
  const galaxyCount = 100000;
  const positions = new Float32Array(galaxyCount * 3);
  const colors = new Float32Array(galaxyCount * 3);
  const sizes = new Float32Array(galaxyCount);
  const spiral = new Float32Array(galaxyCount);

  const arms = 2; // Số nhánh xoắn
  const armWidth = 0.3; // Độ rộng của mỗi nhánh
  const innerRadius = 100; // Bán kính trong
  const outerRadius = 400; // Bán kính ngoài

  for (let i = 0; i < galaxyCount; i++) {
    const i3 = i * 3;

    // Tính toán vị trí theo hình xoắn ốc
    const radius = Math.random() * (outerRadius - innerRadius) + innerRadius;
    const spinAngle = radius * 2.5;
    const branchAngle = (Math.PI * 2 * Math.floor(Math.random() * arms)) / arms;

    const randomX =
      Math.pow(Math.random(), 3) *
      (Math.random() < 0.5 ? 1 : -1) *
      armWidth *
      radius;
    const randomY =
      Math.pow(Math.random(), 3) *
      (Math.random() < 0.5 ? 1 : -1) *
      armWidth *
      radius;
    const randomZ =
      Math.pow(Math.random(), 3) *
      (Math.random() < 0.5 ? 1 : -1) *
      armWidth *
      radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Màu sắc
    const mixColor = Math.random();
    if (mixColor < 0.3) {
      colors[i3] = 0.75 + Math.random() * 0.25; // R
      colors[i3 + 1] = 0.5 + Math.random() * 0.3; // G
      colors[i3 + 2] = 0.4 + Math.random() * 0.2; // B
    } else if (mixColor < 0.6) {
      colors[i3] = 0.4 + Math.random() * 0.2; // R
      colors[i3 + 1] = 0.5 + Math.random() * 0.3; // G
      colors[i3 + 2] = 0.75 + Math.random() * 0.25; // B
    } else {
      colors[i3] = 0.75 + Math.random() * 0.25; // R
      colors[i3 + 1] = 0.75 + Math.random() * 0.25; // G
      colors[i3 + 2] = 0.75 + Math.random() * 0.25; // B
    }

    // Kích thước
    sizes[i] = Math.random() * 2.0;

    // Góc xoắn
    spiral[i] = spinAngle;
  }

  galaxyGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  galaxyGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  galaxyGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  galaxyGeometry.setAttribute("spiral", new THREE.BufferAttribute(spiral, 1));

  const galaxyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: window.devicePixelRatio },
    },
    vertexShader: `
            attribute float size;
            attribute float spiral;
            varying vec3 vColor;
            uniform float time;
            uniform float pixelRatio;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                
                // Thêm hiệu ứng chuyển động xoay
                float angle = spiral + time * 0.1;
                float radius = length(position.xz);
                vec3 pos = position;
                pos.x = cos(angle) * radius;
                pos.z = sin(angle) * radius;
                mvPosition = modelViewMatrix * vec4(pos, 1.0);
                
                float distance = length(mvPosition.xyz);
                gl_PointSize = size * (2000.0 / distance) * pixelRatio;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
    fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                
                if(dist > 0.5) discard;
                
                float strength = 1.0 - (dist * 2.0);
                strength = pow(strength, 3.0);
                
                vec3 glow = vColor * strength * 2.0;
                gl_FragColor = vec4(glow, strength * 0.8);
            }
        `,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
  galaxy.rotation.x = Math.PI / 6; // Nghiêng dải ngân hà một chút
  scene.add(galaxy);
  return galaxy;
}

// Stars Background
function createStars() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 20000;
  const positions = new Float32Array(starsCount * 3);
  const colors = new Float32Array(starsCount * 3);
  const sizes = new Float32Array(starsCount);
  const twinkleSpeed = new Float32Array(starsCount);

  for (let i = 0; i < starsCount * 3; i += 3) {
    const radius = Math.random() * 500 + 500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = radius * Math.cos(phi);

    const starType = Math.random();
    if (starType < 0.15) {
      colors[i] = 1.0;
      colors[i + 1] = 0.4;
      colors[i + 2] = 0.4;
    } else if (starType < 0.3) {
      colors[i] = 1.0;
      colors[i + 1] = 0.8;
      colors[i + 2] = 0.4;
    } else if (starType < 0.45) {
      colors[i] = 0.4;
      colors[i + 1] = 0.6;
      colors[i + 2] = 1.0;
    } else if (starType < 0.6) {
      colors[i] = 0.8;
      colors[i + 1] = 0.4;
      colors[i + 2] = 1.0;
    } else {
      colors[i] = 1.0;
      colors[i + 1] = 1.0;
      colors[i + 2] = 1.0;
    }

    sizes[i / 3] = Math.random() * 3;
    twinkleSpeed[i / 3] = Math.random() * 0.03 + 0.01;
  }

  starsGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  starsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  starsGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  starsGeometry.setAttribute(
    "twinkleSpeed",
    new THREE.BufferAttribute(twinkleSpeed, 1)
  );

  const starsMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: window.devicePixelRatio },
    },
    vertexShader: `
      attribute float size;
      attribute float twinkleSpeed;
      varying vec3 vColor;
      uniform float time;
      uniform float pixelRatio;
      
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float distance = length(mvPosition.xyz);
        
        float twinkle = sin(time * twinkleSpeed * 10.0) * 0.5 + 0.5;
        
        gl_PointSize = size * (300.0 / distance) * pixelRatio * (0.8 + 0.4 * twinkle);
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        float strength = 1.0 - (dist * 2.0);
        strength = pow(strength, 3.0);
        
        vec3 glow = vColor * strength * 2.0;
        
        if (dist > 0.5) discard;
        gl_FragColor = vec4(glow, strength);
      }
    `,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
  return stars;
}

// Texture loader with error handling
const textureLoader = new THREE.TextureLoader();
const loadTexture = (url, fallbackColor = 0xcccccc) => {
  const texture = textureLoader.load(url, undefined, undefined, (error) => {
    console.warn(`Error loading texture ${url}:`, error);
    material.map = null;
    material.color.setHex(fallbackColor);
    material.needsUpdate = true;
  });
  return texture;
};

// Planet textures using Solar System Scope textures (public domain)
const planetTextures = {
  Mercury: "https://www.solarsystemscope.com/textures/download/2k_mercury.jpg",
  Venus:
    "https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg",
  Earth:
    "https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg",
  Mars: "https://www.solarsystemscope.com/textures/download/2k_mars.jpg",
  Jupiter: "https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg",
  Saturn: "https://www.solarsystemscope.com/textures/download/2k_saturn.jpg",
  Uranus: "https://www.solarsystemscope.com/textures/download/2k_uranus.jpg",
  Neptune: "https://www.solarsystemscope.com/textures/download/2k_neptune.jpg",
};

// Normal maps
const planetNormalMaps = {
  Earth:
    "https://www.solarsystemscope.com/textures/download/2k_earth_normal_map.png",
  Mars: "https://www.solarsystemscope.com/textures/download/2k_mars_normal_map.png",
};

// Specular maps
const planetSpecularMaps = {
  Earth:
    "https://www.solarsystemscope.com/textures/download/2k_earth_specular_map.png",
};

// Custom shader for creating planet textures
const createPlanetShader = (baseColor, patternColor, noiseScale = 20.0) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(baseColor) },
      patternColor: { value: new THREE.Color(patternColor) },
      noiseScale: { value: noiseScale },
    },
    vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            uniform vec3 baseColor;
            uniform vec3 patternColor;
            uniform float noiseScale;
            
            varying vec2 vUv;
            varying vec3 vNormal;
            
            // Simplex noise function
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187,
                                  0.366025403784439,
                                 -0.577350269189626,
                                  0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                    + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                    dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            void main() {
                float noise = snoise(vUv * noiseScale);
                vec3 color = mix(baseColor, patternColor, noise * 0.5 + 0.5);
                
                // Add atmosphere effect at edges
                float atmosphere = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
                color += atmosphere * patternColor * 0.3;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `,
  });
};

// Create Sun with custom shader
const sunGeometry = new THREE.SphereGeometry(5, 64, 64);
const sunMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
  },
  vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
            vec2 uv = vUv * 20.0;
            float pattern = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time) * 0.5 + 0.5;
            vec3 color = mix(vec3(1.0, 0.6, 0.0), vec3(1.0, 0.8, 0.0), pattern);
            
            // Add sun glow
            float glow = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
            color += vec3(1.0, 0.6, 0.0) * glow;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `,
});

const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create custom materials for each planet
const planetMaterials = {
  Mercury: createPlanetShader(0x808080, 0x505050, 30.0),
  Venus: createPlanetShader(0xffd700, 0xff8c00, 15.0),
  Earth: createPlanetShader(0x0077be, 0x009900, 25.0),
  Mars: createPlanetShader(0xff4500, 0x8b0000, 20.0),
  Jupiter: createPlanetShader(0xffa500, 0x8b4513, 10.0),
  Saturn: createPlanetShader(0xffd700, 0xdaa520, 12.0),
  Uranus: createPlanetShader(0x40e0d0, 0x00ced1, 18.0),
  Neptune: createPlanetShader(0x0000cd, 0x000080, 15.0),
};

// Moon data for major planets
const moonData = {
  Earth: [{ radius: 0.3, distance: 3, speed: 0.015, color: 0xcccccc }], // Moon
  Jupiter: [
    { radius: 0.4, distance: 4, speed: 0.02, color: 0xe8dfd0 }, // Io
    { radius: 0.35, distance: 5, speed: 0.015, color: 0xc2b280 }, // Europa
    { radius: 0.45, distance: 6, speed: 0.01, color: 0x8b7355 }, // Ganymede
  ],
  Saturn: [
    { radius: 0.35, distance: 4, speed: 0.02, color: 0xe8dfd0 }, // Titan
  ],
};

// Create Planets with enhanced materials
const planets = [];
const planetData = [
  { name: "Mercury", radius: 0.8, distance: 10, speed: 0.01, color: 0x808080 },
  { name: "Venus", radius: 1.2, distance: 15, speed: 0.007, color: 0xffd700 },
  { name: "Earth", radius: 1.5, distance: 20, speed: 0.005, color: 0x0000ff },
  { name: "Mars", radius: 1, distance: 25, speed: 0.004, color: 0xff4500 },
  { name: "Jupiter", radius: 3, distance: 35, speed: 0.002, color: 0xffa500 },
  { name: "Saturn", radius: 2.5, distance: 45, speed: 0.0015, color: 0xffd700 },
  { name: "Uranus", radius: 2, distance: 55, speed: 0.001, color: 0x40e0d0 },
  { name: "Neptune", radius: 2, distance: 65, speed: 0.0008, color: 0x0000cd },
];

planetData.forEach((data) => {
  const planetGeometry = new THREE.SphereGeometry(data.radius, 64, 64);
  const planetMaterial = planetMaterials[data.name];
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);

  planet.castShadow = true;
  planet.receiveShadow = true;

  // Create orbit
  const orbitGeometry = new THREE.RingGeometry(
    data.distance - 0.1,
    data.distance + 0.1,
    128
  );
  const orbitMaterial = new THREE.MeshBasicMaterial({
    color: 0x666666,
    side: THREE.DoubleSide,
    opacity: 0.3,
    transparent: true,
  });
  const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);

  // Add Saturn's rings
  if (data.name === "Saturn") {
    const ringsGeometry = new THREE.RingGeometry(3.5, 5, 64);
    const ringsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          float ring = fract(vUv.x * 30.0 + time * 0.5);
          vec3 color = mix(
            vec3(0.7, 0.6, 0.4),
            vec3(0.3, 0.2, 0.1),
            ring
          );
          gl_FragColor = vec4(color, 0.8);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const rings = new THREE.Mesh(ringsGeometry, ringsMaterial);
    rings.rotation.x = Math.PI / 3;
    planet.add(rings);
  }

  // Add moons
  if (moonData[data.name]) {
    moonData[data.name].forEach((moonInfo) => {
      const moonGeometry = new THREE.SphereGeometry(moonInfo.radius, 32, 32);
      const moonMaterial = createPlanetShader(moonInfo.color, 0x808080, 40.0);
      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.position.x = moonInfo.distance;

      const moonPivot = new THREE.Object3D();
      moonPivot.add(moon);
      planet.add(moonPivot);

      moon.userData = {
        distance: moonInfo.distance,
        speed: moonInfo.speed,
        angle: Math.random() * Math.PI * 2,
      };
    });
  }

  planet.position.x = data.distance;
  planets.push({
    mesh: planet,
    distance: data.distance,
    speed: data.speed,
    angle: Math.random() * Math.PI * 2,
  });
  scene.add(planet);
});

// Enhanced Lighting
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2, 300);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// Camera position
camera.position.z = 50;
camera.position.y = 30;
camera.position.x = 30;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 200;

// Tạo dải ngân hà và stars
const galaxySystem = createGalaxy();
const starsSystem = createStars();

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update sun shader
  sunMaterial.uniforms.time.value += 0.01;

  // Update stars và galaxy shader
  starsSystem.material.uniforms.time.value += 0.005;
  starsSystem.rotation.y += 0.0001;
  galaxySystem.material.uniforms.time.value += 0.0005;

  // Rotate planets
  planets.forEach((planet) => {
    planet.angle += planet.speed;
    planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
    planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
    planet.mesh.rotation.y += planet.speed * 2;

    // Animate moons and rings
    planet.mesh.children.forEach((child) => {
      if (child instanceof THREE.Object3D && child.children.length > 0) {
        child.rotation.y += child.children[0].userData.speed;
      }
      if (child.material && child.material.uniforms) {
        child.material.uniforms.time.value += 0.01;
      }
    });
  });

  // Rotate sun
  sun.rotation.y += 0.001;

  controls.update();
  renderer.render(scene, camera);
}

animate();
