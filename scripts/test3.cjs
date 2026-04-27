const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');

(async () => {
  try {
    let feed = await parser.parseURL('https://txnam.net/feed/');
    const item = feed.items[0];
    console.log("Link:", item.link);
    const response = await fetch(item.link, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const html = await response.text();
    fs.writeFileSync('temp2.html', html);
    console.log("Saved to temp2.html");
  } catch (error) {
    console.error(error);
  }
})();
