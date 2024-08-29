'use client';

import { useState } from 'react';
import { PivotControls, Plane } from '@react-three/drei';
import { DoubleSide, Matrix4, Vector3 } from 'three';

import { useLastCallback } from '../hooks';
import type { Rect } from './renderer';

const v = new Vector3();

export const Crop = ({ rect, scale }: { rect: Rect; scale: number }) => {
    const [{ min, max }, setRect] = useState(rect);
    const [shadow, setShadow] = useState(rect);
    const sizeX = max.x - min.x;
    const sizeY = max.y - min.y;

    const handleMin = useLastCallback((l: Matrix4) => {
        const delta = v.setFromMatrixPosition(l);

        setShadow({
            min: { ...delta.add(min) },
            max,
        });
    });

    const handleMax = useLastCallback((l: Matrix4) => {
        const delta = v.setFromMatrixPosition(l);

        setShadow({
            min,
            max: { ...delta.add(max) },
        });
    });

    console.log(sizeX);

    return (
        <group
            position={[0, 0, 5]}
            scale={[scale, scale, 1]}
            rotation={[Math.PI, 0, 0]}
        >
            <Plane
                args={[1, 1]}
                position={[shadow.min.x + (shadow.max.x - shadow.min.x) / 2, shadow.min.y + (shadow.max.y - shadow.min.y) / 2, 0.1]}
                scale={[shadow.max.x - shadow.min.x, shadow.max.y - shadow.min.y, 1]}
            >
                <meshBasicMaterial
                    // wireframe
                    transparent
                    side={DoubleSide}
                    opacity={0.05}
                    color="#88ffff"
                />
            </Plane>

            <group
                // scale={[1 / scale, 1 / scale, 1]}
            >
                <PivotControls
                    fixed
                    disableRotations
                    disableScaling
                    scale={50}
                    depthTest={true}
                    activeAxes={[true, true, false]}
                    offset={[min.x, min.y, 0]}
                    translationLimits={[
                        [-Infinity, sizeX * scale],
                        [-Infinity, sizeY * scale],
                        [0, 0],
                    ]}
                    rotation={[0, 0, 0]}
                    onDrag={handleMin}
                 />

                <PivotControls
                    fixed
                    disableRotations
                    disableScaling
                    scale={50}
                    depthTest={false}
                    activeAxes={[true, true, false]}
                    offset={[max.x, max.y, 0.2]}
                    translationLimits={[
                        [-Infinity, sizeX * scale],
                        [-Infinity, sizeY * scale],
                        [0, 0],
                    ]}
                    rotation={[Math.PI, Math.PI, 0]}
                    onDrag={handleMax}
                 />
            </group>
        </group>
    );
};
