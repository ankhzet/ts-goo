import Link from 'next/link';

import { TopNav } from '@/app/ui';
import { fetchBoardById } from '@/app/lib/data';
import { EditBoardForm } from '@/app/ui/boards/EditBoardForm';
import { LayersTable } from '@/app/ui/layers/LayersTable';
import { CreateLayer } from '@/app/ui/layers/buttons';

export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;
    const board = await fetchBoardById(id);

    return (
        <main>
            <TopNav breadcrumbs={[
                { label: 'Boards', href: '/dashboard/boards' },
                {
                    label: 'Edit Board',
                    href: `/dashboard/boards/${id}/edit`,
                    active: true,
                },
            ]}>
                <Link
                    href={`/dashboard/boards/${id}/model`}
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >Model board layers</Link>
                <CreateLayer board={board} />
            </TopNav>

            <EditBoardForm board={board} />
            <LayersTable board={board} query="" currentPage={1} />
        </main>
    );
}
