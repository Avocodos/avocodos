import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { webscrap } from 'node-webscrap';

const redis = Redis.fromEnv();

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': '*',
        },
    });
}

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');
    console.log('Received request for URL:', url); // Debugging log
    const cacheKey = `link-preview:${url}`;

    const cachedData = await redis.get<string>(cacheKey);
    if (cachedData) {
        return NextResponse.json(JSON.parse(JSON.stringify(cachedData)), {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

    if (!url) {
        return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    try {
        const data = await webscrap(url);
        const response = {
            title: data.metadata.title || '',
            description: data.metadata.description || '',
            image: data.openGraph.image || '',
            themeColor: data.metadata.themeColor || '',
            favicon: data.metadata.favicons && data.metadata.favicons.length > 0 ? data.metadata.favicons[0] : '',
        };

        await redis.set(cacheKey, JSON.stringify(response), { ex: 60 * 60 * 24 * 1 });

        return NextResponse.json(response, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Error fetching link preview:', error);
        return NextResponse.json({ error: 'Failed to fetch link preview' }, { status: 500 });
    }
}