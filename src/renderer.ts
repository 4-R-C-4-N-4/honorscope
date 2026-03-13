import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { PLANETS, ZODIAC_SIGNS } from './types';
import type { PlanetPosition } from './types';
import { getOrbitPath } from './astronomy';

// Scale AU distances logarithmically so all planets are visible
function scaleDistance(au: number): number {
  // Use a log scale: inner planets spread out, outer planets compress
  const sign = au >= 0 ? 1 : -1;
  const absAu = Math.abs(au);
  if (absAu < 0.001) return 0;
  return sign * (Math.log2(absAu + 1) * 4.5);
}

export class SolarSystemRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private labelRenderer: CSS2DRenderer;
  private controls: OrbitControls;
  private container: HTMLElement;

  private planetMeshes: Map<string, THREE.Mesh> = new Map();
  private planetLabels: Map<string, CSS2DObject> = new Map();
  private orbitLines: Map<string, THREE.Line> = new Map();
  private sunMesh!: THREE.Mesh;
  private sunGlow!: THREE.Mesh;

  constructor(container: HTMLElement) {
    this.container = container;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 25, 20);
    this.camera.lookAt(0, 0, 0);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // CSS2D Label Renderer
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(container.clientWidth, container.clientHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.left = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(this.labelRenderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 200;
    this.controls.maxPolarAngle = Math.PI * 0.85;

    // Build the scene
    this.createStarfield();
    this.createSun();
    this.createPlanets();
    this.createEclipticGrid();
    this.createZodiacRing();

    // Handle resize
    window.addEventListener('resize', () => this.onResize());
  }

  private createStarfield(): void {
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      // Random position on a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 500 + Math.random() * 500;

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      // Slight color variation
      const brightness = 0.5 + Math.random() * 0.5;
      const tint = Math.random();
      colors[i3] = brightness * (tint > 0.8 ? 1.0 : 0.9);
      colors[i3 + 1] = brightness * (tint > 0.9 ? 0.85 : 0.95);
      colors[i3 + 2] = brightness;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    this.scene.add(new THREE.Points(geometry, material));
  }

  private createSun(): void {
    // Sun sphere
    const sunGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc44,
    });
    this.sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    this.scene.add(this.sunMesh);

    // Sun glow
    const glowGeometry = new THREE.SphereGeometry(0.9, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      transparent: true,
      opacity: 0.15,
    });
    this.sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.scene.add(this.sunGlow);

    // Point light from sun
    const sunLight = new THREE.PointLight(0xfff5e0, 2, 300);
    sunLight.position.set(0, 0, 0);
    this.scene.add(sunLight);

    // Ambient light so planets are always somewhat visible
    const ambientLight = new THREE.AmbientLight(0x333355, 0.5);
    this.scene.add(ambientLight);

    // Sun label
    const sunLabelDiv = document.createElement('div');
    sunLabelDiv.className = 'planet-label';
    sunLabelDiv.textContent = 'Sun ☉';
    sunLabelDiv.style.color = '#ffcc44';
    const sunLabel = new CSS2DObject(sunLabelDiv);
    sunLabel.position.set(0, 1.0, 0);
    this.sunMesh.add(sunLabel);
  }

  private createPlanets(): void {
    for (const planet of PLANETS) {
      // Planet mesh
      const geometry = new THREE.SphereGeometry(planet.displaySize, 24, 24);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(planet.color),
        roughness: 0.7,
        metalness: 0.1,
        emissive: new THREE.Color(planet.color),
        emissiveIntensity: 0.15,
      });
      const mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);
      this.planetMeshes.set(planet.name, mesh);

      // Planet label
      const labelDiv = document.createElement('div');
      labelDiv.className = 'planet-label';
      labelDiv.textContent = planet.name;
      labelDiv.style.borderColor = planet.color + '44';
      const label = new CSS2DObject(labelDiv);
      label.position.set(0, planet.displaySize + 0.3, 0);
      mesh.add(label);
      this.planetLabels.set(planet.name, label);
    }
  }

  createOrbitPaths(referenceDate: Date): void {
    // Remove existing orbit lines
    for (const [, line] of this.orbitLines) {
      this.scene.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    }
    this.orbitLines.clear();

    for (const planet of PLANETS) {
      const orbitPoints = getOrbitPath(planet.body, referenceDate, 256);
      if (orbitPoints.length < 2) continue;

      const points = orbitPoints.map(
        p => new THREE.Vector3(scaleDistance(p.x), scaleDistance(p.z), -scaleDistance(p.y))
      );

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(planet.color),
        transparent: true,
        opacity: 0.25,
        linewidth: 1,
      });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.orbitLines.set(planet.name, line);
    }
  }

  private createEclipticGrid(): void {
    // Subtle grid on the ecliptic plane
    const gridSize = 60;
    const divisions = 30;
    const grid = new THREE.GridHelper(gridSize, divisions, 0x222244, 0x111133);
    grid.material.transparent = true;
    grid.material.opacity = 0.15;
    this.scene.add(grid);
  }

  private createZodiacRing(): void {
    const ringRadius = 28;
    const ringWidth = 0.8;
    const segmentsPerSign = 32;

    for (let i = 0; i < ZODIAC_SIGNS.length; i++) {
      const sign = ZODIAC_SIGNS[i];
      const startAngle = (sign.startDegree - 90) * (Math.PI / 180); // offset so Aries starts at right
      const endAngle = startAngle + (30 * Math.PI) / 180;

      // Arc segment
      const curve = new THREE.EllipseCurve(
        0, 0,
        ringRadius, ringRadius,
        startAngle, endAngle,
        false, 0
      );
      const points = curve.getPoints(segmentsPerSign);
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(sign.color),
        transparent: true,
        opacity: 0.4,
        linewidth: 2,
      });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);

      // Zodiac sign label
      const midAngle = (startAngle + endAngle) / 2;
      const labelX = (ringRadius + 1.5) * Math.cos(midAngle);
      const labelZ = (ringRadius + 1.5) * Math.sin(midAngle);

      const labelDiv = document.createElement('div');
      labelDiv.className = 'zodiac-label-3d';
      labelDiv.textContent = `${sign.symbol} ${sign.name}`;
      labelDiv.style.color = sign.color;
      const labelObj = new CSS2DObject(labelDiv);
      labelObj.position.set(labelX, 0, labelZ);
      this.scene.add(labelObj);
    }

    // Inner and outer ring circles
    for (const r of [ringRadius - ringWidth / 2, ringRadius + ringWidth / 2]) {
      const curve = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(128);
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const material = new THREE.LineBasicMaterial({
        color: 0x444466,
        transparent: true,
        opacity: 0.2,
      });
      this.scene.add(new THREE.Line(geometry, material));
    }
  }

  updatePlanetPositions(positions: PlanetPosition[]): void {
    for (const pos of positions) {
      const mesh = this.planetMeshes.get(pos.name);
      if (mesh) {
        // Convert AU to scaled scene coordinates
        // astronomy-engine: x,y in ecliptic plane, z is up
        // Three.js: x,z in ground plane, y is up
        mesh.position.set(
          scaleDistance(pos.x),
          scaleDistance(pos.z),
          -scaleDistance(pos.y)
        );
      }
    }
  }

  render(): void {
    this.controls.update();

    // Gentle sun pulsing
    const t = Date.now() * 0.001;
    if (this.sunGlow) {
      const scale = 1 + Math.sin(t * 2) * 0.05;
      this.sunGlow.scale.setScalar(scale);
    }

    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
  }

  dispose(): void {
    window.removeEventListener('resize', () => this.onResize());
    this.controls.dispose();
    this.renderer.dispose();
  }
}
