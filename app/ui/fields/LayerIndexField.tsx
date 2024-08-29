import { ArrowsUpDownIcon } from '@heroicons/react/24/outline';

export const LayerIndexField = ({ name, value }: { name: string; value?: number }) => (
    <div className="mb-4">
        <label htmlFor="layerIndex" className="mb-2 block text-sm font-medium"> Choose index </label>
        <div className="relative mt-2 rounded-md">
            <div className="relative">
                <input
                    id="layerIndex"
                    name={name}
                    defaultValue={value || 0}
                    type="number"
                    step="1"
                    min={0}
                    placeholder="Enter index"
                    className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                />
                <ArrowsUpDownIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
        </div>
    </div>
);
