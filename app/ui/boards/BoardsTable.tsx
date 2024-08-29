import Image from 'next/image';
import { formatDateToLocal } from '@/app/lib/utils';
import { fetchFilteredBoards } from '@/app/lib/data';
import { Pagination } from '@/app/ui';
import { UpdateBoard, DeleteBoard } from './buttons';
import Link from 'next/link';

export async function BoardsTable({ query, currentPage }: { query: string; currentPage: number }) {
    const { items, pages } = await fetchFilteredBoards(query, currentPage);

    return (
        <>
            <div className="mt-6 flow-root">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
                            <table className="min-w-full rounded-md text-gray-900 table">
                                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                                <tr>
                                    <th scope="col" className="w-full px-4 py-5 font-medium sm:pl-6">
                                        Name
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium">
                                        Created
                                    </th>
                                    <th scope="col" className="relative py-3 pl-6 pr-3">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 text-gray-900">
                                {items.map((board) => (
                                    <tr key={board.id} className="group">
                                        <td className="whitespace-nowrap bg-white py-1 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                                            <Link href={`/dashboard/boards/${board.id}/edit`}>
                                                <div className="flex items-center gap-3">
                                                    <Image
                                                        src={board.previewUrl}
                                                        alt={`${board.name}'s preview`}
                                                        width={48}
                                                        height={48}
                                                        style={{ width: 48, height: 48, objectFit: 'contain' }}
                                                    />
                                                    <p>
                                                        {board.name}
                                                    </p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                                            {formatDateToLocal(board.createdAt)}
                                        </td>
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex justify-end gap-3">
                                                <UpdateBoard id={board.id} /> <DeleteBoard id={board.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={pages} currentPage={currentPage} />
            </div>
        </>
    );
}
