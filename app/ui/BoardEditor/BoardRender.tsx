'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { ILayer, type LayerType } from '@/models';
import { Sprite } from './renderer';

const colors: Record<LayerType, string> = {
    adhesive: 'silver',
    paste: 'silver',
    copper: '#fdba74',
    mask: 'green',
    cuts: 'white',
    drill: 'black',
    silkscreen: 'yellow',
};
const bg: Record<LayerType, string> = {
    adhesive: 'none',
    paste: 'none',
    copper: 'none',
    mask: 'none',
    cuts: 'none',
    drill: 'none',
    silkscreen: 'none',
};

export const BoardRender = ({ layers, scale }: PropsWithChildren<{ layers: ILayer[]; scale: number }>) => {
    const [isMoving, setMoving] = useState(false);
    const [activeLayer, setActiveLayer] = useState(0);
    const invalidate = useThree((three) => three.invalidate);

    useEffect(() => invalidate(), [activeLayer]);

    const content = (
        <group rotation={[Math.PI, 0, 0]} scale={[scale, scale, 0.1]}>
            {layers.map(({ id, enabled, invert, geometryUrl, index, mirrorX, mirrorY, type }) => enabled && (
                <Sprite
                    key={id}
                    src={geometryUrl}
                    opacity={index === activeLayer ? 1 : 0.7}
                    offset={{ x: 0, y: 0, z: layers.length - index - 2 }}
                    scale={{ x: 1, y: 1 }}
                    mirror={{ x: mirrorX, y: mirrorY }}
                    color={(invert ? bg : colors)[type]}
                    fill={(invert ? colors : bg)[type]}
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

