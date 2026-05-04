const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE_URL = 'https://spiderum.com';
const TXNAM_BASE_URL = 'https://txnam.net';
const SOURCE_URLS = (process.env.SPIDERUM_SOURCE_URLS ||
  'https://spiderum.com/nguoi-dung/spiderum,https://spiderum.com/danh-muc/khoa-hoc-cong-nghe,https://spiderum.com/danh-muc/quan-diem-tranh-luan,https://spiderum.com/danh-muc/life-style')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);
const TXNAM_SOURCE_URL = process.env.TXNAM_SOURCE_URL || 'https://txnam.net';
const OUTPUT_PATH = './public/data/articles.json';
const CONTENT_DIR = './public/data/articles';
const MAX_ARTICLES = Number.parseInt(process.env.SPIDERUM_MAX_ARTICLES || '28', 10);
const TXNAM_MAX_ARTICLES = Number.parseInt(process.env.TXNAM_MAX_ARTICLES || '10', 10);
const TOTAL_ARTICLE_LIMIT = Number.parseInt(process.env.TOTAL_ARTICLE_LIMIT || '100', 10);
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
const EXCLUDED_KEYWORDS = [
  'sự kiện',
  'su kien',
  'hackathon',
  'cuộc thi',
  'cuoc thi',
  'đồng hành',
  'dong hanh',
  'homentor',
  'mở bán sách',
  'mo ban sach',
  'tuyển dụng',
  'tuyen dung'
];
const EXCLUDED_PATTERNS = EXCLUDED_KEYWORDS.map((keyword) => new RegExp(`\\b${normalizeKeyword(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`));
const STRONG_TECH_PATTERNS = [
  /\bai\b/,
  /\bllm\b/,
  /\bchatgpt\b/,
  /\blap trinh\b/,
  /\bphan mem\b/,
  /\bcong nghe\b/,
  /\bkhoa hoc\b/,
  /\bdeveloper\b/,
  /\bprogramming\b/,
  /\bsoftware\b/,
  /\bcoding\b/,
  /\bbackend\b/,
  /\bfrontend\b/,
  /\bfullstack\b/,
  /\bdevops\b/,
  /\bcloud\b/,
  /\bsecurity\b/,
  /\bcybersecurity\b/,
  /\bmachine learning\b/,
  /\bdeep learning\b/,
  /\bdu lieu\b/,
  /\bdata\b/,
  /\bgame\b/,
];
const YOUTH_PATTERNS = [
  /\bcuoc song\b/,
  /\bquan diem\b/,
  /\btranh luan\b/,
  /\blife style\b/,
  /\blifestyle\b/,
  /\bminimalism\b/,
  /\bphat trien ban than\b/,
  /\bnguoi tre\b/,
  /\bcareer\b/,
  /\bnghe nghiep\b/,
];

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function hasReadableHtmlContent(html) {
  return normalizeWhitespace(cheerio.load(html || '').text()).length > 0;
}

function findSpiderumLegacyContent($) {
  const selectors = [
    '.post-content .p-content',
    '.post-container .p-content',
    '.p-content',
    '.post-content',
  ];

  for (const selector of selectors) {
    const candidates = $(selector).toArray();
    const candidate = candidates
      .map((element) => $(element))
      .find((element) => normalizeWhitespace(element.text()).length > 200);
    if (candidate) return candidate.clone();
  }

  return null;
}

function slugFromUrl(url) {
  return url.split('/').filter(Boolean).pop() || url;
}

function contentPathForArticle(articleId) {
  return path.join(CONTENT_DIR, `${encodeURIComponent(articleId)}.json`);
}

function readStoredArticleContent(article) {
  if (typeof article.content === 'string') return article.content;
  try {
    const contentPayload = JSON.parse(fs.readFileSync(contentPathForArticle(article.id), 'utf8'));
    return typeof contentPayload.content === 'string' ? contentPayload.content : '';
  } catch {
    return '';
  }
}

function articleMetadata(article) {
  const { content, ...metadata } = article;
  return metadata;
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
  if (normalized.includes('khoa-hoc-cong-nghe')) return 5;
  if (normalized.includes('quan-diem-tranh-luan')) return 2;
  if (normalized.includes('life-style')) return 1;
  return 0;
}

function matchCount(text, patterns) {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
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

  let content = blocks.join('');
  let fallbackBody = null;

  if (!hasReadableHtmlContent(content)) {
    fallbackBody = findSpiderumLegacyContent($);
    if (!fallbackBody) fallbackBody = cheerio.load('<div></div>')('div');
    fallbackBody.find('script, style, iframe, object, embed, link, meta').remove();
    fallbackBody.find('.interaction-author, .interaction-post, .tags-wrapper, voter, bookmark, avatar, spiderum-icon').remove();
    fallbackBody.find('img').each((_, image) => {
      const imageEl = fallbackBody.find(image);
      const src = imageEl.attr('data-src') || imageEl.attr('src');
      if (!src) return;
      imageEl.attr('src', new URL(src, BASE_URL).toString());
      imageEl.removeAttr('srcset');
      imageEl.removeAttr('sizes');
      imageEl.attr('loading', 'lazy');
      imageEl.attr('decoding', 'async');
    });

    fallbackBody.children('div').each((_, element) => {
      const block = fallbackBody.find(element);
      if (!normalizeWhitespace(block.text()) && block.find('img, figure, hr, ul, ol, blockquote').length === 0) {
        block.remove();
        return;
      }
      if (block.children('figure, img, ul, ol, blockquote, h1, h2, h3, h4, h5, h6, hr').length === 0) {
        block.replaceWith(`<p>${block.html() || block.text()}</p>`);
      }
    });

    content = fallbackBody.html()?.trim() || '';
  }

  const excerpt =
    normalizeWhitespace(editor.find('.ce-paragraph').first().text()) ||
    normalizeWhitespace(fallbackBody?.find('p, div').first().text() || '') ||
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

function isAllowedArticle(article) {
  const haystack = normalizeKeyword([article.title, article.excerpt, ...(article.tags || [])].join(' '));
  return !EXCLUDED_PATTERNS.some((pattern) => pattern.test(haystack));
}

function articlePriorityScore(article) {
  const haystack = normalizeKeyword([article.title, article.excerpt, ...(article.tags || [])].join(' '));
  return (
    keywordScore(haystack, PREFERRED_KEYWORDS) +
    sourcePriority(article.sourceUrl || '') +
    matchCount(haystack, STRONG_TECH_PATTERNS) * 3 +
    matchCount(haystack, YOUTH_PATTERNS)
  );
}

function normalizeTxnamImages($root) {
  $root.find('img').each((_, image) => {
    const $image = $root.find(image);
    const src = $image.attr('data-src') || $image.attr('src');
    if (!src) return;
    $image.attr('src', new URL(src, TXNAM_BASE_URL).toString());
    $image.removeAttr('srcset');
    $image.attr('loading', 'lazy');
    $image.attr('decoding', 'async');
  });
}

function extractTxnamListEntries(html) {
  const $ = cheerio.load(html);
  const entries = [];
  const seen = new Set();

  $('div.post').each((_, post) => {
    const $post = $(post);
    const titleLink = $post.find('h2 a').first();
    const href = titleLink.attr('href');
    const title = normalizeWhitespace(titleLink.text());
    if (!href || !title) return;

    const absoluteUrl = new URL(href, TXNAM_BASE_URL).toString();
    if (seen.has(absoluteUrl)) return;

    const date = normalizeWhitespace($post.find('.post-date').first().text());
    const excerpt = normalizeWhitespace(
      $post
        .clone()
        .find('h2, .post-date, .post-category, .post-comment, .readmore')
        .remove()
        .end()
        .text()
    );
    const category = normalizeWhitespace($post.find('.post-category a').first().text());

    entries.push({
      id: slugFromUrl(absoluteUrl),
      title,
      link: absoluteUrl,
      date: date ? parseDate(date) : '',
      excerpt,
      category,
    });
    seen.add(absoluteUrl);
  });

  return entries.slice(0, TXNAM_MAX_ARTICLES);
}

function extractTxnamArticleContent(html, fallbackTitle) {
  const $ = cheerio.load(html);
  const title = normalizeWhitespace($('.post h1').first().text()) || fallbackTitle;
  const body = $('.post-body').first().clone();
  normalizeTxnamImages(body);

  const content = body.html()?.trim() || '';
  const excerpt =
    normalizeWhitespace(body.find('p').first().text()) ||
    normalizeWhitespace($('meta[name="Description"]').attr('content') || '');
  const tags = [];

  $('.post .post-category a, meta[name="Keywords"]').each((_, element) => {
    if (element.tagName === 'meta') {
      const keywords = ($(element).attr('content') || '')
        .split(',')
        .map((keyword) => normalizeWhitespace(keyword))
        .filter(Boolean);
      keywords.forEach((keyword) => {
        if (!tags.includes(keyword) && tags.length < 5) tags.push(keyword);
      });
      return;
    }

    const text = normalizeWhitespace($(element).text());
    if (text && !tags.includes(text) && tags.length < 5) tags.push(text);
  });

  const plainText = normalizeWhitespace(body.text());
  const wordCount = plainText.split(' ').filter(Boolean).length;

  return {
    title,
    content,
    excerpt,
    tags: tags.length > 0 ? tags : ['txnam.net'],
    readTime: `${Math.max(3, Math.ceil(wordCount / 200))} min read`,
  };
}

async function fetchSpiderumArticles() {
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

  const entries = Array.from(dedupedEntries.values()).slice(0, MAX_ARTICLES);
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
        source: 'spiderum',
      });
    } catch (error) {
      console.error(`Failed to fetch article ${entry.link}: ${error.message}`);
    }
  }

  const allowedArticles = articles.filter(isAllowedArticle);
  return (allowedArticles.length > 0 ? allowedArticles : articles)
    .sort((a, b) => articlePriorityScore(b) - articlePriorityScore(a))
    .slice(0, MAX_ARTICLES);
}

async function fetchTxnamArticles() {
  const homepageHtml = await fetchHtml(TXNAM_SOURCE_URL);
  const entries = extractTxnamListEntries(homepageHtml);
  if (entries.length === 0) {
    throw new Error('No txnam articles found on the homepage.');
  }

  const articles = [];
  for (const entry of entries) {
    console.log(`Fetching txnam article: ${entry.title}`);
    try {
      const articleHtml = await fetchHtml(entry.link);
      const extracted = extractTxnamArticleContent(articleHtml, entry.title);
      articles.push({
        id: entry.id,
        title: extracted.title,
        date: entry.date,
        readTime: extracted.readTime,
        excerpt: (entry.excerpt || extracted.excerpt || '').slice(0, 220).trim() + ((entry.excerpt || extracted.excerpt || '').length > 220 ? '...' : ''),
        content: extracted.content,
        tags: extracted.tags,
        link: entry.link,
        source: 'txnam',
      });
    } catch (error) {
      console.error(`Failed to fetch txnam article ${entry.link}: ${error.message}`);
    }
  }

  return articles;
}

async function main() {
  const spiderumArticles = await fetchSpiderumArticles();
  const txnamArticles = await fetchTxnamArticles();
  let existingArticles = [];
  try {
    existingArticles = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
  } catch {
    existingArticles = [];
  }

  const existingSpiderumArticles = existingArticles.filter((article) => article?.source === 'spiderum' && typeof article.link === 'string');
  const spiderumArchive = [];
  const seenSpiderumLinks = new Set();

  [...spiderumArticles, ...existingSpiderumArticles].forEach((article) => {
    if (!article?.link || seenSpiderumLinks.has(article.link)) return;
    seenSpiderumLinks.add(article.link);
    spiderumArchive.push({
      ...article,
      content: readStoredArticleContent(article),
      source: 'spiderum',
    });
  });

  const spiderumLimit = Math.max(0, TOTAL_ARTICLE_LIMIT - txnamArticles.length);
  const mergedArticles = [...spiderumArchive.slice(0, spiderumLimit), ...txnamArticles].slice(0, TOTAL_ARTICLE_LIMIT);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.mkdirSync(CONTENT_DIR, { recursive: true });

  const activeContentFiles = new Set();
  mergedArticles.forEach((article) => {
    const contentPath = contentPathForArticle(article.id);
    activeContentFiles.add(path.basename(contentPath));
    fs.writeFileSync(
      contentPath,
      JSON.stringify({ id: article.id, content: article.content || '' }, null, 2) + '\n',
      'utf8'
    );
  });

  fs.readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith('.json') && !activeContentFiles.has(file))
    .forEach((file) => fs.unlinkSync(path.join(CONTENT_DIR, file)));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mergedArticles.map(articleMetadata), null, 2) + '\n', 'utf8');
  console.log(`Saved ${Math.min(spiderumArchive.length, spiderumLimit)} Spiderum articles and ${txnamArticles.length} txnam articles.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
