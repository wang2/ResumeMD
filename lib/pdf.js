const fs = require('fs');
const puppeteer = require('puppeteer');

const CHROME_PATHS = [
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  // Windows (common paths)
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    'Chrome not found. Install Google Chrome or set CHROME_PATH environment variable.\n' +
    'On macOS: CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"'
  );
}

async function exportPdf(htmlPath, outputPath) {
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
  });

  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
    });
  } finally {
    await browser.close();
  }
}

module.exports = { exportPdf };
