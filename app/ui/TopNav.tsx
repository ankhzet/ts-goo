import { clsx } from 'clsx';
import Link from 'next/link';
import { Breadcrumbs } from '@/app/ui/Breadcrumbs';
import { CreateLayer } from '@/app/ui/layers/buttons';
import { PropsWithChildren } from 'react';

interface Breadcrumb {
    label: string;
    href?: string;
    active?: boolean;
}

export function TopNav(
    { breadcrumbs, className, children }: PropsWithChildren<{ breadcrumbs: Breadcrumb[]; className?: string }>
) {
    return (
        <div className={clsx('flex flex-row gap-4', className)}>
            <Breadcrumbs className="flex-grow" breadcrumbs={breadcrumbs} />

            <div className="flex flex-row gap-4">
                {children}
            </div>
        </div>
    );
}
