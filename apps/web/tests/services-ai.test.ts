import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateText, generateQuickMeaning } from '../src/services/ai';

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('services/ai', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  describe('generateText', () => {
    it('calls API correctly and returns text', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ text: 'AI response' }),
      });

      const result = await generateText('test prompt', 500, false, 'chat');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      
      expect(url).toContain('/generate');
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body.prompt).toBe('test prompt');
      expect(body.maxTokens).toBe(500);
      expect(body.task).toBe('chat');

      expect(result).toBe('AI response');
    });

    it('throws error when API fails', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server Error' }),
      });

      await expect(generateText('fail', 100)).rejects.toThrow('Server Error');
    });
  });

  describe('generateQuickMeaning', () => {
    it('parses JSON response correctly', async () => {
      const mockResponse = {
        simpleAnalysis: { definition: 'def' },
        fullAiReport: { essential: { meaning: 'mean' } }
      };
      
      // AI might return markdown code blocks
      const aiText = '```json\n' + JSON.stringify(mockResponse) + '\n```';

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ text: aiText }),
      });

      // Note: generateQuickMeaning uses a cache. If we run tests in parallel or reuse state, 
      // we might need to clear it, but here we assume a fresh run or unique keys.
      // We use a unique term to bypass cache just in case.
      const result = await generateQuickMeaning('unique_word_' + Date.now(), 'ctx', 'en');

      expect(result).toEqual(mockResponse);
    });

    it('handles malformed JSON', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ text: 'invalid json' }),
      });

      await expect(generateQuickMeaning('bad_json_word', 'ctx', 'en')).rejects.toThrow('Invalid JSON response from AI');
    });
  });
});
