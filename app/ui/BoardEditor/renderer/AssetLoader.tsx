import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Group, Mesh, ShapeGeometry, ShapePath } from 'three';
import { mergeBufferGeometries, SVGLoader } from 'three-stdlib';

import { useStateFromProp } from '../../hooks';
import { AssetLoaderContext, assets, AssetType, kTheeAsset, THREEAssetElement } from './AssetLoaderContext';
import { Overlay } from './Overlay';
import { getLengthFromSVGLength, isLike, makeMaterials } from './svg';

const createRegExp = (extensions: string) => new RegExp(`^.*\\.(${extensions})$`, 'i');
const loader = new SVGLoader();

const FACTORIES = [
    { regexp: createRegExp('jpe?g|png|gif|tiff'), create: (): AssetType => new Image() },
    {
        regexp: createRegExp('svg'), create: (): AssetType => {
            const material = makeMaterials();
            const group = new Group();
            const asset: THREEAssetElement = {
                [kTheeAsset]: '',
                group,
                width: 0,
                height: 0,
                onload(_e: Event) {
                },
                onerror(_e: string | Event) {
                },
                onprogress(_e: ProgressEvent) {
                },
                set src(value: string) {
                    this[kTheeAsset] = value;
                    load(value);
                },
                get src() {
                    return this[kTheeAsset];
                },
            };

            const load = (url: string) => loader.load(url, ({ paths, xml }) => {
                    if (!isLike<{ width: SVGAnimatedLength; height: SVGAnimatedLength } & SVGFitToViewBox>(xml)) {
                        return;
                    }

                    const width = getLengthFromSVGLength(xml.width);
                    const height = getLengthFromSVGLength(xml.height);
                    const bg = new Group();
                    const fg = new Group();

                    group.add(fg, bg);

                    fg.position.z = -0.1;

                    asset.width = width || 0;
                    asset.height = height || 0;

                    if (width && height) {
                        const strokeColor = '#88ff44';
                        const frame = material(strokeColor, 0.2);

                        const path = new ShapePath();
                        path.moveTo(0, 0);
                        path.lineTo(width, 0);
                        path.lineTo(width, height);
                        path.lineTo(0, height);
                        path.lineTo(0, 0);

                        const frameGeometry = SVGLoader.pointsToStroke(
                            path.subPaths.map((sub) => sub.getPoints()).flat(),
                            {
                                strokeColor,
                                strokeWidth: 0.4,
                                strokeLineCap: 'round',
                                strokeLineJoin: 'round',
                                strokeMiterLimit: 1,
                            },
                        );

                        bg.add(new Mesh(frameGeometry, frame));

                        // group.add(new Mesh(new ShapeGeometry(path.toShapes(false)), frame));
                    }

                    for (const path of paths) {
                        if (!path.userData) {
                            continue;
                        }

                        const style = path.userData.style;

                        const fill = material(style.fill, style.fillOpacity);
                        const stroke = material(style.stroke, style.strokeOpacity);

                        if (fill) {
                            const isBlack = !fill.color.getHex();
                            const shapes = SVGLoader.createShapes(path);
                            const geometry = mergeBufferGeometries(shapes.map((shape) => new ShapeGeometry(shape), fill));

                            if (geometry) {
                                const mesh = new Mesh(geometry, fill);

                                if (isBlack) {
                                    bg.add(mesh);
                                } else {
                                    fg.add(mesh);
                                }
                            }
                        }

                        if (stroke) {
                            const geometry = SVGLoader.pointsToStroke(
                                path.subPaths.map((sub) => sub.getPoints()).flat(),
                                style
                            );

                            if (geometry) {
                                fg.add(new Mesh(geometry, stroke));
                            }

                            // for (const subPath of path.subPaths) {
                            //     const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), style);
                            //
                            //     if (geometry) {
                            //         group.add(new Mesh(geometry, stroke));
                            //     }
                            // }
                        }
                    }

                    asset.onload(new Event('load'));
                },
                (xhr) => {
                    asset.onprogress(new ProgressEvent('progress', {
                        total: xhr.total,
                        loaded: xhr.loaded,
                    }));
                },
                (error) => asset.onerror(error),
            );

            return asset;
        },
    },
];

function loadAsset(url: string) {
    return new Promise<AssetType>((resolve, reject) => {
        const factory = FACTORIES.find(({ regexp }) => regexp.test(url));

        if (!factory) {
            return reject(new Error(`No suitable loader for "${url}"`));
        }

        const asset: AssetType = factory.create();

        function handleLoad(event: string | Event) {
            if (typeof event === 'string' || event.type === 'error') {
                reject();
            } else {
                resolve(asset);
            }
        }

        asset.onload = handleLoad;
        asset.onerror = handleLoad;
        asset.src = url;
    });
}

interface AssetLoaderProps {
    urls: string[];
    placeholder: React.ReactNode;
    children: React.ReactNode;
}

export const AssetLoader = ({ urls: urlsProp, placeholder, children }: AssetLoaderProps) => {
    const [urls, setUrls] = useStateFromProp(urlsProp);
    const [count, setCount] = useState(0);
    const invalidate = useThree((three) => three.invalidate);
    const uniqueUrls = useRef<Set<string>>();

    uniqueUrls.current = new Set(urls);

    const timeout = useRef<NodeJS.Timeout>();
    const mounted = useRef(true);

    useLayoutEffect(() => () => void (mounted.current = false), []);

    useEffect(() => {
        void Promise
            .all([...uniqueUrls.current!].map((url) => (
                loadAsset(url)
                    .then((asset) => {
                        assets.current[url] = asset;

                        if (mounted.current) {
                            setCount((current) => current + 1);
                        }
                    })
                    .catch((e) => {
                        console.error('Error loading asset:', url);
                        console.error(e);
                    })
            )))
            .finally(() => {
                timeout.current && clearTimeout(timeout.current);
                invalidate();
            });
    }, [urls]);

    if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            const delay = 2000 + uniqueUrls.current!.size * 100;

            timeout.current = setTimeout(() => {
                setCount(0);
                setUrls(urls.slice());
                console.warn('AssetLoader failed loading after timeout.');
            }, delay);

            return () => {
                clearTimeout(timeout.current);
            };
        }, [urls, setUrls]);
    }

    if (count < uniqueUrls.current.size) {
        return (placeholder ?? null) && (
            <Overlay center>
                <span>{placeholder}</span>
            </Overlay>
        );
    }

    return (
        <AssetLoaderContext.Provider value={assets}>
            {children}
        </AssetLoaderContext.Provider>
    );
};
