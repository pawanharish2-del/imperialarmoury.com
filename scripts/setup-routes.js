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

function normalizeHtmlForDepth(content, depth) {
  const prefix = depth === 0 ? '' : depth === 1 ? '../' : '../../';
  const homeLink = `${prefix}index.html`;
  const aboutLink = `${prefix}about.html`;
  const contactLink = `${prefix}contact.html`;
  const ammoLink = `${prefix}ammunition.html`;
  const viperLink = `${prefix}viper.html`;
  const dsr1Link = `${prefix}dsr-1.html`;
  const notFoundLink = `${prefix}404.html`;

  let modified = content;

  // 1. Fix header duplicate closing </div> if present (line 88-89 bug)
  modified = modified.replace(
    /(<button class="mobile-menu-toggle"[^>]*>[\s\S]*?<\/button>\s*<\/div>)\s*<\/div>(\s*<div class="mega-menus-wrapper")/g,
    '$1$2'
  );

  // 2. Favicons & manifest
  modified = modified.replace(/href="(?:\.\.\/|\/|\.\/)*favicon\.ico"/g, `href="${prefix}favicon.ico"`);
  modified = modified.replace(/href="(?:\.\.\/|\/|\.\/)*site\.webmanifest"/g, `href="${prefix}site.webmanifest"`);

  // 3. Assets (images, icons, video, manifest icons)
  modified = modified.replace(/(href|src)="(?:\.\.\/|\/|\.\/)*assets\//g, `$1="${prefix}assets/`);
  modified = modified.replace(/url\(['"]?(?:\.\.\/|\/|\.\/)*assets\//g, (match) => {
    if (match.includes("'")) return `url('${prefix}assets/`;
    if (match.includes('"')) return `url("${prefix}assets/`;
    return `url(${prefix}assets/`;
  });

  // 4. CSS (remove cache bust query string to avoid issues with local file protocol)
  modified = modified.replace(/href="(?:\.\.\/|\/|\.\/)*css\/style\.css(?:\?v=[^"]*)?"/g, `href="${prefix}css/style.css"`);

  // 5. JS references
  modified = modified.replace(/src="(?:\.\.\/|\/|\.\/)*js\//g, `src="${prefix}js/`);

  // 6. Navigation links (directly to HTML files to prevent browser folder indexing in file:// protocol)
  // Logo link
  modified = modified.replace(/<div class="logo">\s*<a href="[^"]*">/g, `<div class="logo">\n                <a href="${homeLink}">`);

  // Desktop Navbar Links
  // Home
  modified = modified.replace(/<li class="nav-item(?:\s+active)?">\s*<a href="[^"]*">HOME<\/a>/g, (m) => {
    const isActive = m.includes('active');
    return `<li class="nav-item${isActive ? ' active' : ''}">\n                        <a href="${homeLink}">HOME</a>`;
  });

  // About Us
  modified = modified.replace(/<li class="nav-item(?:\s+active)?">\s*<a href="[^"]*">ABOUT US<\/a>/g, (m) => {
    const isActive = m.includes('active');
    return `<li class="nav-item${isActive ? ' active' : ''}">\n                        <a href="${aboutLink}">ABOUT US</a>`;
  });

  // Weapons (Navbar top item)
  modified = modified.replace(/<li class="nav-item has-mega-menu(?:\s+active)?"\s+data-target="weapons-menu">\s*<a href="[^"]*">WEAPONS<\/a>/g, (m) => {
    const isActive = m.includes('active');
    return `<li class="nav-item has-mega-menu${isActive ? ' active' : ''}" data-target="weapons-menu">\n                        <a href="${viperLink}">WEAPONS</a>`;
  });

  // Ammunition
  modified = modified.replace(/<li class="nav-item(?:\s+active)?">\s*<a href="[^"]*">AMMUNITION<\/a>/g, (m) => {
    const isActive = m.includes('active');
    return `<li class="nav-item${isActive ? ' active' : ''}">\n                        <a href="${ammoLink}">AMMUNITION</a>`;
  });

  // Contact Us
  modified = modified.replace(/<li class="nav-item(?:\s+active)?">\s*<a href="[^"]*">CONTACT US<\/a>/g, (m) => {
    const isActive = m.includes('active');
    return `<li class="nav-item${isActive ? ' active' : ''}">\n                        <a href="${contactLink}">CONTACT US</a>`;
  });

  // Mega Menu Links (inside weapons mega menu)
  modified = modified.replace(/<a href="[^"]*"\s+class="weapon-nav-column">([\s\S]*?<h3 class="weapon-nav-title">Modern Rifle<\/h3>)/g, `<a href="${dsr1Link}" class="weapon-nav-column">$1`);
  modified = modified.replace(/<a href="[^"]*"\s+class="weapon-nav-column">([\s\S]*?<h3 class="weapon-nav-title">Small Arms<\/h3>)/g, `<a href="${viperLink}" class="weapon-nav-column">$1`);

  // Mobile Drawer Menu Links
  // Mobile Home
  modified = modified.replace(/<li class="mobile-nav-item(?:\s+active)?">\s*<a href="[^"]*"\s+class="mobile-nav-link(?:\s+active)?">HOME<\/a>/g, (m) => {
    const isActive = m.includes('active');
    return `<li class="mobile-nav-item${isActive ? ' active' : ''}">\n                    <a href="${homeLink}" class="mobile-nav-link${isActive ? ' active' : ''}">HOME</a>`;
  });

  // Mobile About Us
  modified = modified.replace(/<li class="mobile-nav-item(?:\s+active)?">\s*<a href="[^"]*"\s+class="mobile-nav-link(?:\s+active)?">ABOUT US<\/a>/g, (m) => {
    const isActive = m.includes('active');
    return `<li class="mobile-nav-item${isActive ? ' active' : ''}">\n                    <a href="${aboutLink}" class="mobile-nav-link${isActive ? ' active' : ''}">ABOUT US</a>`;
  });

  // Mobile Weapons
  modified = modified.replace(/<a href="[^"]*"\s+class="mobile-nav-link">\s*<span>WEAPONS<\/span>/g, `<a href="${viperLink}" class="mobile-nav-link">\n                        <span>WEAPONS</span>`);
  modified = modified.replace(/<a href="[^"]*">MODERN DSR-1<\/a>/g, `<a href="${dsr1Link}">MODERN DSR-1</a>`);
  modified = modified.replace(/<a href="[^"]*">SMALL ARMS \(VIPER\)<\/a>/g, `<a href="${viperLink}">SMALL ARMS (VIPER)</a>`);

  // Mobile Ammunition
  modified = modified.replace(/<li class="mobile-nav-item(?:\s+active)?">\s*<a href="[^"]*"\s+class="mobile-nav-link(?:\s+active)?">AMMUNITION<\/a>/g, (m) => {
    const isActive = m.includes('active');
    return `<li class="mobile-nav-item${isActive ? ' active' : ''}">\n                    <a href="${ammoLink}" class="mobile-nav-link${isActive ? ' active' : ''}">AMMUNITION</a>`;
  });

  // Mobile Contact Us
  modified = modified.replace(/<li class="mobile-nav-item(?:\s+active)?">\s*<a href="[^"]*"\s+class="mobile-nav-link(?:\s+active)?">CONTACT US<\/a>/g, (m) => {
    const isActive = m.includes('active');
    return `<li class="mobile-nav-item${isActive ? ' active' : ''}">\n                    <a href="${contactLink}" class="mobile-nav-link${isActive ? ' active' : ''}">CONTACT US</a>`;
  });

  // Footer Links
  modified = modified.replace(/<li><a href="[^"]*">Home<\/a><\/li>/gi, `<li><a href="${homeLink}">Home</a></li>`);
  modified = modified.replace(/<li><a href="[^"]*">About Us<\/a><\/li>/gi, `<li><a href="${aboutLink}">About Us</a></li>`);
  modified = modified.replace(/<li><a href="[^"]*">Weapon<\/a><\/li>/gi, `<li><a href="${viperLink}">Weapon</a></li>`);
  modified = modified.replace(/<li><a href="[^"]*">Ammunition<\/a><\/li>/gi, `<li><a href="${ammoLink}">Ammunition</a></li>`);
  modified = modified.replace(/<li><a href="[^"]*">Contact Us<\/a><\/li>/gi, `<li><a href="${contactLink}">Contact Us</a></li>`);

  // Catch any remaining general page link references
  modified = modified.replace(/href="(?:\.\.\/|\/|\.\/)*(?:about-us\/?|about\.html|about\/?)"/g, `href="${aboutLink}"`);
  modified = modified.replace(/href="(?:\.\.\/|\/|\.\/)*(?:contact-us\/?|contact\.html|contact\/?)"/g, `href="${contactLink}"`);
  modified = modified.replace(/href="(?:\.\.\/|\/|\.\/)*(?:ammunition\/?|ammunition\.html)"/g, `href="${ammoLink}"`);
  modified = modified.replace(/href="(?:\.\.\/|\/|\.\/)*(?:viper\/?|viper\.html)"/g, `href="${viperLink}"`);
  modified = modified.replace(/href="(?:\.\.\/|\/|\.\/)*(?:dsr-1\/?|dsr-1\.html)"/g, `href="${dsr1Link}"`);
  modified = modified.replace(/href="(?:\.\.\/|\/|\.\/)*404\.html"/g, `href="${notFoundLink}"`);

  // Mega Menu Links (inside weapons mega menu: Modern Rifle -> DSR-1, Small Arms -> Viper)
  modified = modified.replace(
    /(<div class="weapons-nav-container">\s*)<a href="[^"]*"(\s+class="weapon-nav-column">)/g,
    `$1<a href="${dsr1Link}"$2`
  );
  modified = modified.replace(
    /(<\/a>\s*)<a href="[^"]*"(\s+class="weapon-nav-column">[\s\S]*?<img[^>]*alt="Small Arms")/g,
    `$1<a href="${viperLink}"$2`
  );

  return modified;
}

// 1. Normalize all root base HTML files (depth = 0)
for (const file of baseHtmlFiles) {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    let original = fs.readFileSync(filePath, 'utf8');
    let updated = normalizeHtmlForDepth(original, 0);

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
console.log('Normalized base HTML files with direct, fully functional HTML page links (depth 0).');

// Helper to adjust relative paths and canonical URL for nested route directories
function prepareHtmlForSubdirectory(htmlContent, canonicalUrl, depth) {
  let modified = normalizeHtmlForDepth(htmlContent, depth);

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

// Read updated base files
const aboutHtml = fs.readFileSync(path.join(rootDir, 'about.html'), 'utf8');
const contactHtml = fs.readFileSync(path.join(rootDir, 'contact.html'), 'utf8');
const ammunitionHtml = fs.readFileSync(path.join(rootDir, 'ammunition.html'), 'utf8');
const viperHtml = fs.readFileSync(path.join(rootDir, 'viper.html'), 'utf8');
const dsr1Html = fs.readFileSync(path.join(rootDir, 'dsr-1.html'), 'utf8');

const routes = [
  // 1. Contact Slugs
  { dir: 'contact-us', content: contactHtml, canonical: 'https://imperialarmoury.com/contact-us/', depth: 1 },
  { dir: 'contact', content: contactHtml, canonical: 'https://imperialarmoury.com/contact/', depth: 1 },

  // 2. About Slugs
  { dir: 'about-imperial-armoury', content: aboutHtml, canonical: 'https://imperialarmoury.com/about-imperial-armoury/', depth: 1 },
  { dir: 'about', content: aboutHtml, canonical: 'https://imperialarmoury.com/about/', depth: 1 },
  { dir: 'about-us', content: aboutHtml, canonical: 'https://imperialarmoury.com/about-us/', depth: 1 },

  // 3. Ammunition Slugs
  { dir: 'ammunition', content: ammunitionHtml, canonical: 'https://imperialarmoury.com/ammunition/', depth: 1 },

  // 4. Weapon Slugs
  { dir: 'weapon', content: viperHtml, canonical: 'https://imperialarmoury.com/weapon/', depth: 1 },
  { dir: 'weapons', content: viperHtml, canonical: 'https://imperialarmoury.com/weapons/', depth: 1 },
  { dir: 'weapon/viper-small-arm', content: viperHtml, canonical: 'https://imperialarmoury.com/weapon/viper-small-arm/', depth: 2 },
  { dir: 'weapon/viper', content: viperHtml, canonical: 'https://imperialarmoury.com/weapon/viper/', depth: 2 },
  { dir: 'weapon/modern-dsr-1', content: dsr1Html, canonical: 'https://imperialarmoury.com/weapon/modern-dsr-1/', depth: 2 },
  { dir: 'weapon/dsr-1', content: dsr1Html, canonical: 'https://imperialarmoury.com/weapon/dsr-1/', depth: 2 },
  { dir: 'viper', content: viperHtml, canonical: 'https://imperialarmoury.com/viper/', depth: 1 },
  { dir: 'dsr-1', content: dsr1Html, canonical: 'https://imperialarmoury.com/dsr-1/', depth: 1 }
];

for (const route of routes) {
  const targetDir = path.join(rootDir, route.dir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const processedHtml = prepareHtmlForSubdirectory(route.content, route.canonical, route.depth);
  fs.writeFileSync(path.join(targetDir, 'index.html'), processedHtml, 'utf8');
  console.log('Created route:', route.dir + '/index.html (depth ' + route.depth + ')');
}

console.log('All static directories and route files created successfully!');
