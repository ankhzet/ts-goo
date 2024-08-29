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
    opacity: number;
    offset: Vector3Like;
    scale: Vector2Like;
    frame?: Vector2Like;
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
            precision: 'lowp',
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

const GroupSprite = ({ asset: { group }, color, opacity, offset, scale }: SpriteProps & {
    asset: THREEAssetElement
}) => {
    const ref = useRef<Group>(null!);

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
        ref.current!.traverse((child: unknown) => {
            if (child instanceof Mesh) {
                child.material.opacity = opacity;
            }
        });
    }, [opacity]);

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
