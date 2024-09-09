import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { PhotoIcon } from '@heroicons/react/24/solid';

export interface PreviewProps {
    src?: string;
    alt: string;
    className?: string;
    width?: number | string;
    height?: number | string;
    mirrorX?: boolean;
    mirrorY?: boolean;
    invert?: boolean;
}

export const Preview = ({ className, src, width = 'auto', height = 100, mirrorX, mirrorY, invert, ...rest }: PreviewProps) => {
    const isStatic = src && (typeof width ==='number' && typeof height === 'number');
    const Tag = isStatic ? Image : 'img';
    const props = isStatic ? { width, height } : { style: { width, height, objectFit: 'contain' } };

    return (
        <div className={clsx('relative w-fit h-fit rounded-md border border-gray-200', invert && 'bg-black', className)}>
            {src ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                // @ts-ignore
                <Tag
                    src={src}
                    className={clsx(
                        'block text-sm outline-2',
                        mirrorX && 'scale-x-[-1]',
                        mirrorY && 'scale-y-[-1]',
                        invert && 'invert'
                    )}
                    {...props}
                    {...rest}
                />
            ) : (
                <PhotoIcon width={100} />
            )}
        </div>
    );
};
