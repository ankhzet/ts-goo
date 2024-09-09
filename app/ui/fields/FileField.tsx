'use client';

import { ChangeEvent, ReactNode, useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';

export interface FileFieldProps {
    name: string;
    label: ReactNode;
    value?: string;
    multiple?: boolean;
    width?: number | string;
    height?: number | string;
    mirrorX?: boolean;
    mirrorY?: boolean;
}

export const FileField = ({ name, value, label, multiple, width = 'auto', height = 100, mirrorX, mirrorY, ...rest }: FileFieldProps) => {
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
                <div className="relative w-fit h-fit mb-2">
                    {image ? (
                        <img
                            src={image}
                            alt={`${name} preview`}
                            style={{ width, height, objectFit: 'contain' }}
                            className={`block w-full rounded-md border border-gray-200 text-sm outline-2 ${mirrorX ? 'scale-x-[-1]' : ''} ${mirrorY ? 'scale-y-[-1]' : ''}`}
                        />
                    ) : (
                        <PhotoIcon width={100} />
                    )}
                </div>
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
