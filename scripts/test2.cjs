const fs = require('fs');

(async () => {
  try {
    const res = await fetch('https://txnam.net/2026/04/23-cam-xuc-con-nguoi-cam-nhan-qua-co-the/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const html = await res.text();
    fs.writeFileSync('temp.html', html);
    console.log("Saved to temp.html");
  } catch (err) {
    console.error(err);
  }
})();
