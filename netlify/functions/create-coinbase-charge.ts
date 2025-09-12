import type { Handler, HandlerEvent } from '@netlify/functions';

const { COINBASE_COMMERCE_API_KEY, APP_URL } = process.env;
const COINBASE_API_URL = 'https://api.commerce.coinbase.com/charges';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!COINBASE_COMMERCE_API_KEY || !APP_URL) {
    const errorMessage = 'Server configuration error: Missing required environment variables.';
    console.error(errorMessage);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }

  try {
    const { trackName, trackId, price } = JSON.parse(event.body || '{}');

    if (!trackName || !trackId || !price) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required parameters.' }) };
    }

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
      },
      redirect_url: `${APP_URL}/success`,
      // cancel_url: `${APP_URL}/`, // Optional
    };
    
    const response = await fetch(COINBASE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CC-Api-Key': COINBASE_COMMERCE_API_KEY,
            'X-CC-Version': '2018-03-22',
        },
        body: JSON.stringify(chargeData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Coinbase API Error:', errorData);
        throw new Error('Failed to create Coinbase Commerce charge.');
    }

    const responseData = await response.json();
    const charge = responseData.data;

    return {
      statusCode: 200,
      body: JSON.stringify({ hosted_url: charge.hosted_url, code: charge.code }),
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error.' }),
    };
  }
};

export { handler };    
