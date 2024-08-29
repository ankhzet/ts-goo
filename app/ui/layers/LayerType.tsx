import clsx from 'clsx';
import { PencilIcon } from '@heroicons/react/24/outline';

import { LayerType } from '@/models';

const TYPE_OPTIONS = {
    copper: { value: 'copper', label: 'copper', icon: 'Cu', color: 'bg-orange-300 text-white' },
    silkscreen: { value: 'silkscreen', label: 'silkscreen', icon: 'S', color: 'bg-gray-400 text-yellow-200' },
    adhesive: { value: 'adhesive', label: 'adhesive', icon: 'Ad', 'color': '#efefef' },
    paste: { value: 'paste', label: 'paste', icon: 'P', color: 'bg-gray-100 text-gray-500' },
    mask: { value: 'mask', label: 'mask', icon: 'M', color: 'bg-green-500 text-white-800' },
    drill: { value: 'drill', label: 'drill', icon: <PencilIcon />, color: '' },
    cuts: { value: 'cuts', label: 'cuts', icon: 'Ct', color: '' },
};

export function LayerType({ type }: { type: LayerType }) {
    const { color, icon } = TYPE_OPTIONS[type] || { color: 'white', icon: type.toUpperCase().substring(0, 2) };

    return (
        <span
            className={clsx(
                'w-8 justify-center inline-flex items-center rounded-full px-2 py-1 text-xs font-bold',
                color
            )}
        >
            {icon}
    </span>
    );
}
