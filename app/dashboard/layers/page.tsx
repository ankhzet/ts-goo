import { Suspense } from 'react';

import Search from '@/app/ui/search';
import { LayersTable } from '@/app/ui/layers/LayersTable';
import { CreateLayer } from '@/app/ui/layers/buttons';
import { LayersTableSkeleton } from '@/app/ui/skeletons';

export default async function Page({
    searchParams,
}: {
    searchParams?: {
        query?: string;
        page?: string;
    };
}) {
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">Layers</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search layers..." />
                <CreateLayer />
            </div>
            <Suspense key={query + currentPage} fallback={<LayersTableSkeleton />}>
                <LayersTable query={query} currentPage={currentPage} />
            </Suspense>
        </div>
    );
}
