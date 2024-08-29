import { clsx } from 'clsx';
import Link from 'next/link';

interface Breadcrumb {
    label: Exclude<any, null | undefined | false | ''>;
    href?: string;
    active?: boolean;
}

export function Breadcrumbs({ breadcrumbs, className }: { breadcrumbs: Breadcrumb[]; className?: string }) {
    return (
        <nav aria-label="Breadcrumb" className={clsx('mb-6 block', className )}>
            <ol className="flex text-xl md:text-2xl">
                {breadcrumbs.map((breadcrumb, index) => (
                    <li
                        key={breadcrumb.href || (typeof breadcrumb.label === 'string' ? breadcrumb.label : index)}
                        aria-current={breadcrumb.active}
                        className={clsx(
                            breadcrumb.active ? 'text-gray-900' : 'text-gray-500',
                        )}
                    >
                        {breadcrumb.href ? (
                            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                        ) : (
                            <span>{breadcrumb.label}</span>
                        )}

                        {index < breadcrumbs.length - 1 && (
                            <span className="mx-3 inline-block">/</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
