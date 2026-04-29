const fs = require('fs');
const cheerio = require('cheerio');

const SOURCE_URL = process.env.SPIDERUM_SOURCE_URL || 'https://spiderum.com/nguoi-dung/spiderum';
const OUTPUT_PATH = './src/data/articles.json';
const MAX_ARTICLES = Number.parseInt(process.env.SPIDERUM_MAX_ARTICLES || '18', 10);

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function slugFromUrl(url) {
  return url.split('/').filter(Boolean).pop() || url;
}

function parseReadTime(text) {
  const match = text.match(/(\d+)\s*phút đọc/i);
  return match ? `${match[1]} min read` : '5 min read';
}

function parseDate(text) {
  const trimmed = normalizeWhitespace(text);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }
  return trimmed;
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; SavagersBot/1.0; +https://github.com/TrungAnhx/--Savagers.Website1)',
      accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }
  return response.text();
}

function extractListEntries(html) {
  const $ = cheerio.load(html);
  const seen = new Set();
  const entries = [];

  $('a[href*="/bai-dang/"]').each((_, element) => {
    const href = $(element).attr('href');
    const title = normalizeWhitespace($(element).text());
    if (!href || !title) return;
    if (['Mới nhất', 'Hot nhất'].includes(title)) return;

    const absoluteUrl = new URL(href, SOURCE_URL).toString();
    if (seen.has(absoluteUrl)) return;

    const container = $(element).closest('div, article, section');
    const containerText = normalizeWhitespace(container.text());
    const readTime = parseReadTime(containerText);
    const dateMatch = containerText.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
    const excerpt = normalizeWhitespace(
      container
        .find('p')
        .map((__, node) => $(node).text())
        .get()
        .join(' ')
    );

    entries.push({
      id: slugFromUrl(absoluteUrl),
      title,
      link: absoluteUrl,
      excerpt: excerpt && excerpt !== title ? excerpt : '',
      readTime,
      date: dateMatch ? parseDate(dateMatch[0]) : '',
    });
    seen.add(absoluteUrl);
  });

  return entries.slice(0, MAX_ARTICLES);
}

function extractArticleContent(html, fallbackTitle) {
  const $ = cheerio.load(html);
  const pageTitle = normalizeWhitespace($('h1').first().text()) || fallbackTitle;
  const editor = $('#post-content .editor').first();
  const blocks = [];

  editor.find('.ce-block').each((_, block) => {
    const blockEl = $(block);
    const paragraph = blockEl.find('.ce-paragraph').first();
    const heading = blockEl.find('.ce-header').first();
    const image = blockEl.find('img').first();
    const list = blockEl.find('ul, ol').first();
    const quote = blockEl.find('blockquote').first();
    const embed = blockEl.find('.link-tool__content').first();

    if (heading.length) {
      const level = heading.get(0).tagName?.toLowerCase() || 'h3';
      const text = normalizeWhitespace(heading.text());
      if (text) blocks.push(`<${level}>${text}</${level}>`);
      return;
    }

    if (paragraph.length) {
      const htmlContent = paragraph.html() || '';
      if (normalizeWhitespace(paragraph.text())) {
        blocks.push(`<p>${htmlContent}</p>`);
      }
      return;
    }

    if (list.length && normalizeWhitespace(list.text())) {
      blocks.push($.html(list));
      return;
    }

    if (quote.length && normalizeWhitespace(quote.text())) {
      blocks.push($.html(quote));
      return;
    }

    if (image.length) {
      const src = image.attr('data-src') || image.attr('src');
      if (src) {
        const resolvedSrc = new URL(src, SOURCE_URL).toString();
        const alt = image.attr('alt') || '';
        blocks.push(`<figure><img src="${resolvedSrc}" alt="${alt}" loading="lazy" decoding="async" /></figure>`);
      }
      return;
    }

    if (embed.length) {
      const link = embed.attr('href');
      const title = normalizeWhitespace(embed.find('.link-tool__title').text());
      if (link && title) {
        blocks.push(`<p><a href="${new URL(link, SOURCE_URL).toString()}" target="_blank" rel="noopener noreferrer">${title}</a></p>`);
      }
    }
  });

  const content = blocks.join('');
  const excerpt =
    normalizeWhitespace(editor.find('.ce-paragraph').first().text()) ||
    normalizeWhitespace($('meta[name="description"]').attr('content') || '');

  const plainText = normalizeWhitespace(cheerio.load(content).text());
  const wordCount = plainText.split(' ').filter(Boolean).length;

  return {
    title: pageTitle,
    content,
    excerpt,
    readTime: `${Math.max(3, Math.ceil(wordCount / 200))} min read`,
  };
}

function extractTags(html) {
  const $ = cheerio.load(html);
  const tags = [];
  $('#post-subscription .cat-name, .tags-wrapper a').each((_, element) => {
    const text = normalizeWhitespace($(element).text());
    if (!text || text.includes('@')) return;
    if (!tags.includes(text) && tags.length < 4) tags.push(text);
  });
  return tags.length > 0 ? tags : ['Spiderum'];
}

async function main() {
  const listHtml = await fetchHtml(SOURCE_URL);
  const entries = extractListEntries(listHtml);
  if (entries.length === 0) {
    throw new Error('No Spiderum articles found from source page.');
  }

  const articles = [];
  for (const entry of entries) {
    console.log(`Fetching Spiderum article: ${entry.title}`);
    try {
      const articleHtml = await fetchHtml(entry.link);
      const extracted = extractArticleContent(articleHtml, entry.title);
      const tags = extractTags(articleHtml);
      articles.push({
        id: entry.id,
        title: extracted.title || entry.title,
        date: entry.date || '',
        readTime: extracted.readTime || entry.readTime,
        excerpt: (entry.excerpt || extracted.excerpt || '').slice(0, 220).trim() + ((entry.excerpt || extracted.excerpt || '').length > 220 ? '...' : ''),
        content: extracted.content,
        tags,
        link: entry.link,
      });
    } catch (error) {
      console.error(`Failed to fetch article ${entry.link}: ${error.message}`);
    }
  }

  if (articles.length === 0) {
    throw new Error('Spiderum fetch completed with zero valid articles.');
  }

  let existingArticles = [];
  try {
    existingArticles = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
  } catch {
    existingArticles = [];
  }

  const preservedArticles = existingArticles.filter((article) => {
    if (!article || typeof article !== 'object') return false;
    return typeof article.link === 'string' && !article.link.includes('spiderum.com');
  });

  const mergedArticles = [...articles, ...preservedArticles];
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mergedArticles, null, 2) + '\n', 'utf8');
  console.log(`Saved ${articles.length} Spiderum articles and preserved ${preservedArticles.length} existing non-Spiderum articles.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
