import { TopNav } from '@/app/ui';
import { fetchBoardById } from '@/app/lib/data';
import { CreateLayer } from '@/app/ui/layers/buttons';
import { BoardEditor } from '@/app/ui/BoardEditor';

export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;
    const board = await fetchBoardById(id);
    const layers = await board.getLayers();

    return (
        <main className="flex-grow flex flex-col h-full">
            <TopNav breadcrumbs={[
                { label: 'Boards', href: '/dashboard/boards' },
                {
                    label: board.name,
                    href: `/dashboard/boards/${id}/edit`,
                },
                {
                    label: 'Model Board',
                    active: true,
                },
            ]}>
                <CreateLayer board={board} />
            </TopNav>

            <BoardEditor board={board.toJSON()} layers={layers.map((layer) => layer.toJSON())} />
        </main>
    );
}
