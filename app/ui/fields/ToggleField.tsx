const TYPE_OPTIONS = [
    { value: 0, label: 'No' },
    { value: 1, label: 'Yes' },
];

export const ToggleField = ({ label, name, value: selected }: { label: string; name: string; value?: boolean }) => (
    <fieldset>
        <legend className="mb-2 block text-sm font-medium">
            {label}
        </legend>
        <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4 flex-wrap">
                {TYPE_OPTIONS.map(({ value, label }) => (
                    <div key={value} className="flex items-center">
                        <input
                            id={`${value}LayerType`}
                            type="radio"
                            name={name}
                            value={value}
                            defaultChecked={+!selected !== value}
                            className="h-6 w-6 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2 default:ring-2"
                        />
                        <label
                            htmlFor={`${value}LayerType`}
                            className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs capitalize font-medium text-gray-600"
                        >
                            {label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    </fieldset>
);
