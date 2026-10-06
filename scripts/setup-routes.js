const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const baseHtmlFiles = [
  'index.html',
  'about.html',
  'contact.html',
  'ammunition.html',
  'viper.html',
  'dsr-1.html',
  '404.html'
];

function normalizeHtml(content) {
  let modified = content;

  // 1. Favicons & manifest
  modified = modified.replace(/href="favicon\.ico"/g, 'href="/favicon.ico"');
  modified = modified.replace(/href="site\.webmanifest"/g, 'href="/site.webmanifest"');

  // 2. Assets (prevent double slashes)
  modified = modified.replace(/(href|src)="assets\//g, '$1="/assets/');
  modified = modified.replace(/url\(['"]?assets\//g, (match) => {
    if (match.includes("'")) return "url('/assets/";
    if (match.includes('"')) return 'url("/assets/';
    return 'url(/assets/';
  });

  // 3. CSS & JS references
  modified = modified.replace(/href="css\//g, 'href="/css/');
  modified = modified.replace(/src="js\//g, 'src="/js/');

  // 4. Logo link
  modified = modified.replace(/<div class="logo">\s*<a href="[^"]*">/g, '<div class="logo">\n                <a href="/">');

  // 5. Convert page links to clean URLs (no .html)
  // Home
  modified = modified.replace(/href="(\/index\.html|index\.html)"/g, 'href="/"');
  // About
  modified = modified.replace(/href="(\/about\.html|about\.html|\/about\/)"/g, 'href="/about-us/"');
  // Contact
  modified = modified.replace(/href="(\/contact\.html|contact\.html|\/contact\/)"/g, 'href="/contact-us/"');
  // Ammunition
  modified = modified.replace(/href="(\/ammunition\.html|ammunition\.html)"/g, 'href="/ammunition/"');
  // Viper / Weapon
  modified = modified.replace(/href="(\/viper\.html|viper\.html)"/g, 'href="/viper/"');
  // DSR-1
  modified = modified.replace(/href="(\/dsr-1\.html|dsr-1\.html)"/g, 'href="/dsr-1/"');
  // 404
  modified = modified.replace(/href="(\/404\.html|404\.html)"/g, 'href="/404.html"');

  // 6. Footer Weapon link
  modified = modified.replace(/href="(\/index\.html#weapons|index\.html#weapons)"/g, 'href="/viper/"');
  modified = modified.replace(/<li><a href="(\/index\.html|index\.html|\/)">Weapon<\/a><\/li>/gi, '<li><a href="/viper/">Weapon</a></li>');

  return modified;
}

// 1. Normalize all root base HTML files
for (const file of baseHtmlFiles) {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    let original = fs.readFileSync(filePath, 'utf8');
    let updated = normalizeHtml(original);

    // Update canonical on base files to clean URLs
    if (file === 'index.html') {
      updated = updated.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="https://imperialarmoury.com/">');
    } else if (file === 'about.html') {
      updated = updated.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="https://imperialarmoury.com/about-us/">');
    } else if (file === 'contact.html') {
      updated = updated.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="https://imperialarmoury.com/contact-us/">');
    } else if (file === 'ammunition.html') {
      updated = updated.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="https://imperialarmoury.com/ammunition/">');
    } else if (file === 'viper.html') {
      updated = updated.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="https://imperialarmoury.com/viper/">');
    } else if (file === 'dsr-1.html') {
      updated = updated.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="https://imperialarmoury.com/dsr-1/">');
    }

    fs.writeFileSync(filePath, updated, 'utf8');
  }
}
console.log('Normalized base HTML files to Clean URLs.');

// Helper to adjust relative paths and canonical URL for nested route directories
function prepareHtmlForSubdirectory(htmlContent, canonicalUrl) {
  let modified = normalizeHtml(htmlContent);

  // Update canonical URL if provided
  if (canonicalUrl) {
    if (modified.includes('<link rel="canonical"')) {
      modified = modified.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + canonicalUrl + '">');
    } else {
      modified = modified.replace('</head>', '    <link rel="canonical" href="' + canonicalUrl + '">\n</head>');
    }
  }
  
  return modified;
}

// Read base files
const aboutHtml = fs.readFileSync(path.join(rootDir, 'about.html'), 'utf8');
const contactHtml = fs.readFileSync(path.join(rootDir, 'contact.html'), 'utf8');
const ammunitionHtml = fs.readFileSync(path.join(rootDir, 'ammunition.html'), 'utf8');
const viperHtml = fs.readFileSync(path.join(rootDir, 'viper.html'), 'utf8');
const dsr1Html = fs.readFileSync(path.join(rootDir, 'dsr-1.html'), 'utf8');

const routes = [
  // 1. Contact Slugs
  { dir: 'contact-us', content: contactHtml, canonical: 'https://imperialarmoury.com/contact-us/' },
  { dir: 'contact', content: contactHtml, canonical: 'https://imperialarmoury.com/contact/' },

  // 2. About Slugs
  { dir: 'about-imperial-armoury', content: aboutHtml, canonical: 'https://imperialarmoury.com/about-imperial-armoury/' },
  { dir: 'about', content: aboutHtml, canonical: 'https://imperialarmoury.com/about/' },
  { dir: 'about-us', content: aboutHtml, canonical: 'https://imperialarmoury.com/about-us/' },

  // 3. Ammunition Slugs
  { dir: 'ammunition', content: ammunitionHtml, canonical: 'https://imperialarmoury.com/ammunition/' },

  // 4. Weapon Slugs
  { dir: 'weapon', content: viperHtml, canonical: 'https://imperialarmoury.com/weapon/' },
  { dir: 'weapons', content: viperHtml, canonical: 'https://imperialarmoury.com/weapons/' },
  { dir: 'weapon/viper-small-arm', content: viperHtml, canonical: 'https://imperialarmoury.com/weapon/viper-small-arm/' },
  { dir: 'weapon/viper', content: viperHtml, canonical: 'https://imperialarmoury.com/weapon/viper/' },
  { dir: 'weapon/modern-dsr-1', content: dsr1Html, canonical: 'https://imperialarmoury.com/weapon/modern-dsr-1/' },
  { dir: 'weapon/dsr-1', content: dsr1Html, canonical: 'https://imperialarmoury.com/weapon/dsr-1/' },
  { dir: 'viper', content: viperHtml, canonical: 'https://imperialarmoury.com/viper/' },
  { dir: 'dsr-1', content: dsr1Html, canonical: 'https://imperialarmoury.com/dsr-1/' }
];

for (const route of routes) {
  const targetDir = path.join(rootDir, route.dir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const processedHtml = prepareHtmlForSubdirectory(route.content, route.canonical);
  fs.writeFileSync(path.join(targetDir, 'index.html'), processedHtml, 'utf8');
  console.log('Created route:', route.dir + '/index.html');
}

console.log('All static directories and route files created successfully with Clean URLs!');
