'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { ILayer } from '@/models';
import { Sprite } from './renderer';

export const BoardRender = ({ layers, scale }: PropsWithChildren<{ layers: ILayer[]; scale: number }>) => {
    const [isMoving, setMoving] = useState(false);
    const [activeLayer, setActiveLayer] = useState(0);
    const invalidate = useThree((three) => three.invalidate);

    useEffect(() => invalidate(), [activeLayer]);

    const content = (
        <group rotation={[Math.PI, 0, 0]} scale={[scale, scale, 0]}>
            {layers.map(({ id, enabled, geometryUrl, index }) => enabled && (
                <Sprite
                    key={id}
                    src={geometryUrl}
                    opacity={index === activeLayer ? 1 : 0.5}
                    offset={{ x: 0, y: 0, z: layers.length - index - 1 }}
                    scale={{ x: 1, y: 1 }}
                />
            ))}
        </group>
    );

    if (isMoving) {
        return (
            <TransformControls axis="xy">
                {content}
            </TransformControls>
        );
    }

    return content;
};

