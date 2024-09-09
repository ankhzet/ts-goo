import React, { useEffect, useState } from 'react';
import { Grid, Line, Plane } from '@react-three/drei';
import { BackSide, Color, MeshBasicMaterial } from 'three';
import { useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export interface GridBedProps {
    width: number;
    height: number;
}

const plane = new MeshBasicMaterial({
    color: new Color('silver'),
    opacity: 0.1,
    transparent: true,
});

const scales = [1, 1, 1, 1, 1, 1, 1, 1, 1, 2.5, 2.5, 2.5, 2.5, 5, 5, 5, 10, 10, 20, 20];

export const GridBed = ({ width, height }: GridBedProps) => {
    const controls = useThree((three) => three.controls as OrbitControlsImpl);
    const [scale, setScale] = useState(scales[scales.length - 1]);

    useEffect(() => {
        if (!controls) {
            return;
        }

        const handler = () => {
            const normalized = (controls.object.zoom - 10) / (200 - 10);
            const steps = (19 * Math.max(0, Math.min(1 - normalized, 1)) + 1);
            const zoom = scales[~~steps - 1] || steps;

            setScale(~~zoom);
        };

        controls.addEventListener('change', handler);

        return () => {
            controls.removeEventListener('change', handler);
        };
    });
    return (
        <group position={[0, 0, -1]}>
            <Plane
                args={[width, height]}
                position-z={-1}
                material={plane}
            />

            <Line points={[[-width, 0, -0.5], [width, 0, -0.5]]} lineWidth={2} />
            <Line points={[[0, -height, -0.5], [0, height, -0.5]]} lineWidth={2} />

            <Grid
                fadeStrength={0}
                cellColor="#aaaaaa"
                cellSize={scale / 10}
                cellThickness={1}
                sectionSize={scale / 2}
                sectionColor="#ffffff"
                sectionThickness={1.5}
                side={BackSide}
                rotation={[Math.PI / 2, 0, 0]}
                args={[width, height]}
            />
        </group>
    );
};
