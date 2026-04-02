# ResumeMD

A minimal Node.js tool that turns a single Markdown file into a print-ready PDF resume, styled with custom CSS and rendered via Puppeteer.

## Quick Start

```bash
npm install
npm run build                          # template.md -> template.pdf
node build.js my_resume.md             # -> my_resume.pdf
node build.js my_resume.md output.pdf  # custom output name
```

## How It Works

```
resume.md ──> build.js ──> resume.html ──> Puppeteer ──> resume.pdf
                 ^
            styles.css
```

1. Parse the Markdown into structured header and body sections
2. Render to HTML with inline SVG contact icons and semantic CSS classes
3. Inject `styles.css` as the stylesheet
4. Open the HTML in headless Chromium and export as A4 PDF

## Markdown Template

```markdown
# Full Name
**Job Title** | https://www.linkedin.com/in/handle | City, Country

Phone: +1 234 567 8900 · WeChat: handle · Email: name@example.com

## Summary
- First point.
- Second point.

## Experience
### Company — Role
*Start – End · City, Country*
- Bullet point.

## Education
- **University** — Degree *(Start – End)*
```

**Header**: `#` for name, `**Title** | URL | Location` pipe-separated, contact fields joined by `·`.

**Experience**: `###` heading with `Company — Role`, followed by `*Date · Location*` in italics.

**Education**: list items as `**School** — Degree *(Years)*`.

## Customization

Edit `styles.css` to tweak fonts, colors, spacing, or page margins. Changes take effect on the next build.

## Using a Custom Chrome

Puppeteer downloads its own Chromium by default. To use a local Chrome instead:

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node build.js
```

## Project Structure

```
├── build.js        Entry point
├── styles.css      Resume stylesheet
├── lib/
│   ├── parser.js   Markdown -> structured data
│   ├── html.js     Structured data -> HTML
│   └── pdf.js      HTML -> PDF (Puppeteer)
├── package.json
└── *.md            Resume source files
```

## Requirements

- Node.js >= 18
