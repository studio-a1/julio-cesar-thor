import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare Pages Function
// Handles POST requests to /get-download-link

interface Env {
  COINBASE_COMMERCE_API_KEY: string;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
}

const COINBASE_API_URL = 'https://api.commerce.coinbase.com/charges';

const checkEnvVars = (env: Env) => {
  const requiredVars = {
    COINBASE_COMMERCE_API_KEY: env.COINBASE_COMMERCE_API_KEY,
    R2_ENDPOINT: env.R2_ENDPOINT,
    R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: env.R2_BUCKET_NAME,
  };
  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    const errorMessage = `Server configuration error. Missing environment variables: ${missingVars.join(', ')}`;
    console.error(errorMessage);
    return errorMessage;
  }
  return null;
};

export const onRequest: (context: { request: Request; env: Env }) => Promise<Response> = async (context) => {
  const { env, request } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const envError = checkEnvVars(env);
  if (envError) {
      return new Response(JSON.stringify({ error: envError }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  
  const s3 = new S3Client({
      region: 'auto',
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
  });

  try {
    const { chargeCode } = await request.json() as { chargeCode: string };
    if (!chargeCode) {
      return new Response(JSON.stringify({ error: 'Charge Code is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // --- DEMO FLOW ---
    if (chargeCode === 'DEMO-SUCCESS') {
        const objectKey = 'cosmosonic-01.mp3';
        const command = new GetObjectCommand({
            Bucket: env.R2_BUCKET_NAME!,
            Key: objectKey,
        });
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minute link
        return new Response(JSON.stringify({ url: signedUrl, trackName: 'Orion' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    // --- END DEMO FLOW ---

    // --- REAL PURCHASE FLOW ---
    const response = await fetch(`${COINBASE_API_URL}/${chargeCode}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CC-Api-Key': env.COINBASE_COMMERCE_API_KEY!,
            'X-CC-Version': '2018-03-22',
        }
    });
    
    const responseData: any = await response.json();

    if (!response.ok) {
        console.error('Coinbase API Error on verification:', responseData);
        throw new Error(responseData?.error?.message || 'Could not retrieve charge details from Coinbase.');
    }

    const charge = responseData.data;
    const lastStatus = charge.timeline[charge.timeline.length - 1].status;
    
    if (lastStatus === 'COMPLETED') {
        const trackId = charge.metadata?.trackId;
        const trackName = charge.metadata?.trackName;

        if (!trackId) {
            return new Response(JSON.stringify({ error: 'Could not determine which track was purchased.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const objectKey = `${trackId}.mp3`;
        const command = new GetObjectCommand({
            Bucket: env.R2_BUCKET_NAME!,
            Key: objectKey,
        });
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minute link

        return new Response(JSON.stringify({ url: signedUrl, trackName: trackName }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } else if (lastStatus === 'PENDING' || lastStatus === 'NEW') {
        // Payment is detected but not yet confirmed
        return new Response(JSON.stringify({ status: 'pending', message: 'Payment is pending confirmation.' }), { status: 202, headers: { 'Content-Type': 'application/json' } });
    } else {
        // Handle other statuses like CANCELED, EXPIRED, UNRESOLVED
        return new Response(JSON.stringify({ error: `Payment status is ${lastStatus}. Please complete payment or try again.` }), { status: 402, headers: { 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error('Error in get-download-link:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
