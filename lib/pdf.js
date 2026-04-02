const puppeteer = require('puppeteer');

async function exportPdf(htmlPath, outputPath) {
  const executablePath = process.env.CHROME_PATH || undefined;
  const browser = await puppeteer.launch({
    ...(executablePath && { executablePath }),
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
