const { Marked } = require('marked');

const CONTACT_ORDER = ['email', 'phone', 'location', 'linkedin', 'wechat'];

function splitMarkdown(mdContent) {
  const mdLines = mdContent.split('\n');
  const headerLines = [];
  const bodyLines = [];
  let isBody = false;

  for (const line of mdLines) {
    if (line.startsWith('## ')) isBody = true;
    if (isBody) bodyLines.push(line);
    else headerLines.push(line);
  }

  return { headerLines, bodyLines };
}

function parseHeader(headerLines) {
  let name = '';
  let title = '';
  const contactInfo = [];

  for (let line of headerLines) {
    line = line.trim();
    if (line.startsWith('# ')) {
      name = line.substring(2);
    } else if (line.startsWith('**') && line.includes('|')) {
      const parts = line.split('|').map(s => s.trim());
      title = parts[0].replace(/\*\*/g, '');
      const linkedin = parts.find(p => p.includes('linkedin.com'));
      if (linkedin) {
        contactInfo.push({ type: 'linkedin', value: linkedin.replace('https://www.', '') });
      }
      const location = parts[parts.length - 1];
      if (!location.includes('linkedin.com')) {
        contactInfo.push({ type: 'location', value: location });
      }
    } else if (line.includes('Phone:') || line.includes('Email:')) {
      const parts = line.split('·').map(s => s.trim());
      for (const p of parts) {
        if (p.includes('Phone:')) contactInfo.push({ type: 'phone', value: p.replace('Phone:', '').trim() });
        if (p.includes('WeChat:')) contactInfo.push({ type: 'wechat', value: p.trim() });
        if (p.includes('Email:')) contactInfo.push({ type: 'email', value: p.replace('Email:', '').trim() });
      }
    }
  }

  contactInfo.sort((a, b) => CONTACT_ORDER.indexOf(a.type) - CONTACT_ORDER.indexOf(b.type));
  return { name, title, contactInfo };
}

function extractDateLocPairs(bodyLines) {
  const pairs = [];
  for (const line of bodyLines) {
    const trimmed = line.trim();
    if (/^\*[^*]+\*$/.test(trimmed) && trimmed.includes('·')) {
      const rawText = trimmed.slice(1, -1);
      const parts = rawText.split('·').map(s => s.trim());
      pairs.push({ date: parts[0], location: parts[1] || '' });
    }
  }
  return pairs;
}

function parseBody(bodyLines) {
  const dateLocPairs = extractDateLocPairs(bodyLines);
  let dateLocIndex = 0;
  let inJob = false;
  let inSection = false;

  const renderer = {
    heading(token) {
      const text = this.parser.parseInline(token.tokens);
      const level = token.depth;

      if (level === 2) {
        let res = '';
        if (inJob) { res += '</div>\n'; inJob = false; }
        if (inSection) { res += '</div>\n'; }
        inSection = true;
        return res + `<div class="section">\n  <div class="section-title">${text}</div>\n`;
      }

      if (level === 3) {
        let res = '';
        if (inJob) { res += '</div>\n'; }
        inJob = true;
        let parts = text.split('—').map(s => s.trim());
        if (parts.length === 1) parts = text.split('-').map(s => s.trim());
        const company = parts[0];
        const jobTitle = parts.slice(1).join(' - ') || '';
        const dateLoc = dateLocPairs[dateLocIndex++] || { date: '', location: '' };

        res += `<div class="job">\n`;
        res += `  <div class="job-header">\n`;
        res += `    <div class="job-company">${company}</div>\n`;
        res += `    <div class="job-location">${dateLoc.location}</div>\n`;
        res += `  </div>\n`;
        res += `  <div class="job-header">\n`;
        res += `    <div class="job-title">${jobTitle}</div>\n`;
        res += `    <div class="job-date">${dateLoc.date}</div>\n`;
        res += `  </div>\n`;
        return res;
      }

      return `<h${level}>${text}</h${level}>\n`;
    },

    paragraph(token) {
      const text = this.parser.parseInline(token.tokens);
      if (text.startsWith('<em>') && text.endsWith('</em>') && text.includes('·')) {
        return '';
      }
      return `<p>${text}</p>\n`;
    },

    listitem(token) {
      let innerText = this.parser.parse(token.tokens).trim();
      if (innerText.startsWith('<p>') && innerText.endsWith('</p>')) {
        innerText = innerText.substring(3, innerText.length - 4);
      }

      if (innerText.includes('</strong> — ') || innerText.includes('</strong> - ')) {
        const regex = /<strong>(.*?)<\/strong> [—-] (.*?) <em>\((.*?)\)<\/em>/;
        const match = innerText.match(regex);
        if (match) {
          let res = `<li class="education-item">\n`;
          res += `  <div class="job-header">\n`;
          res += `    <div class="job-company">${match[1]}</div>\n`;
          res += `    <div class="job-location"></div>\n`;
          res += `  </div>\n`;
          res += `  <div class="job-header">\n`;
          res += `    <div class="job-title">${match[2]}</div>\n`;
          res += `    <div class="job-date">${match[3]}</div>\n`;
          res += `  </div>\n`;
          res += `</li>\n`;
          return res;
        }
      }

      return `<li>${innerText}</li>\n`;
    }
  };

  const markedInstance = new Marked({ renderer });
  let bodyHtml = markedInstance.parse(bodyLines.join('\n'));
  if (inJob) bodyHtml += '</div>\n';
  if (inSection) bodyHtml += '</div>\n';

  return bodyHtml;
}

module.exports = { splitMarkdown, parseHeader, parseBody };
