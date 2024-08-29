'use client';

import { PropsWithChildren, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Quaternion, Vector2, Vector2Like, Vector3 } from 'three';

class ObservableVector2 extends Vector2 {
    constructor(listener: (t: ObservableVector2) => void) {
        super();

        return new Proxy(this, {
            set(target, p, newValue): boolean {
                (target as any)[p] = newValue;

                if (p === 'x' || p === 'y') {
                    listener(target);
                }

                return true;
            }
        });
    }
}

function createLimitPan({ controls, min, max }: { controls: OrbitControlsImpl; min?: Vector2Like; max?: Vector2Like }): {
    min: Vector2Like;
    max: Vector2Like;
    handler: () => void;
} {
    const v = new Vector3();
    const minPan = new Vector3(min?.x ?? -Infinity, min?.y ?? -Infinity, -Infinity);
    const maxPan = new Vector3(max?.x ?? +Infinity, max?.y ?? +Infinity, +Infinity);

    return {
        min: new ObservableVector2(({ x, y }) => {
            minPan.x = x;
            minPan.y = y;
        }),
        max: new ObservableVector2(({ x, y }) => {
            maxPan.x = x;
            maxPan.y = y;
        }),
        handler: () => {
            v.copy(controls.target);
            controls.target.clamp(minPan, maxPan);
            v.sub(controls.target);

            controls.object.position.sub(v);
        },
    };
}

const usePanLimits = ({ controls, min, max }: { controls: OrbitControlsImpl, min: Vector2Like, max: Vector2Like }) => {
    const invalidate = useThree((three) => three.invalidate);

    useEffect(() => {
        if (!controls) {
            return;
        }

        const camera = controls.object;
        camera.position.set(0, 0, 500);
        controls.target.set(0, 0, 0);
        controls.update();
        camera.rotateX(Math.PI / 2);

        const q = camera.getWorldQuaternion(new Quaternion());
        const upVec = new Vector3(0, 1, 0);
        upVec.applyQuaternion(q);

        if(camera.up.y > 0) {
            upVec.set(0, 0, 1);
            upVec.applyQuaternion(q);
        }

        camera.up = upVec;
        controls.update();
        invalidate();

        const { handler } = createLimitPan({
            controls,
            min: { x: -10, y: -20 },
            max: { x: 40, y: 0 },
        });

        controls.addEventListener('change', handler);

        return () => {
            controls.removeEventListener('change', handler);
        };
    }, [controls, min, max]);
};

export const Controls = ({ children }: PropsWithChildren) => {
    const controls = useThree((three) => three.controls as OrbitControlsImpl);

    usePanLimits(useMemo(() => ({
        controls,
        min: { x: -10, y: -20 },
        max: { x: 40, y: 0 },
    }), [controls]));

    return (
        <group>
            <OrbitControls
                makeDefault
                enableRotate={false}
                enableDamping={false}
                minZoom={10}
                maxZoom={200}
                maxDistance={10}
                target={[0, 0, 0]}
                maxPolarAngle={Math.PI / 2}
                zoomToCursor
            />

            {children}
        </group>
    );
};

