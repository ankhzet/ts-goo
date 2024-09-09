'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
    Color,
    Group,
    LinearMipMapLinearFilter,
    Mesh,
    MeshBasicMaterial,
    NearestFilter,
    NormalBlending,
    PlaneGeometry,
    Texture,
    Vector2,
    Vector2Like,
    Vector3Like,
} from 'three';
import { useAsset } from './useAsset';
import { isGroupAsset, THREEAssetElement } from './AssetLoaderContext';

const geometry = new PlaneGeometry(1, 1);

interface SpriteProps {
    color?: string | number;
    fill?: string | number;
    opacity: number;
    offset: Vector3Like;
    scale: Vector2Like;
    frame?: Vector2Like;
    mirror?: { x: boolean; y: boolean };
}

const TextureSprite = ({
    image,
    opacity,
    offset,
    scale,
    color,
    frame = { x: 1, y: 1 },
}: SpriteProps & { image: HTMLImageElement }) => {
    const ref = useRef<Mesh>(null!);
    const textureRef = useRef<Texture>(null!);

    const materialProps = useMemo<Partial<MeshBasicMaterial>>(
        () => ({
            color: new Color(color),
            opacity,
            blending: NormalBlending,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            fog: false,
            flatShading: true,
            precision: 'highp',
        }),
        [color, opacity],
    );

    const textureProps = useMemo<Partial<Texture>>(() => {
        const size = {
            x: image.width / frame.x,
            y: image.height / frame.y,
        };

        return {
            image,
            repeat: new Vector2(1 / size.x, 1 / size.y),
            magFilter: NearestFilter,
            minFilter: LinearMipMapLinearFilter,
        };
    }, [frame.x, frame.y, image]);

    return (
        <mesh
            ref={ref}
            position={[offset.x, offset.y, offset.z]}
            scale={[scale.x, scale.y, 1]}
            geometry={geometry}
            // onUpdate={() => textureRef.current && (textureRef.current.needsUpdate = true)}
        >
            <meshBasicMaterial attach="material" {...materialProps}>
                <texture ref={textureRef} attach="map" {...textureProps} />
            </meshBasicMaterial>
        </mesh>
    );
};

const GroupSprite = ({ asset: { group, width, height }, color, fill, opacity, offset, scale, mirror, frame }: SpriteProps & {
    asset: THREEAssetElement
}) => {
    const ref = useRef<Group>(null!);
    const colorRef = useMemo(() => color === 'none' ? null : new Color(color), [color]);
    const fillRef = useMemo(() => fill === 'none' ? null :new Color(fill), [fill]);

    useEffect(() => {
        const current = ref.current;

        if (current) {
            current.add(group);

            return () => {
                current.remove(group);
            };
        }
    }, [group]);

    useEffect(() => {
        if (!(ref.current && (mirror?.x || mirror?.y))) {
            return;
        }

        ref.current.traverse((child: unknown) => {
            if (child instanceof Mesh) {
                if (mirror.x) {
                    child.scale.x = -1;
                    child.position.x = width;
                }

                if (mirror.y) {
                    child.scale.y = -1;
                    child.position.y = height;
                }
            }
        });
    }, [mirror?.x, mirror?.y]);

    useEffect(() => {
        ref.current!.traverse((child: unknown) => {
            if (child instanceof Mesh) {
                const um = (m: MeshBasicMaterial | MeshBasicMaterial[]) => {
                    if (Array.isArray(m)) {
                        m.forEach(um);
                    } else {
                        m.opacity = opacity;
                    }
                };

                if (child.material) {
                    um(child.material);
                }
            }
        });
    }, [opacity]);

    useEffect(() => {
        ref.current!.traverse((child: unknown) => {
            if (child instanceof Mesh) {
                const um = (m: MeshBasicMaterial | MeshBasicMaterial[]) => {
                    if (Array.isArray(m)) {
                        m.forEach(um);
                    } else {
                        m.opacity = opacity;

                        if (m.color.getHex()) {
                            if (colorRef) {
                                m.color = colorRef;
                                m.visible = true;
                            } else {
                                // m.opacity = 0.1 * opacity;
                            }
                        } else {
                            if (fillRef) {
                                m.color = fillRef;
                                m.visible = true;
                            } else {
                                m.visible = false;
                                // m.opacity = 0.1 * opacity;
                            }
                        }
                    }
                };

                if (child.material) {
                    um(child.material);
                }
            }
        });
    }, [opacity, colorRef?.getHex(), fillRef?.getHex()]);

    return (
        <group
            ref={ref}
            position={[offset.x, offset.y, offset.z]}
            scale={[scale.x, scale.y, 1]}
        />
    );
};

export const Sprite = (props: SpriteProps & { src: string }) => {
    const asset = useAsset(props.src);

    if (!asset) {
        return null;
    } else if (isGroupAsset(asset)) {
        return <GroupSprite asset={asset} {...props} />;
    } else if (asset instanceof HTMLImageElement) {
        return <TextureSprite image={asset} {...props} />;
    }

    throw new Error(`Unsupported sprite asset`);
};
