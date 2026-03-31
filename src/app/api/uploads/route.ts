import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { cloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

function uploadToCloudinary(file: File, folder: string) {
    return new Promise<{ secure_url: string }>(async (resolve, reject) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error('Upload failed'));
                    return;
                }
                resolve({ secure_url: result.secure_url });
            }
        );

        stream.end(buffer);
    });
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = String(formData.get('folder') || `onlyfame/${session.user.role}`);

    if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    try {
        const result = await uploadToCloudinary(file, folder);
        return NextResponse.json({ url: result.secure_url });
    } catch {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
