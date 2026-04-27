const Parser = require('rss-parser');
const fs = require('fs');
const parser = new Parser();
const cheerio = require('cheerio');

(async () => {
  try {
    let feed = await parser.parseURL('https://txnam.net/feed/');
    
    // We will scrape full articles here
    const articles = [];

    for (let index = 0; index < feed.items.length; index++) {
      const item = feed.items[index];
      console.log(`Fetching full content for: ${item.title}`);
      
      let fullContent = item['content:encoded'] || item.content;
      
      try {
        const response = await fetch(item.link);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Find the article body
        const entryContent = $('.post-body');
        if (entryContent.length > 0) {
            // Clean up some stuff we don't want (like shared buttons, etc.)
            entryContent.find('.sharedaddy, .jp-relatedposts').remove();
            
            // Fix lazy loaded images: WordPress plugins often put the real URL in data-src or data-orig-file
            entryContent.find('img').each((i, el) => {
              const dataSrc = $(el).attr('data-src');
              const dataOrigFile = $(el).attr('data-orig-file');
              const realSrc = dataSrc || dataOrigFile;
              if (realSrc) {
                $(el).attr('src', realSrc);
              }
              // Remove explicit widths/heights so images scale correctly on mobile
              $(el).removeAttr('width');
              $(el).removeAttr('height');
              $(el).removeAttr('data-lazyloaded');
              $(el).removeAttr('srcset');
              $(el).removeAttr('data-srcset');
            });

            fullContent = entryContent.html();
        }
      } catch (err) {
        console.error(`Failed to fetch HTML for ${item.link}:`, err.message);
      }

      // Calculate a rough reading time based on content length
      const wordCount = fullContent ? fullContent.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
      const readTime = Math.ceil(wordCount / 200) || 3;
      
      const dateObj = new Date(item.pubDate);
      const dateString = dateObj.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });

      // Create a clean excerpt
      const excerpt = (item.contentSnippet || "").substring(0, 150) + "...";

      articles.push({
        id: index.toString(),
        title: item.title,
        date: dateString,
        readTime: `${readTime} min read`,
        excerpt: excerpt,
        content: fullContent, // HTML content
        tags: item.categories || ['Reflections'],
        link: item.link
      });
    }

    fs.writeFileSync('./src/data/articles.json', JSON.stringify(articles, null, 2));
    console.log(`Successfully fetched ${articles.length} full articles from txnam.net`);
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
})();
