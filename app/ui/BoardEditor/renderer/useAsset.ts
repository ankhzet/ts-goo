import { useContext } from 'react';

import { AssetLoaderContext, AssetType } from './AssetLoaderContext';

type AssetUrlParam = string | string[] | { src: string | string[] };

export const useAsset = (urlOrObj: AssetUrlParam) => {
    return useAssets(urlOrObj)![0];
};

export const useAssets = (urlOrObj: AssetUrlParam) => {
    const assets = useContext(AssetLoaderContext);

    const src = (typeof urlOrObj === 'object') && ('src' in urlOrObj) ? urlOrObj.src : urlOrObj;
    const isMultiple = Array.isArray(src);
    const urls: string[] = isMultiple ? src : [src];

    return urls.map((url) => assets.current[url] as AssetType | null);
};
