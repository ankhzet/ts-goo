import type { IBoard } from '@/models';
import { fetchFilteredLayers } from '@/app/lib/data';
import { Pagination } from '@/app/ui';
import { Preview } from '../Preview';
import { LayerType } from './LayerType';
import { DeleteLayer, UpdateLayer } from './buttons';

export async function LayersTable({ board, query, currentPage }: { board?: IBoard; query: string; currentPage: number }) {
    const { layers, pages } = await fetchFilteredLayers(board?.id, query, currentPage);

    return (
        <>
            <div className="mt-6 flow-root">
                <div className="inline-block min-w-full align-middle">
                    <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                        <table className="min-w-full text-gray-900 table">
                            <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th scope="col" className="px-3 py-5 font-medium pl-16">
                                    Name
                                </th>
                                {!board && (
                                    <th scope="col" className="px-3 py-5 font-medium">
                                        Board
                                    </th>
                                )}
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Index
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Type
                                </th>
                                <th scope="col" className="relative py-3 pl-6 pr-3">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white">
                            {layers.map((layer) => (
                                <tr
                                    key={layer.id}
                                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                >
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex items-center gap-3">
                                            <Preview
                                                src={layer.geometryUrl}
                                                width={28}
                                                height={28}
                                                alt={`${layer.name}'s geometry`}
                                                mirrorX={layer.mirrorX}
                                                mirrorY={layer.mirrorY}
                                                invert={layer.invert}
                                            />

                                            <p>{layer.name}</p>
                                        </div>
                                    </td>
                                    {!board && (
                                        <td className="whitespace-nowrap px-3 py-3">
                                            {layer.board.name}
                                        </td>
                                    )}
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {layer.index}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <LayerType type={layer.type} /> {layer.name}
                                    </td>
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex justify-end gap-3">
                                            <UpdateLayer id={layer.id} />
                                            <DeleteLayer id={layer.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {!board && (
                <div className="mt-5 flex w-full justify-center">
                    <Pagination totalPages={pages} currentPage={currentPage} />
                </div>
            )}
        </>
    );
}
