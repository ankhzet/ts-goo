import { Breadcrumbs } from '@/app/ui';
import { CreateBoardForm } from '@/app/ui/boards/CreateBoardForm';

export default async function Page() {
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Boards', href: '/dashboard/boards' },
                    {
                        label: 'Create Board',
                        href: '/dashboard/boards/create',
                        active: true,
                    },
                ]}
            />
            <CreateBoardForm />
        </main>
    );
}
