'use server';

import sharp from 'sharp';
import path from 'node:path';
import { rename, mkdir, rm } from 'node:fs/promises';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Layer, LAYER_TYPES, Board, makeAssetPath } from '@/models';

const ext = (pathname: string) => path.extname(pathname).replace(/^\./, '');

const BoardFormSchema = z.object({
    id: z.string(),
    name: z.string(),
    preview: z.string().optional(),
    previewUrl: z.string().optional(),
});

const CreateBoard = BoardFormSchema.omit({ id: true }).merge(z.object({
    previewUrl: z.string(),
}));
const UpdateBoard = BoardFormSchema.omit({ id: true });

const applyUpload = async (old: string, next: string, cleanup?: () => Promise<void>) => {
    try {
        await mkdir(path.dirname(next), { recursive: true });

        if (old.endsWith('.' + ext(next))) {
            await rename(old, next);
        } else {
            await sharp(old).png({ force: true }).toFile(next);
            await rm(old);
        }
    } catch (e) {
        cleanup && (await cleanup());
        console.error(e);
        throw new Error(`Failed to save upload`);
    }
};

export async function createBoard(formData: FormData) {
    const data = CreateBoard.parse(Object.fromEntries(formData.entries()));
    const board = await Board.create(Object.assign(data, {
        createdAt: new Date(),
        preview: path.basename(data.previewUrl),
    }));

    await applyUpload(makeAssetPath(data.previewUrl), makeAssetPath(board.previewUrl), () => (
        board.destroy({ force: true })
    ));
    await board.update({
        preview: path.basename(data.previewUrl),
    })

    revalidatePath('/dashboard/boards');
    redirect(`/dashboard/boards/${board.id}/edit`);
}

export async function updateBoard(id: string, formData: FormData) {
    const { previewUrl, ...data } = UpdateBoard.parse(Object.fromEntries(formData.entries()));
    const board = await Board.findByPk(id, { rejectOnEmpty: true });

    if (previewUrl && previewUrl !== board.previewUrl) {
        await applyUpload(makeAssetPath(previewUrl), makeAssetPath(board.previewUrl));
        data.preview = path.basename(previewUrl);
    }

    await Board.update(
        data,
        { where: { id } }
    );

    revalidatePath('/dashboard/boards');
    redirect('/dashboard/boards');
}

export async function deleteBoard(id: string) {
    await Board.destroy({ where: { id } });
    revalidatePath('/dashboard/boards');
}

const LayerFormSchema = z.object({
    id: z.string(),
    boardId: z.string(),
    index: z.coerce.number(),
    enabled: z.coerce.number().transform((v) => !!v),
    mirrorX: z.coerce.number().transform((v) => !!v),
    mirrorY: z.coerce.number().transform((v) => !!v),
    type: z.enum(LAYER_TYPES),
    name: z.string(),
    geometry: z.string().optional(),
    geometryUrl: z.string().optional(),
});

const CreateLayer = LayerFormSchema.omit({ id: true }).merge(z.object({
    geometryUrl: z.string(),
}));
const UpdateLayer = LayerFormSchema.omit({ id: true, boardId: true });

export async function createLayer(formData: FormData) {
    const data = CreateLayer.parse(Object.fromEntries(formData.entries()));
    const layer = await Layer.create(Object.assign(data, {
        geometry: path.basename(data.geometryUrl),
    }));

    await applyUpload(makeAssetPath(data.geometryUrl), makeAssetPath(layer.geometryUrl), () => (
        layer.destroy({ force: true })
    ));
    await layer.update({
        geometry: path.basename(data.geometryUrl),
    })

    revalidatePath('/dashboard/layers');
    redirect(`/dashboard/layers/${layer.id}/edit`);
}

export async function updateLayer(id: string, formData: FormData) {
    const { geometryUrl, ...data } = UpdateLayer.parse(Object.fromEntries(formData.entries()));
    const layer = await Layer.findByPk(id, { rejectOnEmpty: true });

    if (geometryUrl && geometryUrl !== layer.geometryUrl) {
        await applyUpload(makeAssetPath(geometryUrl), makeAssetPath(layer.geometryUrl));
        data.geometry = path.basename(geometryUrl);
    }

    await Layer.update(
        data,
        { where: { id } }
    );

    revalidatePath('/dashboard/layers');
    revalidatePath(`/dashboard/boards/${layer.boardId}/edit`);
    redirect(`/dashboard/boards/${layer.boardId}/edit`);
}

export async function deleteLayer(id: string) {
    await Layer.destroy({ where: { id } });
    revalidatePath('/dashboard/layers');
}
