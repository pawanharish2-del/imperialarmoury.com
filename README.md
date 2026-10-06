# imperialarmoury.com

Official website repository for **Imperial Armoury** (Imperial Auto Industries / IAPL) — precision defence, small arms, and ammunition manufacturing.

## Tech Stack & Architecture

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Smooth Scrolling:** Lenis Scroll Engine
- **Routing & SEO:** Directory-based clean URLs generated via custom Node.js script
- **Server:** Apache / LiteSpeed (`.htaccess`) with canonical 301 redirects, caching, and compression

## Project Structure

```
├── .htaccess            # Apache server configuration & SEO redirects
├── 404.html             # Error page
├── index.html           # Homepage
├── about.html           # About Us page
├── viper.html           # VIPER Small Arm product page
├── dsr-1.html           # DSR-1 Sniper Weapon System page
├── ammunition.html      # Ammunition catalogue page
├── contact.html         # Contact page
├── assets/              # Images, videos, fonts, and media assets
├── css/                 # Stylesheets
├── js/                  # JavaScript files
└── scripts/
    ├── setup-routes.js       # Static route generator for clean URLs
    └── generate-favicons.js  # Favicon generator
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
npm install
```

### Build & Generate Routes
To build the directory routes for clean URLs:
```bash
npm run build
```

### Image Optimization
```bash
npm run optimize-images
```
