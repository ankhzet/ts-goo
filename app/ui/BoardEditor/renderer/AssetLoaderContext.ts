import { createContext } from 'react';
import { Group } from 'three';

export type THREEAssetElement = {
    [kTheeAsset]: string;
    src: string;
    width: number;
    height: number;
    group: Group;
    onload: (e: Event) => void;
    onerror: (e: Event) => void;
    onprogress: (e: ProgressEvent) => void;
};

export type AssetType = HTMLImageElement | THREEAssetElement;

export interface AssetStore {
    [url: string]: AssetType;
}

export const kTheeAsset = Symbol();
export const isGroupAsset = (asset: AssetType): asset is THREEAssetElement => kTheeAsset in asset;

export const AssetLoaderContext = createContext<{ readonly current: AssetStore }>(null!);

export const assets: { readonly current: AssetStore } = {
    current: {},
};
