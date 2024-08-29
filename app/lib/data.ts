import { unstable_noStore as noStore } from 'next/cache';
import { FindOptions, InferAttributes, Op, type WhereOptions } from '@sequelize/core';

import { db, Layer, Board, ILayer } from '@/models';
import { notFound } from 'next/navigation';

await db.sync();

export async function fetchCopperLayers(): Promise<ILayer[]> {
    noStore();

    try {
        return await Layer.findAll({
            include: [Board],
            where: { type: 'copper' },
            order: [['index', 'desc']],
            limit: 10,
        });
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch the top layers.');
    }
}

export async function fetchCardData() {
    noStore();

    try {
        const [boards, layers, copperLayers] = await Promise.all([
            Board.count(),
            Layer.count(),
            Layer.count({ where: { type: 'copper' }}),
        ] as const);

        return {
            boards,
            layers,
            copperLayers,
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch card data.');
    }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredBoards(query: string, currentPage: number) {
    noStore();

    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const like = `%${query}%`;
        const [items, total] = await Promise.all([
            Board.findAll({
                include: [{
                    association: 'layers',
                }],
                where: (!!query || undefined) && {
                    [Op.or]: [
                        { name: { [Op.like]: like } },
                    ],
                },
                order: [['createdAt', 'desc']],
                limit: ITEMS_PER_PAGE,
                offset,
            }),
            Board.count((!!query || undefined) && {
                include: [{
                    association: 'layers',
                }],
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: like } },
                    ],
                },
            }),
        ]);

        return {
            items,
            pages: Math.ceil(Number(total) / ITEMS_PER_PAGE),
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch boards.');
    }
}

export async function fetchFilteredLayers(boardId: string | undefined, query: string, currentPage: number) {
    noStore();

    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        let where: WhereOptions<InferAttributes<Layer>> = boardId ? { boardId } : undefined;

        if (query) {
            const like = `%${query}%`;

            (where || (where = {} as any))[Op.or] = [
                { type: { [Op.like]: like } },
                { name: { [Op.like]: like } },
                { 'index::text': { [Op.like]: like } },
                { '$board.name$': { [Op.like]: like } },
            ];
        }

        const order: FindOptions<InferAttributes<Layer>>['order'] = (
            boardId
                ? [['index', 'desc']]
                : [['index', 'asc'], ['id', 'desc']]
        );

        const [layers, total] = await Promise.all([
            Layer.findAll({
                include: [{
                    association: 'board',
                }],
                where,
                order,
                limit: ITEMS_PER_PAGE,
                offset,
            }),
            Layer.count((!!query || undefined) && {
                include: [{
                    association: 'board',
                }],
                where,
            }),
        ]);

        return {
            layers,
            pages: Math.ceil(Number(total) / ITEMS_PER_PAGE),
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch layers.');
    }
}

export async function fetchBoardById(id: string) {
    noStore();

    try {
        return (await Board.findByPk(id)) || notFound();
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch board.');
    }
}

export async function fetchLayerById(id: string) {
    noStore();

    try {
        return await Layer.findByPk(id) || notFound();
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch layer.');
    }
}

export async function fetchBoards() {
    noStore();

    try {
        return Board.findAll({ order: [['name', 'asc']] });
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch all boards.');
    }
}
