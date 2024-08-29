import { UserCircleIcon } from '@heroicons/react/24/outline';
import { IBoard } from '@/models';

export const BoardField = ({ name, value = '', boards, ...rest }: { name: string; value?: string; disabled?: boolean; boards: IBoard[] }) => (
    <div className="peer mb-4" {...rest}>
        <label htmlFor="board" className="mb-2 block text-sm font-medium peer-disabled:text-gray-500"> Choose board </label>
        <div className="relative">
            {rest.disabled && (
                <input type="hidden" name={name} defaultValue={value} />
            )}
            <select
                id="board"
                name={name}
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                defaultValue={value}
                {...rest}
            >
                <option value="" disabled>
                    Select a board
                </option>
                {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                        {board.name}
                    </option>
                ))}
            </select>

            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
        </div>
    </div>
);
