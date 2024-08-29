import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/app/ui';
import { EditLayerForm } from '@/app/ui/layers/EditLayerForm';
import { fetchLayerById } from '@/app/lib/data';

export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;

    const layer = await fetchLayerById(id);

    if (!layer) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Layers', href: '/dashboard/layers' },
                    {
                        label: 'Edit Layer',
                        href: `/dashboard/layers/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <EditLayerForm layer={layer} />
        </main>
    );
}
