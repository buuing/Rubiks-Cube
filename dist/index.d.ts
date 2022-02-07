import * as THREE from 'three';
import Base from './base';
import { AxesVec3 } from './utils';
export default class CreepCube extends Base {
    intersect1: THREE.Intersection | null;
    intersect2: THREE.Intersection | null;
    startPlane: THREE.Vector3 | undefined;
    startPoint: THREE.Vector3 | null;
    movePoint: THREE.Vector3 | null;
    touchCube: THREE.Mesh | null;
    isRotating: boolean;
    isShuffling: boolean;
    isSolving: boolean;
    mouse: THREE.Vector2;
    raycaster: THREE.Raycaster;
    mesh: THREE.Group;
    children: THREE.Mesh[];
    coordinate: THREE.Vector3[];
    constructor(config?: {
        level: number;
    });
    computeMaterial(rules: boolean[], materials: THREE.MeshBasicMaterial[], defaultMaterial: THREE.MeshBasicMaterial, logoMaterial?: THREE.MeshBasicMaterial): THREE.MeshBasicMaterial[];
    initCube(): Promise<void>;
    computeRotation(): void;
    getStoreyByIndex(axis: 'x' | 'y' | 'z', i: number): number;
    getCubesByStorey(axis: 'x' | 'y' | 'z', storey?: number, sort?: number): THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>[];
    /**
     * 旋转逻辑
     */
    rotateCube(touchCube: THREE.Mesh, rotationAxis: keyof typeof AxesVec3, direction: 1 | -1): Promise<void>;
    clearState(): void;
    moveCube(cube: THREE.Mesh, vec3: THREE.Vector3, direction: 1 | -1): Promise<void>;
    resetCubes(): void;
    getMouseSite(e: MouseEvent | TouchEvent): void;
    onMouseDown(e: MouseEvent | TouchEvent): void;
    onMouseMove(e: MouseEvent | TouchEvent): void;
    onMouseUp(e: MouseEvent | TouchEvent): void;
    shuffleCube(): Promise<void>;
    initDebug(): void;
}
