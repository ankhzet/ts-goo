import Link from 'next/link';

import { IBoard } from '@/models';
import { Button } from '@/app/ui/button';
import { createLayer } from '@/app/lib/actions';
import { LayerTypeField, LayerIndexField, BoardField, FileField, TextField, ToggleField } from '../fields';

export function CreateLayerForm({ boards, board }: { boards: IBoard[], board?: IBoard }) {
    return (
        <form action={createLayer}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                <BoardField name="boardId" boards={boards} value={board?.id} disabled={!!board} />
                <LayerIndexField name="index" />
                <LayerTypeField name="type" />
                <ToggleField name="enabled" label="Enabled" value />
                <ToggleField name="invert" label="Inverted" />
                <ToggleField name="mirrorX" label="Mirror X" />
                <ToggleField name="mirrorY" label="Mirror Y" />
                <TextField name="name" label="Layer name" />
                <FileField name="geometryUrl" label="Layer geometry" />
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/dashboard/layers"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    Cancel
                </Link>
                <Button type="submit">Create Layer</Button>
            </div>
        </form>
    );
}
