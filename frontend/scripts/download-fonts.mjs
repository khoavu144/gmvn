import https from 'https';
import fs from 'fs';
import path from 'path';

const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap';
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');

if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

https.get(GOOGLE_FONTS_URL, { headers: { 'User-Agent': CHROME_UA } }, (res) => {
  let css = '';
  res.on('data', chunk => css += chunk);
  res.on('end', async () => {
    // Only keep vietnamese and latin ranges
    const fontFaces = css.split('@font-face').filter(Boolean);
    const selectedFaces = fontFaces.filter(face => face.includes('/* vietnamese */') || face.includes('/* latin */'));
    
    let localCss = '';
    
    for (const face of selectedFaces) {
      const urlMatch = face.match(/url\((.*?)\)/);
      if (urlMatch) {
        const fontUrl = urlMatch[1];
        const fileName = path.basename(fontUrl);
        const localPath = `/fonts/${fileName}`;
        
        // Download font file
        await new Promise((resolve, reject) => {
          const file = fs.createWriteStream(path.join(FONTS_DIR, fileName));
          https.get(fontUrl, (res2) => {
            res2.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
          }).on('error', reject);
        });
        
        // Replace URL in CSS
        const updatedFace = face.replace(fontUrl, localPath);
        localCss += `@font-face ${updatedFace}\n`;
      }
    }
    
    fs.writeFileSync(path.join(process.cwd(), 'src', 'fonts.css'), localCss);
    console.log('Fonts downloaded and src/fonts.css created successfully.');
  });
});
