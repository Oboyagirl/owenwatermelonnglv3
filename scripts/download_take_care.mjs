import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MUSIC_DIR = path.resolve('public/music');
if (!fs.existsSync(MUSIC_DIR)) {
  fs.mkdirSync(MUSIC_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadAndTranscode(url, targetFilename) {
  const targetPath = path.join(MUSIC_DIR, targetFilename);
  if (fs.existsSync(targetPath)) {
    console.log(`[EXISTS] ${targetFilename}`);
    return targetPath;
  }

  const tempRaw = path.join('/tmp', `raw_${Date.now()}_${Math.random().toString(36).substring(7)}.tmp`);
  try {
    console.log(`[DOWNLOADING] ${targetFilename} from ${url}`);
    let res;
    for (let retry = 0; retry < 3; retry++) {
      try {
        res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': '*/*'
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(35000)
        });
        if (res.ok) break;
        console.warn(`[RETRY ${retry + 1}] HTTP ${res.status}`);
        await sleep(1500 * (retry + 1));
      } catch (e) {
        console.warn(`[RETRY ${retry + 1}] Fetch error: ${e.message}`);
        await sleep(1500 * (retry + 1));
      }
    }

    if (!res || !res.ok) {
      console.warn(`[HTTP ERROR] Failed to fetch ${targetFilename}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(tempRaw, Buffer.from(arrayBuffer));

    console.log(`[TRANSCODING] ${targetFilename} with ffmpeg to 128k 44.1kHz stereo MP3...`);
    execSync(`ffmpeg -y -v error -i "${tempRaw}" -vn -c:a libmp3lame -b:a 128k -ar 44100 -ac 2 "${targetPath}"`);
    console.log(`[DONE] Created ${targetFilename} (${fs.statSync(targetPath).size} bytes)`);
    await sleep(400); // polite pause between downloads
    return targetPath;
  } catch (err) {
    console.warn(`[FAILED] ${targetFilename}: ${err.message}`);
    return null;
  } finally {
    try {
      if (fs.existsSync(tempRaw)) fs.unlinkSync(tempRaw);
    } catch {}
  }
}

// Drake - Take Care (Validated working archive.org paths)
const TAKE_CARE_TRACKS = [
  {
    url: "https://archive.org/download/take-care-drake_202609/01.%20Over%20My%20Dead%20Body.mp3",
    file: "drake_take_care_01_over_my_dead_body.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/02.%20Shot%20For%20Me.mp3",
    file: "drake_take_care_02_shot_for_me.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/03.%20Headlines.mp3",
    file: "drake_take_care_03_headlines.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/04.%20Crew%20Love%20(Feat.%20The%20Weekend).mp3",
    file: "drake_take_care_04_crew_love.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/05.%20Take%20Care%20(Feat.%20Rihanna).mp3",
    file: "drake_take_care_05_take_care.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/06.%20Marvins%20Room%20-%20Buried%20Alive%20(Interlude)%20(Feat.%20Kendrick%20Lamar).mp3",
    file: "drake_take_care_06_marvins_room.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/06.%20Marvins%20Room%20-%20Buried%20Alive%20(Interlude)%20(Feat.%20Kendrick%20Lamar).mp3",
    file: "drake_take_care_07_buried_alive.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/07.%20Under%20Gound%20Kings.mp3",
    file: "drake_take_care_08_under_ground_kings.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/08.%20Well%20Be%20Fine%20(Feat.%20Birdman).mp3",
    file: "drake_take_care_09_well_be_fine.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/09.%20Make%20Me%20Proud%20(Feat.%20Nicki%20Minaj).mp3",
    file: "drake_take_care_10_make_me_proud.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/10.%20Lord%20Knows%20(Feat.%20Rick%20Ross).mp3",
    file: "drake_take_care_11_lord_knows.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/11.%20Cameras%20-%20Good%20Ones%20Go%20(Interlude).mp3",
    file: "drake_take_care_12_cameras_good_ones_go.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/12.%20Doing%20It%20Wrong.mp3",
    file: "drake_take_care_13_doing_it_wrong.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/13.%20The%20Real%20Her%20(Feat.%20Lil%20Wayne%20%26%20Andre%CC%81%203000).mp3",
    file: "drake_take_care_14_the_real_her.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/14.%20Look%20What%20You%E2%80%99ve%20Done..mp3",
    file: "drake_take_care_15_look_what_youve_done.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/15.%20HYFR%20(Hell%20Ya%20Fucking%20Right)%20(Feat.%20Lil%20Wayne).mp3",
    file: "drake_take_care_16_hyfr.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/16.%20Practice.mp3",
    file: "drake_take_care_17_practice.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/17.%20The%20Ride.mp3",
    file: "drake_take_care_18_the_ride.mp3"
  }
];

async function main() {
  console.log(`Starting conversion for ${TAKE_CARE_TRACKS.length} Take Care songs...`);
  for (const item of TAKE_CARE_TRACKS) {
    await downloadAndTranscode(item.url, item.file);
  }
  console.log('Take Care conversion complete!');
}

main();
