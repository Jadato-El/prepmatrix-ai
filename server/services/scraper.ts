import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedResult {
  title: string;
  content: string;
  excerpt: string;
  wordCount: number;
  url: string;
}

export async function scrapeUrl(targetUrl: string): Promise<ScrapedResult> {
  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl.trim());
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are supported.');
    }
  } catch (err: any) {
    throw new Error(`Invalid URL: ${err.message}`);
  }

  const response = await axios.get(parsedUrl.toString(), {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 PrepMatrixBot/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 15000,
    maxRedirects: 5,
  });

  const html = response.data;
  const $ = cheerio.load(html);

  // Remove unwanted elements that pollute academic text
  $('script, style, noscript, nav, header, footer, aside, iframe, form, button, svg, [role="banner"], [role="navigation"], .ads, .advertisement, .cookie-banner, .social-share').remove();

  // Extract Title
  let title = $('meta[property="og:title"]').attr('content') ||
              $('meta[name="twitter:title"]').attr('content') ||
              $('h1').first().text().trim() ||
              $('title').text().trim() ||
              parsedUrl.hostname;

  // Clean title if it contains site suffix
  title = title.split(' | ')[0].split(' - ')[0].trim();

  // Extract Description/Excerpt
  const excerpt = $('meta[property="og:description"]').attr('content') ||
                  $('meta[name="description"]').attr('content') ||
                  '';

  // Extract main content container if available, else body
  let mainContentElem = $('article, main, [role="main"], .content, .post-content, #content, .entry-content');
  if (!mainContentElem.length) {
    mainContentElem = $('body');
  }

  // Extract paragraphs, list items, and headings
  const textBlocks: string[] = [];
  mainContentElem.find('h1, h2, h3, h4, p, li, blockquote').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text.length > 20) { // filter out navigation crumbs & tiny fragments
      textBlocks.push(text);
    }
  });

  let cleanContent = textBlocks.join('\n\n');
  if (!cleanContent) {
    cleanContent = mainContentElem.text().replace(/\s+/g, ' ').trim();
  }

  const wordCount = cleanContent.split(/\s+/).filter(Boolean).length;

  return {
    title: title || 'Scraped Web Article',
    content: cleanContent,
    excerpt: excerpt || cleanContent.slice(0, 240) + '...',
    wordCount,
    url: targetUrl,
  };
}
