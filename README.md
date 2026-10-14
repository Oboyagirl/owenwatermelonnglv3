# 🍉 Owen Watermelon V3

A high-performance unblocked games arcade hub, web unblocker proxy, tab cloaker, and offline MP3 music streaming player. Built with React 19, TypeScript, Tailwind CSS, and Vite.

---

## ⚡ Quick Deployment to GitHub Pages

This repository includes automated **GitHub Actions** workflows configured to build and deploy the application to **GitHub Pages** with zero configuration required.

### 1-Click Setup:
1. Push or fork this repository to your GitHub account.
2. In your GitHub repository, click **Settings** &rarr; **Pages** (under Code and automation).
3. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions**.
4. The `.github/workflows/deploy.yml` workflow will automatically run, build the static site into `dist/`, and publish it to `https://<your-username>.github.io/<repo-name>/`.

---

## 🎮 Features & School Filter Bypass

- **Passcode Protection**: Access-gated with secure entry code (`owenpan2244`).
- **Comprehensive Game Catalog**: Play hundreds of unblocked games including Granny, FNAF, Slope, Retro Bowl, Subway Surfers, Basket Random, and more.
- **Web Unblocker Proxy (GitHub Pages Safe)**:
  - **Google Web Relay**: Built-in mirror that strips `X-Frame-Options` and bypasses Securly & GoGuardian filters without white screens.
  - **about:blank Cloak**: Launch any web page or unblocked site in an `about:blank` stealth tab disguised as **Google Docs** (immune to school Chrome extension tracking).
  - **CodeTabs & Wayback Machine Mirrors**: Additional high-compatibility fallback relays.
  - **Node.js Streaming Proxy**: High-speed proxy available when running with `npm run dev` or deployed to a full-stack host.
- **Offline & Bundled MP3 Music Player**:
  - 24 popular built-in MP3 tracks and album artworks from Tyler, The Creator, Alex G, Kanye West, Drake, Kendrick Lamar, Frank Ocean, Steve Lacy, Travis Scott, The Weeknd, and Billie Eilish.
  - Fully compatible with GitHub Pages subdirectory hosting via relative asset resolution.
  - Local MP3 uploader to load your own downloaded music files directly into memory.
- **Tab Cloaker & Camouflage**: Instantly disguise browser tabs with realistic educational presets (Google Classroom, Google Drive, Canvas) and custom titles.
- **Emergency Panic Button**: Press `Esc` or click the panic button anywhere on the site for an immediate, trace-free redirect.
- **Customizable Catalog**: Import and export custom `games.json` library configurations.

---

## 💻 Local Development

To run locally with the full-stack Express web proxy server:

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack dev server (port 3000)
npm run dev

# 3. Build static production bundle for GitHub Pages
npm run build
```

---

## 🔑 Default Passcode
- **Entry Code**: `owenpan2244`
