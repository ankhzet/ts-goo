import path from 'node:path';
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { File } from 'node:buffer';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb',
        },
    },
};

type UploadType = 'preview';
type UploadEntity = 'board' | 'layer';
type UploadDescriptor = {
    name: string;
    type: UploadType;
    entity: UploadEntity;
    identifiers?: string[];
};
type UploadResult = {
    filename: string;
    uri: string;
};

const root = path.resolve('public');

export const POST = async(
    req: NextRequest,
) => {
    // const form = new IncomingForm();

    try {
        const form = await req.formData();
        const entries = [...form].reduce((acc, [key, value]) => {
            if (acc[key]) {
                acc[key].push(value as any);
            } else {
                acc[key] = [value as any];
            }

            return acc;
        }, {} as Record<string, (string | File)[]>);
        const { multiple, files } = entries as Record<'multiple', string[]> & { files: File[] };

        if (files?.length) {
            const result: UploadResult[] = [];

            for (const file of files) {
                const filename = file.name.replace(/[^\w\p{P}]/gu, '_').replace(/_{2,}/g, '_');
                const uri = path.join('/tmp', filename);
                const targetPath = path.join(root, uri);

                await mkdir(path.dirname(targetPath), { recursive: true });
                const target = createWriteStream(targetPath, { encoding: 'binary', autoClose: true });

                await pipeline(
                    file.stream(),
                    target,
                );

                result.push({ uri, filename });
            }

            return NextResponse.json({
                status: 'ok',
                result: (
                    multiple
                        ? result
                        : result[0]
                ),
            }, { status: 201 });
        }

        // noinspection ExceptionCaughtLocallyJS
        throw new Error('Files missing');
    } catch (e: any) {
        console.error(e);
        const status = e.status || 500;
        const error = { message: e.message || String(e), status };

        return NextResponse.json({ status: 'error', error }, { status });
    }
};
