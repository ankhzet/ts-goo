'use client';

import Link from 'next/link';

import { IBoard } from '@/models';
import { Button } from '@/app/ui/button';
import { updateBoard } from '@/app/lib/actions';
import { TextField, FileField } from '../fields';

export function EditBoardForm({ board }: { board: IBoard }) {
    const updateWithId = updateBoard.bind(null, board.id);

    return (
        <form action={updateWithId}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                <TextField name="name" label="Board name" value={board.name} />
                <FileField name="previewUrl" label="Board preview" value={board.previewUrl} />
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/dashboard/boards"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >Cancel</Link>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
}
