import Link from 'next/link';

import { Button } from '@/app/ui/button';
import { createBoard } from '@/app/lib/actions';
import { FileField, TextField } from '../fields';

export function CreateBoardForm() {
    return (
        <form action={createBoard}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                <TextField name="name" label="Board name" />
                <FileField name="previewUrl" label="Board preview" />
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/dashboard/boards"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    Cancel
                </Link>
                <Button type="submit">Create Board</Button>
            </div>
        </form>
    );
}
