import * as cheerio from 'cheerio';
import { handleApiError } from './lib/wrapper';

export async function GET(request: Request) {
  try {
    const urlObj = new URL(request.url);
    const url = urlObj.searchParams.get('url');

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch URL' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const headTitle = $('head > title').text().trim();
    const h1Title = $('h1').first().text().trim();
    const wechatTitle = $('#activity-name').text().trim();
    const title = wechatTitle || h1Title || headTitle;

    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('footer').remove();
    $('iframe').remove();

    let paragraphs: string[] = [];

    if (url.includes('mp.weixin.qq.com')) {
      const root = $('#js_content');
      // Remove noise
      root.find('script, style, iframe, .js_audio_frame').remove();

      // Extract paragraphs
      root.find('p, section').each((_, el) => {
        // Skip nested sections to avoid duplication if we handle parent
        // Actually, WeChat often uses <section> for paragraphs.
        // We should only take leaf nodes or nodes that have direct text content
        const $el = $(el);
        
        // Simple heuristic: if it has no block children, it might be a paragraph
        if ($el.find('p, section, div').length === 0) {
           const text = $el.text().replace(/\s+/g, ' ').trim();
           if (text.length > 0) { // Keep even short lines as they might be titles inside the article
             paragraphs.push(text);
           }
        }
      });

      // Fallback if p/section extraction failed (e.g. text directly in root or divs)
      if (paragraphs.length < 5) {
        paragraphs = [];
        // Replace <br> with newlines to preserve structure
        root.find('br').replaceWith('\n');
        const rawText = root.text();
        paragraphs = rawText.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      }

      // Special handling for English learning articles (heuristic)
      // Look for "Start Markers" like "无注释原文", "From:", "Source:"
      const startMarkers = ['无注释原文', '无注释译文', 'From:', 'Source:', 'By ', '导读', 'Introduction'];
      let startIndex = -1;
      
      // Only search in the first half of the article to avoid false positives in comments/footer
      const searchLimit = paragraphs.length; // Search all paragraphs, not just first 30, because intro can be long
      
      for (let i = 0; i < searchLimit; i++) {
        const p = paragraphs[i];
        if (startMarkers.some(m => p.includes(m))) {
          // Found a potential start marker. 
          // If it's "From:", make sure it's short-ish to be a header, not a random sentence
          if (p.includes('From:') && p.length > 100) continue;
          
          startIndex = i;
          // Prefer "无注释原文" as it is the most specific marker for this type of article
          if (p.includes('无注释原文')) break;
        }
      }

      if (startIndex !== -1) {
         const markerLine = paragraphs[startIndex];
         // For "无注释原文", content usually starts AFTER this line
         if (markerLine.includes('无注释原文') || markerLine.includes('无注释译文')) {
             startIndex += 1;
         }
         // For "From:", content often starts here or shortly after
         
         if (startIndex < paragraphs.length) {
             const cleanParagraphs = paragraphs.slice(startIndex);
             // Ensure we didn't slice everything off
             if (cleanParagraphs.join('').length > 50) {
                 paragraphs = cleanParagraphs;
             }
         }
      }
      
      // Filter out common noise in WeChat articles
      paragraphs = paragraphs.filter(p => {
          const noise = [
              '微信号', '功能介绍', '收录于合集', '点击上方', '关注我们', 
              '预览时标签不可点', '轻触阅读原文', '喜欢作者', '文章已于',
              'Modified on', 'People who liked this content also liked',
              '今天你练听力了吗', '小作业：'
          ];
          if (p.length < 50 && noise.some(n => p.includes(n))) return false;
          // Specific check for "小作业" which might be long
          if (p.includes('小作业：') || p.includes('小作业:')) return false;
          return true;
      });

      // Truncate footer content
      // Often WeChat articles end with standard footers or repetitive info
      const endMarkers = [
        '预览时标签不可点', 
        '喜欢作者', 
        'Reads', 
        'Wow', 
        '轻触阅读原文',
        'Scan to follow',
        'Swipe for more',
        '微信扫一扫',
        'To view the profile',
        'Switch to dark mode',
        '- ◆ -',
        '注：',
        '中文文本',
        '参考译文',
        '含注释全文',
        '词汇：'
      ];
      
      for (let i = 0; i < paragraphs.length; i++) {
          const p = paragraphs[i];
          // Check for end markers
          // For "- ◆ -", it's usually a standalone line or very distinct
          if (p.includes('- ◆ -')) {
              paragraphs = paragraphs.slice(0, i);
              break;
          }
          
          // For "注：" or "中文文本", they might be at start of a line
          if (endMarkers.some(m => p.startsWith(m) || (p.length < 20 && p.includes(m)))) {
              // Found end marker, truncate here
              paragraphs = paragraphs.slice(0, i);
              break;
          }
      }
    }

    if (!paragraphs.length) {
      const articleEl = $('article').first();
      if (articleEl.length) {
        articleEl.find('p').each((_, el) => {
          const text = $(el).text().replace(/\s+/g, ' ').trim();
          if (text.length >= 10) {
            paragraphs.push(text);
          }
        });
      }
    }

    if (!paragraphs.length) {
      const mainEl = $('main').first();
      if (mainEl.length) {
        mainEl.find('p').each((_, el) => {
          const text = $(el).text().replace(/\s+/g, ' ').trim();
          if (text.length >= 10) {
            paragraphs.push(text);
          }
        });
      }
    }

    if (!paragraphs.length) {
      let maxLen = 0;
      let bestEl: any = null;
      $('div, section').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > maxLen && text.length > 100) {
          if ($(el).children().length < 20) {
            maxLen = text.length;
            bestEl = el;
          }
        }
      });
      if (bestEl) {
        const container = $(bestEl);
        container.find('p').each((_, el) => {
          const text = $(el).text().replace(/\s+/g, ' ').trim();
          if (text.length >= 10) {
            paragraphs.push(text);
          }
        });
        if (!paragraphs.length) {
          const text = container.text().replace(/\s+/g, ' ').trim();
          if (text.length) {
            paragraphs.push(text);
          }
        }
      }
    }

    if (!paragraphs.length) {
      const bodyText = $('body')
        .text()
        .split(/\n+/)
        .map((t) => t.replace(/\s+/g, ' ').trim())
        .filter((t) => t.length >= 10);
      paragraphs = bodyText;
    }

    const cleanContent = paragraphs.join('\n\n');
    const summary = cleanContent.substring(0, 200) + '...';

    return new Response(
      JSON.stringify({
        url,
        title,
        content: cleanContent,
        summary
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
