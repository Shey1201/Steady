import { VercelRequest, VercelResponse } from '@vercel/node';
import { logger } from './logger';

type VercelHandler = (req: VercelRequest, res: VercelResponse) => Promise<any> | any;

export function withErrorHandler(handler: VercelHandler): VercelHandler {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      // Log request details (omit sensitive body parts if necessary)
      logger.info(`Request: ${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        query: req.query,
        headers: {
            'user-agent': req.headers['user-agent'],
            'content-type': req.headers['content-type'],
        }
      });

      return await handler(req, res);
    } catch (error: any) {
      // Log the full error
      logger.error('Unhandled API Error', error, {
        method: req.method,
        url: req.url,
      });

      // Determine status code
      const statusCode = error.statusCode || error.status || 500;
      const message = statusCode === 500 ? 'Internal Server Error' : error.message;

      return res.status(statusCode).json({
        error: message,
        requestId: req.headers['x-vercel-id'] || 'unknown',
      });
    }
  };
}

// For Edge Runtime (fetch API based) handlers
type EdgeHandler = (req: Request) => Promise<Response>;

export function withEdgeErrorHandler(handler: EdgeHandler): EdgeHandler {
    return async (req: Request) => {
        try {
            return await handler(req);
        } catch (error: any) {
            return handleApiError(error, req);
        }
    }
}

export function handleApiError(error: any, req?: Request): Response {
    logger.error('Unhandled Edge API Error', error, {
        method: req?.method,
        url: req?.url,
    });
    
    return new Response(JSON.stringify({ 
        error: 'Internal Server Error', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
}
