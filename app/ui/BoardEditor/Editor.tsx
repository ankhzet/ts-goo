'use client';

import { useMemo } from 'react';
import { Vector3 } from 'three';

import { IBoard, ILayer } from '@/models';
import { useAssets } from './renderer';
import { BoardRender } from './BoardRender';
import { Crop } from './Crop';

export const Editor = ({ layers }: { board: IBoard; layers: ILayer[] }) => {
    const assets = useAssets(layers.map((layer) => layer.geometryUrl));
    const rect = useMemo(() => {
        const min = new Vector3(0, 0);
        const max = new Vector3(-Infinity, -Infinity);

        for (const asset of assets) {
            if (!asset) {
                continue;
            }

            const { width, height } = asset;

            if (width > max.x) {
                max.x = width;
            }

            if (height > max.y) {
                max.y = height;
            }
        }

        console.log(...max.toArray());

        return {
            min,
            max,
        };
    }, [layers]);

    return (
        <group>
            <BoardRender layers={layers} scale={0.1} />
            <Crop rect={rect} scale={0.1} />
        </group>
    );
};
