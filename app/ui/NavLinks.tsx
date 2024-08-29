'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const links = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon },
    { name: 'Boards', href: '/dashboard/boards', icon: DocumentDuplicateIcon },
];

export function NavLinks() {
    const pathname = usePathname();

    return links.map(({ name, href, icon: Icon }) => {
        return (
            <Link
                key={name}
                href={href}
                className={clsx(
                    'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                    pathname === href && 'bg-sky-100 text-blue-600',
                )}
            >
                <Icon className="w-6" />
                <p className="hidden md:block">{name}</p>
            </Link>
        );
    });
}
