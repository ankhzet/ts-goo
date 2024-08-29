export const TextField = ({ name, value = '', label, ...rest }: { name: string; label: React.ReactNode; value?: string }) => (
    <div className="mb-4">
        <label htmlFor={`text${name}`} className="mb-2 block text-sm font-medium">{label}</label>
        <div className="relative mt-2 rounded-md">
            <div className="relative">
                <input
                    id={`text${name}`}
                    name={name}
                    defaultValue={value}
                    type="text"
                    placeholder={`Enter ${name}`}
                    className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                    {...rest}
                />
            </div>
        </div>
    </div>
);
