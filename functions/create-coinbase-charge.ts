// Cloudflare Pages Function
// Handles POST requests to /create-coinbase-charge

interface Env {
  COINBASE_COMMERCE_API_KEY: string;
}

const COINBASE_API_URL = 'https://api.commerce.coinbase.com/charges';

export const onRequest: (context: { request: Request; env: Env }) => Promise<Response> = async (context) => {
  const { env, request } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (!env.COINBASE_COMMERCE_API_KEY) {
    const errorMessage = 'Server configuration error: Missing COINBASE_COMMERCE_API_KEY environment variable.';
    console.error(errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { trackName, trackId, price, track_filename } = await request.json() as { trackName: string; trackId: string; price: string; track_filename: string; };

    if (!trackName || !trackId || !price || !track_filename) {
      return new Response(JSON.stringify({ error: 'Missing required parameters.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Dynamically determine the origin from the request URL to build the redirect URL.
    const origin = new URL(request.url).origin;

    const chargeData = {
      name: trackName,
      description: `Purchase of the track: ${trackName}`,
      local_price: {
        amount: price,
        currency: 'USD',
      },
      pricing_type: 'fixed_price',
      metadata: {
        trackId: trackId,
        trackName: trackName,
        track_filename: track_filename, // Store the exact filename in metadata with the new key
      },
      redirect_url: `${origin}/success`,
    };
    
    const response = await fetch(COINBASE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CC-Api-Key': env.COINBASE_COMMERCE_API_KEY,
            'X-CC-Version': '2018-03-22',
        },
        body: JSON.stringify(chargeData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Coinbase API Error:', errorData);
        throw new Error('Failed to create Coinbase Commerce charge.');
    }

    const responseData: any = await response.json();
    const charge = responseData.data;

    return new Response(JSON.stringify({ hosted_url: charge.hosted_url, code: charge.code }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
