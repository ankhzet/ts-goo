'use client';

import { PropsWithChildren } from 'react';
import { Canvas as Renderer } from '@react-three/fiber';

import { AssetLoader } from './AssetLoader';
import { GridBed } from '../GridBed';
import { Controls } from './Controls';

export const Canvas = ({ assets, children, ...rest }: PropsWithChildren<{ assets: string[]; className?: string }>) => {
    return (
        <Renderer
            frameloop="demand"
            camera={{
                position: [0, 0, 100],
                zoom: 10,
                near: 0.1,
                far: 100,
                up: [0, 0, 1],
            }}
            orthographic
            gl={{
                antialias: true,
                pixelRatio: globalThis.devicePixelRatio,
                depth: true,
                logarithmicDepthBuffer: true,
            }}
            style={{ width: 'auto', height: 'auto', background: '#1e1e1e' }}
            onContextMenu={(e) => e.preventDefault()}
            {...rest}
        >
            <ambientLight />
            <GridBed width={1000} height={1000} />
            <Controls>
                <AssetLoader urls={assets} placeholder={<div>Loading</div>}>
                    {children}
                </AssetLoader>
            </Controls>
        </Renderer>
    );
};

