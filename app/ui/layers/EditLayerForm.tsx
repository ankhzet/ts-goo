'use client';

import Link from 'next/link';

import { ILayer } from '@/models';
import { Button } from '@/app/ui/button';
import { updateLayer } from '@/app/lib/actions';
import { LayerTypeField, LayerIndexField, TextField, FileField, ToggleField } from '../fields';

export function EditLayerForm({ layer }: { layer: ILayer }) {
    const updateWithId = updateLayer.bind(null, layer.id);

    return (
        <form action={updateWithId}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                <LayerIndexField name="index" value={layer.index} />
                <LayerTypeField name="type" value={layer.type} />
                <ToggleField name="enabled" label="Enabled" value={layer.enabled} />
                <ToggleField name="invert" label="Inverted" value={layer.invert} />
                <ToggleField name="mirrorX" label="Mirror X" value={layer.mirrorX} />
                <ToggleField name="mirrorY" label="Mirror Y" value={layer.mirrorY} />
                <TextField name="name" label="Layer name" value={layer.name} />
                <FileField
                    name="geometryUrl"
                    label="Layer geometry"
                    value={layer.geometryUrl}
                    mirrorX={layer.mirrorX}
                    mirrorY={layer.mirrorY}
                    invert={layer.invert}
                />
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href={`/dashboard/boards/${layer.boardId}/edit`}
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >Cancel</Link>
                <Button type="submit">Edit Layer</Button>
            </div>
        </form>
    );
}
