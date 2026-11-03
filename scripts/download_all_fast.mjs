import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MUSIC_DIR = path.resolve('public/music');
const URLS_PATH = path.resolve('src/data/albumSourceUrls.json');

if (!fs.existsSync(MUSIC_DIR)) {
  fs.mkdirSync(MUSIC_DIR, { recursive: true });
}

const urlMap = JSON.parse(fs.readFileSync(URLS_PATH, 'utf8'));
const entries = Object.entries(urlMap);

console.log(`Starting fast download of ${entries.length} catalog songs...`);

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function downloadTrack([filename, url]) {
  const targetPath = path.join(MUSIC_DIR, filename);
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 100000) {
    return 'EXISTS';
  }

  const isMp3 = url.toLowerCase().includes('.mp3');
  const tempPath = path.join('/tmp', `dl_${Date.now()}_${Math.random().toString(36).substring(7)}.tmp`);

  try {
    let res;
    for (let retry = 0; retry < 3; retry++) {
      try {
        res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': '*/*'
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(30000)
        });
        if (res.ok) break;
        await sleep(500 * (retry + 1));
      } catch (err) {
        await sleep(500 * (retry + 1));
      }
    }

    if (!res || !res.ok) {
      console.warn(`[HTTP ${res ? res.status : 'ERR'}] ${filename}`);
      return 'FAILED';
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 50000) {
      console.warn(`[TOO SMALL] ${filename} (${buf.length} bytes)`);
      return 'FAILED';
    }

    if (isMp3) {
      fs.writeFileSync(targetPath, buf);
      console.log(`[DONE MP3] ${filename} (${buf.length} bytes)`);
      return 'DOWNLOADED';
    } else {
      fs.writeFileSync(tempPath, buf);
      execSync(`ffmpeg -y -v error -i "${tempPath}" -vn -c:a libmp3lame -b:a 128k -ar 44100 -ac 2 "${targetPath}"`);
      console.log(`[DONE TRANSCODED] ${filename} (${fs.statSync(targetPath).size} bytes)`);
      return 'TRANSCODED';
    }
  } catch (err) {
    console.warn(`[ERR] ${filename}:`, err.message);
    return 'FAILED';
  } finally {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {}
  }
}

async function main() {
  let doneCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const status = await downloadTrack(entry);
    if (status === 'EXISTS') skipCount++;
    else if (status === 'FAILED') failCount++;
    else doneCount++;

    if ((i + 1) % 15 === 0 || i === entries.length - 1) {
      console.log(`[PROGRESS] ${i + 1}/${entries.length} - ${doneCount} downloaded, ${skipCount} skipped, ${failCount} failed`);
    }
    // Small pause to be gentle on bandwidth
    await sleep(50);
  }

  console.log('\n========================================');
  console.log(`COMPLETED: ${doneCount} downloaded, ${skipCount} already existed, ${failCount} failed`);
  console.log('========================================');
}

main().catch(console.error);
