const fs = require('fs');
const cheerio = require('cheerio');

const BASE_URL = 'https://spiderum.com';
const SOURCE_URLS = (process.env.SPIDERUM_SOURCE_URLS ||
  'https://spiderum.com/danh-muc/khoa-hoc-cong-nghe,https://spiderum.com/danh-muc/quan-diem-tranh-luan,https://spiderum.com/danh-muc/life-style,https://spiderum.com/nguoi-dung/spiderum')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);
const OUTPUT_PATH = './src/data/articles.json';
const MAX_ARTICLES = Number.parseInt(process.env.SPIDERUM_MAX_ARTICLES || '24', 10);
const PREFERRED_KEYWORDS = [
  'ai',
  'công nghệ',
  'cong nghe',
  'khoa học',
  'khoa hoc',
  'lập trình',
  'lap trinh',
  'it',
  'cuộc sống',
  'cuoc song',
  'quan điểm',
  'quan diem',
  'tranh luận',
  'tranh luan',
  'nghề nghiệp',
  'nghe nghiep',
  'career',
  'life',
  'life style',
  'lifestyle',
  'urban life',
  'minimalism',
  'phát triển bản thân',
  'phat trien ban than',
  'người trẻ',
  'nguoi tre'
];
const PREFERRED_PATTERNS = [
  /\bai\b/,
  /\bit\b/,
  /\bcong nghe\b/,
  /\bkhoa hoc\b/,
  /\blap trinh\b/,
  /\bphan mem\b/,
  /\bdeveloper\b/,
  /\bprogramming\b/,
  /\bsoftware\b/,
  /\bweb3\b/,
  /\bdu lieu\b/,
  /\bmachine learning\b/,
  /\bdeep learning\b/,
  /\bcuoc song\b/,
  /\bquan diem\b/,
  /\btranh luan\b/,
  /\blife style\b/,
  /\blifestyle\b/,
  /\bphat trien ban than\b/,
  /\bnguoi tre\b/,
  /\bcareer\b/,
  /\bnghe nghiep\b/,
];
const EXCLUDED_KEYWORDS = [
  'tài chính',
  'tai chinh',
  'sách',
  'sach',
  'sự kiện',
  'su kien',
  'hackathon',
  'cuộc thi',
  'cuoc thi',
  'đồng hành',
  'dong hanh',
  'homentor',
  'tiền không tệ',
  'tien khong te',
  'mở bán sách',
  'mo ban sach',
  'tuyển dụng',
  'tuyen dung',
  '100 triệu',
  '100 trieu'
];
const EXCLUDED_PATTERNS = EXCLUDED_KEYWORDS.map((keyword) => new RegExp(`\\b${normalizeKeyword(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`));

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function slugFromUrl(url) {
  return url.split('/').filter(Boolean).pop() || url;
}

function normalizeKeyword(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
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

function keywordScore(text, keywords) {
  const normalized = normalizeKeyword(text);
  return keywords.reduce((score, keyword) => {
    return score + (normalized.includes(normalizeKeyword(keyword)) ? 1 : 0);
  }, 0);
}

function sourcePriority(sourceUrl) {
  const normalized = normalizeKeyword(sourceUrl);
  if (normalized.includes('khoa-hoc-cong-nghe')) return 3;
  if (normalized.includes('quan-diem-tranh-luan')) return 2;
  if (normalized.includes('life-style')) return 1;
  return 0;
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

function extractListEntries(html, sourceUrl) {
  const $ = cheerio.load(html);
  const seen = new Set();
  const entries = [];

  $('a[href*="/bai-dang/"]').each((_, element) => {
    const href = $(element).attr('href');
    const title = normalizeWhitespace($(element).text());
    if (!href || !title) return;
    if (/^\d+$/.test(title)) return;
    if (['Mới nhất', 'Hot nhất'].includes(title)) return;

    const absoluteUrl = new URL(href, sourceUrl).toString();
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
      sourceUrl,
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
        const resolvedSrc = new URL(src, BASE_URL).toString();
        const alt = image.attr('alt') || '';
        blocks.push(`<figure><img src="${resolvedSrc}" alt="${alt}" loading="lazy" decoding="async" /></figure>`);
      }
      return;
    }

    if (embed.length) {
      const link = embed.attr('href');
      const title = normalizeWhitespace(embed.find('.link-tool__title').text());
      if (link && title) {
        blocks.push(`<p><a href="${new URL(link, BASE_URL).toString()}" target="_blank" rel="noopener noreferrer">${title}</a></p>`);
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

function isPreferredArticle(article) {
  const haystack = normalizeKeyword([article.title, article.excerpt, ...(article.tags || [])].join(' '));
  if (EXCLUDED_PATTERNS.some((pattern) => pattern.test(haystack))) {
    return false;
  }
  return PREFERRED_PATTERNS.some((pattern) => pattern.test(haystack));
}

function articlePriorityScore(article) {
  const haystack = [article.title, article.excerpt, ...(article.tags || [])].join(' ');
  return (
    keywordScore(haystack, PREFERRED_KEYWORDS) +
    sourcePriority(article.sourceUrl || '')
  );
}

async function main() {
  const dedupedEntries = new Map();
  for (const sourceUrl of SOURCE_URLS) {
    const listHtml = await fetchHtml(sourceUrl);
    const entriesFromSource = extractListEntries(listHtml, sourceUrl);
    entriesFromSource.forEach((entry) => {
      const existing = dedupedEntries.get(entry.link);
      if (!existing || articlePriorityScore(entry) > articlePriorityScore(existing)) {
        dedupedEntries.set(entry.link, entry);
      }
    });
  }
  const entries = Array.from(dedupedEntries.values())
    .sort((a, b) => articlePriorityScore(b) - articlePriorityScore(a))
    .slice(0, MAX_ARTICLES);
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

  const selectedArticles = articles
    .filter(isPreferredArticle)
    .sort((a, b) => articlePriorityScore(b) - articlePriorityScore(a));
  const fallbackArticles = [...articles].sort((a, b) => articlePriorityScore(b) - articlePriorityScore(a));
  const finalSpiderumArticles = (selectedArticles.length > 0 ? selectedArticles : fallbackArticles).slice(0, MAX_ARTICLES);
  const mergedArticles = [...finalSpiderumArticles, ...preservedArticles];
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mergedArticles, null, 2) + '\n', 'utf8');
  console.log(`Saved ${finalSpiderumArticles.length} Spiderum articles and preserved ${preservedArticles.length} existing non-Spiderum articles.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
