import { LayerType } from '@/models';
import { CubeTransparentIcon, PencilIcon } from '@heroicons/react/24/outline';

const TYPE_OPTIONS = [
    { value: 'copper', label: 'copper', icon: 'Cu' },
    { value: 'silkscreen', label: 'silkscreen', icon: 'S' },
    { value: 'adhesive', label: 'adhesive', icon: 'Ad' },
    { value: 'paste', label: 'paste', icon: 'P' },
    { value: 'mask', label: 'mask', icon: 'M' },
    { value: 'drill', label: 'drill', icon: <PencilIcon width={16} style={{ transform: 'rotate(-45deg) translate(0, 5px)' }} /> },
    { value: 'cuts', label: 'cuts', icon: <CubeTransparentIcon /> },
];

export const LayerTypeField = ({ name, value: selected }: { name: string; value?: LayerType }) => (
    <fieldset>
        <legend className="mb-2 block text-sm font-medium">
            Set layer type
        </legend>
        <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4 flex-wrap">
                {TYPE_OPTIONS.map(({ value, label, icon }) => (
                    <div key={value} className="flex items-center">
                        <input
                            id={`${value}LayerType`}
                            type="radio"
                            name={name}
                            value={value}
                            defaultChecked={selected === value}
                            className="h-6 w-6 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2 default:ring-2"
                        />
                        <label
                            htmlFor={`${value}LayerType`}
                            className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs capitalize font-medium text-gray-600"
                        >
                            <span className="h-6 w-6 font-bold text-base text-center">{icon}</span>
                            {label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    </fieldset>
);
