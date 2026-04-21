import { VercelRequest, VercelResponse } from '@vercel/node';
import { withErrorHandler } from '../lib/wrapper';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // MOCK: Return success without DB
  const token = 'mock-jwt-token-' + Date.now();
  const user = {
    id: 'mock-user-id',
    email,
    name: email.split('@')[0],
  };

  return res.status(200).json({ token, user });
}

export default withErrorHandler(handler);
