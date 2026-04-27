const cheerio = require('cheerio');

(async () => {
  try {
    const res = await fetch('https://txnam.net/2026/04/23-cam-xuc-con-nguoi-cam-nhan-qua-co-the/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    console.log("Length of .entry-content:", $('.entry-content').length);
    console.log("Length of .post-content:", $('.post-content').length);
    console.log("Length of article:", $('article').length);
    
    if ($('article').length > 0) {
      console.log("Classes of article:", $('article').attr('class'));
    }
  } catch (err) {
    console.error(err);
  }
})();
