import * as THREE from 'three';
export declare const rotateAroundWorldAxis: (origin: THREE.Vector3, vector: THREE.Vector3, radius: number) => THREE.Matrix4;
export declare const XYZ_VALUE: number;
export declare const AxesEnum: {
    0: string;
    1: string;
    2: string;
    x: number;
    y: number;
    z: number;
};
export declare const Axes: {
    'x+': THREE.Vector3;
    'x-': THREE.Vector3;
    'y+': THREE.Vector3;
    'y-': THREE.Vector3;
    'z+': THREE.Vector3;
    'z-': THREE.Vector3;
};
export declare const colors: string[];
export declare const getCubeFace: (color: string) => HTMLCanvasElement;
