'use client';

import { ChangeEvent, ReactNode, useState } from 'react';
import { Preview, PreviewProps } from '../Preview';

export interface FileFieldProps extends Omit<PreviewProps, 'src' | 'alt'> {
    name: string;
    label: ReactNode;
    value?: string;
    multiple?: boolean;
}

export const FileField = ({ name, value, label, multiple, width = 'auto', height = 100, mirrorX, mirrorY, invert, ...rest }: FileFieldProps) => {
    const [image, setImage] = useState<string | undefined>(value);

    const uploadToServer = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        if (!files?.length) {
            return;
        }

        const body = new FormData();

        for (const file of files) {
            body.append('files', file, file.name);
        }

        if (multiple) {
            body.append('multiple', '1');
        }

        const response = await fetch('/api/upload', {
            method: 'POST',
            body,
        });
        const json: { status: 'ok' | 'error'; result: { name: string; uri: string } } = await response.json();

        if (json.status === 'ok') {
            setImage(json.result.uri);
        }
    };

    return (
        <div className="mb-4">
            <input
                type="hidden"
                name={name}
                defaultValue={image}
            />

            <label htmlFor={`file${name}`} className="mb-2 block text-sm font-medium">{label}</label>
            <div className="relative mt-2 rounded-md">
                <Preview
                    className="mb-2"
                    src={image}
                    alt={`${name} preview`}
                    mirrorX={mirrorX}
                    mirrorY={mirrorY}
                    invert={invert}
                />
                <div className="relative">
                    <input
                        id={`file${name}`}
                        type="file"
                        placeholder={`Enter ${name}`}
                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                        onChange={uploadToServer}
                        {...rest}
                    />
                </div>
            </div>
        </div>
    );
};
