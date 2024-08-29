'use client';

import { clsx } from 'clsx';
import { useMemo } from 'react';

import { IBoard, ILayer } from '@/models';
import { Canvas } from './renderer';
import { Editor } from './Editor';

interface Props {
    board: IBoard;
    layers: ILayer[];
    className?: string;
}

const Wrapper = ({ board, layers, className }: Props) => {
    const sorted = useMemo(() => layers.toSorted((a, b) => b.index - a.index), [layers])
    const urls = useMemo(() => layers.map((layer) => layer.geometryUrl), [layers]);

    return (
        <Canvas assets={urls} className={clsx('w-auto h-100 flex-grow rounded', className)}>
            <Editor board={board} layers={sorted} />
        </Canvas>
    );
};

export const BoardEditor = (props: Props) => {
    if (typeof window === 'undefined') {
        return <Canvas assets={[]} className={clsx('w-auto h-100 flex-grow rounded', props.className)} />;
    }

    return (
        <Wrapper {...props} />
    );
};
