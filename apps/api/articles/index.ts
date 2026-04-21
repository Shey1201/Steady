import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';
import { authenticate } from '../lib/auth';
import { withErrorHandler } from '../lib/wrapper';

async function handler(req: VercelRequest, res: VercelResponse) {
  const user = authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const articles = await prisma.article.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.status(200).json(articles);
  }

  if (req.method === 'POST') {
    const { url, title, content, summary } = req.body;
    
    if (!url || !content) {
      return res.status(400).json({ error: 'URL and content are required' });
    }

    const article = await prisma.article.upsert({
      where: {
        userId_url: {
          userId: user.userId,
          url: url,
        }
      },
      update: {
        title,
        content,
        summary,
      },
      create: {
        userId: user.userId,
        url,
        title,
        content,
        summary,
      },
    });
    return res.status(201).json(article);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withErrorHandler(handler);
