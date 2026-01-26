import { withEdgeErrorHandler } from '../lib/wrapper';

async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400 });
  }

  // MOCK: Return success without DB
  const token = 'mock-jwt-token-' + Date.now();
  const user = {
    id: 'mock-user-id',
    email,
    name: email.split('@')[0],
  };

  return new Response(JSON.stringify({ token, user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export default withEdgeErrorHandler(handler);
