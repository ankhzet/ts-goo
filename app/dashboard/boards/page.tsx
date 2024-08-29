import { Suspense } from 'react';

import Search from '@/app/ui/search';
import { BoardsTable } from '../../ui/boards/BoardsTable';
import { CreateBoard } from '../../ui/boards/buttons';

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
                <h1 className="text-2xl">Boards</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search boards..." />
                <CreateBoard />
            </div>
            <Suspense key={query + currentPage} fallback={<div />}>
                <BoardsTable query={query} currentPage={currentPage} />
            </Suspense>
        </div>
    );
}
