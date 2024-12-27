import type { Config, Context } from '@netlify/edge-functions';

export default async (request: Request, context: Context) => {
    const targetUrl = 'https://ctx-dot-auxbrainhome.appspot.com';
    const url = new URL(request.url);
    const forwardUrl = `${url.href.replace(url.origin + '/api', targetUrl)}`;

    const headers = new Headers();
    headers.set("Content-Type", "application/x-www-form-urlencoded");

    // Prepare the forwarded request
    const init: RequestInit = {
        method: request.method,
        headers: headers,
    };

    if (request.method === 'POST') {
        init.body = await request.text();
    }

    try {
        const forwardedResponse = await fetch(forwardUrl, init);

        const responseBody = await forwardedResponse.text();
        return new Response(responseBody, {
            status: forwardedResponse.status,
            headers: {
                'access-control-allow-origin': '*',
                'access-control-allow-methods': 'GET,POST,OPTIONS',
                'access-control-allow-headers': 'x-api-key,content-type',
                'content-type': forwardedResponse.headers.get('content-type') || 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch the target URL', details: error.message}), {
            status: 500,
            headers: {
                'access-control-allow-origin': '*',
                'content-type': 'application/json',
            },
        });
    }
};

export const config: Config = {
    path: '/api',
};

