import type { Handler } from '@netlify/functions';

// This function is currently unused but is given a valid handler
// to prevent the Netlify dev server from crashing or entering a reload loop
// due to an empty function file.
const handler: Handler = async () => {
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'This function is not implemented.' }),
  };
};

export { handler };
