import React, { ComponentProps, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';

export const Overlay = ({ children, ...props }: ComponentProps<typeof Html>) => {
    const node = useRef<HTMLDivElement>(null!);

    useEffect(() => {
        if (node.current?.parentElement) {
            Object.assign(node.current.parentElement.style, {
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
            })
        }
    }, []);

    return (
        <Html ref={node} zIndexRange={[0, 0]} eps={0.1} {...props}>
            {children}
        </Html>
    );
};
