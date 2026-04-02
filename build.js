const fs = require('fs');
const path = require('path');
const { splitMarkdown, parseHeader, parseBody } = require('./lib/parser');
const { buildHeaderHtml, buildFullHtml } = require('./lib/html');
const { exportPdf } = require('./lib/pdf');

const args = process.argv.slice(2);
const mdFile = args[0] || 'template.md';
const mdPath = path.resolve(mdFile);
const baseName = path.basename(mdFile, '.md');
const pdfFile = args[1] || `${baseName}.pdf`;
const pdfPath = path.resolve(pdfFile);
const htmlPath = path.join(path.dirname(mdPath), 'resume.html');
const cssPath = path.join(__dirname, 'styles.css');

if (!fs.existsSync(mdPath)) {
  console.error(`Error: Markdown file not found: ${mdPath}`);
  process.exit(1);
}

if (!fs.existsSync(cssPath)) {
  console.error(`Error: styles.css not found: ${cssPath}`);
  process.exit(1);
}

const md = fs.readFileSync(mdPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

const { headerLines, bodyLines } = splitMarkdown(md);
const header = parseHeader(headerLines);
const headerHtml = buildHeaderHtml(header);
const bodyHtml = parseBody(bodyLines);
const finalHtml = buildFullHtml(headerHtml, bodyHtml, css);

fs.writeFileSync(htmlPath, finalHtml);
console.log(`resume.html updated from ${mdFile}`);

(async () => {
  try {
    await exportPdf(htmlPath, pdfPath);
    console.log(`PDF generated: ${pdfFile}`);
  } catch (err) {
    console.error('PDF generation failed:', err.message);
    process.exit(1);
  }
})();
