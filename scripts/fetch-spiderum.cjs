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
const STATUS_PATH = './public/data/fetch-status.json';
const MAX_ARTICLES = Number.parseInt(process.env.SPIDERUM_MAX_ARTICLES || '28', 10);
const TXNAM_MAX_ARTICLES = Number.parseInt(process.env.TXNAM_MAX_ARTICLES || '10', 10);
const TOTAL_ARTICLE_LIMIT = Number.parseInt(process.env.TOTAL_ARTICLE_LIMIT || '100', 10);
const FETCH_TIMEOUT_MS = parsePositiveInteger(process.env.FETCH_TIMEOUT_MS, 25000);
const FETCH_RETRY_ATTEMPTS = parsePositiveInteger(process.env.FETCH_RETRY_ATTEMPTS, 3);
const FETCH_RETRY_DELAY_MS = parsePositiveInteger(process.env.FETCH_RETRY_DELAY_MS, 1500);
const RUN_STARTED_AT = new Date().toISOString();
const runWarnings = [];
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

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

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

function normalizeSourceDate(text) {
  const trimmed = normalizeWhitespace(text);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/').map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toISOString();
  }
  return normalizePublishedAt(trimmed);
}

function formatDisplayDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function normalizePublishedAt(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function extractJsonLdArticles(html) {
  const $ = cheerio.load(html);
  const articles = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).html();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      nodes.forEach((node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node['@graph'])) {
          node['@graph'].forEach((graphNode) => {
            if (graphNode && typeof graphNode === 'object') nodes.push(graphNode);
          });
        }
        const type = node['@type'];
        const types = Array.isArray(type) ? type : [type];
        if (types.some((item) => typeof item === 'string' && item.toLowerCase().includes('article'))) {
          articles.push(node);
        }
      });
    } catch {
      // Ignore malformed structured data from source pages.
    }
  });

  return articles;
}

function extractPublishedAt(html) {
  const $ = cheerio.load(html);
  const structuredArticle = extractJsonLdArticles(html).find((article) => article.datePublished || article.dateModified);
  const candidates = [
    structuredArticle?.datePublished,
    structuredArticle?.dateModified,
    $('meta[property="article:published_time"]').attr('content'),
    $('meta[name="article:published_time"]').attr('content'),
    $('time[datetime]').first().attr('datetime'),
  ];

  for (const candidate of candidates) {
    const publishedAt = normalizePublishedAt(candidate);
    if (publishedAt) return publishedAt;
  }

  return '';
}

function articlePublishedTime(article) {
  const publishedAt = normalizePublishedAt(article.publishedAt);
  if (publishedAt) return new Date(publishedAt).getTime();

  const date = new Date(article.date || '');
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function sortByNewest(a, b) {
  const timeDiff = articlePublishedTime(b) - articlePublishedTime(a);
  if (timeDiff !== 0) return timeDiff;
  return articlePriorityScore(b) - articlePriorityScore(a);
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

function errorMessage(error) {
  if (error && typeof error === 'object' && error.name === 'AbortError') {
    return `Request timed out after ${FETCH_TIMEOUT_MS}ms`;
  }
  return error instanceof Error ? error.message : String(error);
}

function escapeActionMessage(value) {
  return String(value)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A');
}

function logWarning(message) {
  runWarnings.push(message);
  console.warn(message);
  if (process.env.GITHUB_ACTIONS === 'true') {
    console.log(`::warning::${escapeActionMessage(message)}`);
  }
}

function readFetchStatus() {
  try {
    return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function writeFetchStatus(status) {
  const previousStatus = readFetchStatus();
  const finishedAt = status.finishedAt || new Date().toISOString();
  const isFailure = status.status === 'failure';
  const previousFailures = previousStatus?.status === 'failure'
    ? Number.parseInt(previousStatus.consecutiveFailures || '0', 10) || 0
    : 0;
  const lastSuccessAt = isFailure
    ? previousStatus?.lastSuccessAt || (previousStatus?.status === 'success' ? previousStatus.finishedAt : '')
    : finishedAt;

  const payload = {
    version: 1,
    ...status,
    startedAt: status.startedAt || RUN_STARTED_AT,
    finishedAt,
    lastSuccessAt,
    consecutiveFailures: isFailure ? previousFailures + 1 : 0,
    warnings: status.warnings || runWarnings,
  };

  fs.mkdirSync(path.dirname(STATUS_PATH), { recursive: true });
  fs.writeFileSync(STATUS_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

async function fetchHtml(url) {
  let lastError = null;

  for (let attempt = 1; attempt <= FETCH_RETRY_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; SavagersBot/1.0; +https://github.com/TrungAnhx/--Savagers.Website1)',
          accept: 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = new Error(`Request failed for ${url}: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return response.text();
    } catch (error) {
      lastError = error;
      const status = error && typeof error === 'object' ? error.status : undefined;
      const canRetry = (!status || isRetryableStatus(status)) && attempt < FETCH_RETRY_ATTEMPTS;

      if (!canRetry) break;

      const delayMs = FETCH_RETRY_DELAY_MS * attempt;
      console.log(`Retrying ${url} in ${delayMs}ms (${attempt}/${FETCH_RETRY_ATTEMPTS}): ${errorMessage(error)}`);
      await sleep(delayMs);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error(`Request failed for ${url}`);
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

    const publishedAt = dateMatch ? normalizeSourceDate(dateMatch[0]) : '';

    entries.push({
      id: slugFromUrl(absoluteUrl),
      title,
      link: absoluteUrl,
      sourceUrl,
      excerpt: excerpt && excerpt !== title ? excerpt : '',
      readTime,
      date: dateMatch ? parseDate(dateMatch[0]) : '',
      publishedAt,
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
    const publishedAt = normalizeSourceDate(date);
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
      publishedAt,
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
  const failedSources = [];

  for (const sourceUrl of SOURCE_URLS) {
    try {
      const listHtml = await fetchHtml(sourceUrl);
      const entriesFromSource = extractListEntries(listHtml, sourceUrl);
      console.log(`Found ${entriesFromSource.length} Spiderum entries from ${sourceUrl}`);
      entriesFromSource.forEach((entry) => {
        const existing = dedupedEntries.get(entry.link);
        if (!existing || articlePriorityScore(entry) > articlePriorityScore(existing)) {
          dedupedEntries.set(entry.link, entry);
        }
      });
    } catch (error) {
      const message = `Skipping Spiderum source ${sourceUrl}: ${errorMessage(error)}`;
      failedSources.push(message);
      logWarning(message);
    }
  }

  const entries = Array.from(dedupedEntries.values())
    .sort(sortByNewest)
    .slice(0, MAX_ARTICLES);

  if (entries.length === 0) {
    throw new Error(
      failedSources.length > 0
        ? `No Spiderum articles found. Failed sources: ${failedSources.join(' | ')}`
        : 'No Spiderum articles found from source page.'
    );
  }

  const articles = [];
  for (const entry of entries) {
    console.log(`Fetching Spiderum article: ${entry.title}`);
    try {
      const articleHtml = await fetchHtml(entry.link);
      const extracted = extractArticleContent(articleHtml, entry.title);
      const publishedAt = extractPublishedAt(articleHtml) || entry.publishedAt || '';
      const tags = extractTags(articleHtml);
      articles.push({
        id: entry.id,
        title: extracted.title || entry.title,
        date: publishedAt ? formatDisplayDate(publishedAt) : entry.date || '',
        publishedAt,
        readTime: extracted.readTime || entry.readTime,
        excerpt: (entry.excerpt || extracted.excerpt || '').slice(0, 220).trim() + ((entry.excerpt || extracted.excerpt || '').length > 220 ? '...' : ''),
        content: extracted.content,
        tags,
        link: entry.link,
        source: 'spiderum',
      });
    } catch (error) {
      logWarning(`Failed to fetch Spiderum article ${entry.link}: ${errorMessage(error)}`);
    }
  }

  if (articles.length === 0) {
    throw new Error('No Spiderum article detail pages were fetched successfully.');
  }

  const allowedArticles = articles.filter(isAllowedArticle);
  return (allowedArticles.length > 0 ? allowedArticles : articles)
    .sort(sortByNewest)
    .slice(0, MAX_ARTICLES);
}

async function fetchTxnamArticles() {
  let homepageHtml = '';
  try {
    homepageHtml = await fetchHtml(TXNAM_SOURCE_URL);
  } catch (error) {
    logWarning(`Skipping txnam source ${TXNAM_SOURCE_URL}: ${errorMessage(error)}`);
    return [];
  }

  const entries = extractTxnamListEntries(homepageHtml);
  if (entries.length === 0) {
    logWarning('No txnam articles found on the homepage.');
    return [];
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
        publishedAt: entry.publishedAt || normalizePublishedAt(entry.date),
        readTime: extracted.readTime,
        excerpt: (entry.excerpt || extracted.excerpt || '').slice(0, 220).trim() + ((entry.excerpt || extracted.excerpt || '').length > 220 ? '...' : ''),
        content: extracted.content,
        tags: extracted.tags,
        link: entry.link,
        source: 'txnam',
      });
    } catch (error) {
      logWarning(`Failed to fetch txnam article ${entry.link}: ${errorMessage(error)}`);
    }
  }

  return articles;
}

async function main() {
  let existingArticles = [];
  try {
    existingArticles = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
  } catch {
    existingArticles = [];
  }

  const spiderumArticles = await fetchSpiderumArticles();
  const freshTxnamArticles = await fetchTxnamArticles();
  const existingSpiderumArticles = existingArticles.filter((article) => article?.source === 'spiderum' && typeof article.link === 'string');
  const existingTxnamArticles = existingArticles.filter((article) => article?.source === 'txnam' && typeof article.link === 'string');
  const txnamArticles = freshTxnamArticles.length > 0
    ? freshTxnamArticles
    : existingTxnamArticles.map((article) => ({
        ...article,
        content: readStoredArticleContent(article),
        source: 'txnam',
      }));

  if (freshTxnamArticles.length === 0 && existingTxnamArticles.length > 0) {
    logWarning(`Keeping ${existingTxnamArticles.length} stored txnam articles because no fresh txnam articles were fetched.`);
  }

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
  spiderumArchive.sort(sortByNewest);

  const spiderumLimit = Math.max(0, TOTAL_ARTICLE_LIMIT - txnamArticles.length);
  const mergedArticles = [...spiderumArchive.slice(0, spiderumLimit), ...txnamArticles]
    .sort(sortByNewest)
    .slice(0, TOTAL_ARTICLE_LIMIT);
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
  writeFetchStatus({
    status: 'success',
    message: 'Article archive refreshed.',
    sourceUrls: {
      spiderum: SOURCE_URLS,
      txnam: TXNAM_SOURCE_URL,
    },
    counts: {
      spiderumFetched: spiderumArticles.length,
      spiderumStored: Math.min(spiderumArchive.length, spiderumLimit),
      txnamFresh: freshTxnamArticles.length,
      txnamStored: txnamArticles.length,
      totalStored: mergedArticles.length,
    },
  });
  console.log(`Saved ${Math.min(spiderumArchive.length, spiderumLimit)} Spiderum articles and ${txnamArticles.length} txnam articles.`);
}

main().catch((error) => {
  console.error(error);
  try {
    writeFetchStatus({
      status: 'failure',
      message: errorMessage(error),
      sourceUrls: {
        spiderum: SOURCE_URLS,
        txnam: TXNAM_SOURCE_URL,
      },
      counts: {
        totalStored: 0,
      },
    });
  } catch (statusError) {
    console.error(`Failed to write fetch status: ${errorMessage(statusError)}`);
  }
  process.exitCode = 1;
});
