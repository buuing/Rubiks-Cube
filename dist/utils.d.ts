import * as THREE from 'three';
export declare const rotateAroundWorldAxis: (origin: THREE.Vector3, vector: THREE.Vector3, radius: number) => THREE.Matrix4;
export declare enum AxesEnum {
    x = 0,
    y = 1,
    z = 2
}
export declare const XYZ_VALUE: number;
export declare const AxesVec3: {
    'x+': THREE.Vector3;
    'x-': THREE.Vector3;
    'y+': THREE.Vector3;
    'y-': THREE.Vector3;
    'z+': THREE.Vector3;
    'z-': THREE.Vector3;
};
export declare const colors: string[];
export declare const getFaceColor: (color: string, radius?: number, gutter?: number, gutterColor?: string, text?: string) => HTMLCanvasElement;
