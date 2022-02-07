import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
export default class Base {
    width: number;
    height: number;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    constructor();
    initRenderer(): void;
    initScene(): void;
    initCamera(): void;
    initLight(color?: number): void;
    initControls(): void;
    render(): void;
}
