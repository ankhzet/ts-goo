import { Breadcrumbs } from '@/app/ui';
import { CreateLayerForm } from '@/app/ui/layers/CreateLayerForm';
import { fetchBoardById, fetchBoards } from '@/app/lib/data';

export default async function Page({ searchParams }: { searchParams: { boardId: string } }) {
    const boardId = searchParams?.boardId;
    const boards = await fetchBoards();
    const board = boardId ? await fetchBoardById(boardId) : undefined;

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    ...(board ? [
                        { label: 'Boards', href: '/dashboard/boards' },
                        { label: board.name, href: `/dashboard/boards/${board.id}/edit` },
                    ] : [
                        { label: 'Layers', href: '/dashboard/layers' },
                    ]),
                    {
                        label: 'Create Layer',
                        active: true,
                    },
                ].filter(Boolean)}
            />
            <CreateLayerForm boards={boards} board={board} />
        </main>
    );
}
