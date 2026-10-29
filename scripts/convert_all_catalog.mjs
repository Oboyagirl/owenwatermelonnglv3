import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MUSIC_DIR = path.resolve('public/music');
const MUSIC_DATA_PATH = path.resolve('src/data/musicData.ts');

if (!fs.existsSync(MUSIC_DIR)) {
  fs.mkdirSync(MUSIC_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Download and convert single file using ffmpeg to 128k 44.1kHz stereo MP3
async function downloadAndTranscode(url, filename) {
  const targetPath = path.join(MUSIC_DIR, filename);
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 100000) {
    console.log(`[EXISTS] ${filename}`);
    return true;
  }

  const tempRaw = path.join('/tmp', `raw_${Date.now()}_${Math.random().toString(36).substring(7)}.tmp`);
  try {
    console.log(`[DOWNLOADING] ${filename} from ${url}`);
    let res;
    for (let retry = 0; retry < 3; retry++) {
      try {
        res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': '*/*'
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(45000)
        });
        if (res.ok) break;
        console.warn(`[RETRY ${retry + 1}] HTTP ${res.status} for ${filename}`);
        await sleep(1000 * (retry + 1));
      } catch (e) {
        console.warn(`[RETRY ${retry + 1}] Fetch error: ${e.message}`);
        await sleep(1000 * (retry + 1));
      }
    }

    if (!res || !res.ok) {
      console.warn(`[FAILED HTTP] ${res ? res.status : 'timeout'} for ${url}`);
      return false;
    }

    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(tempRaw, Buffer.from(arrayBuffer));

    console.log(`[TRANSCODING] ${filename} to 128k 44.1kHz stereo MP3...`);
    execSync(`ffmpeg -y -v error -i "${tempRaw}" -vn -c:a libmp3lame -b:a 128k -ar 44100 -ac 2 "${targetPath}"`);
    console.log(`[DONE] ${filename} (${fs.statSync(targetPath).size} bytes)`);
    await sleep(200);
    return true;
  } catch (err) {
    console.warn(`[FAILED TRANSCODE] ${filename}: ${err.message}`);
    return false;
  } finally {
    try {
      if (fs.existsSync(tempRaw)) fs.unlinkSync(tempRaw);
    } catch {}
  }
}

// Function to update a track in src/data/musicData.ts
function updateTrackInCatalog(trackId, localFile) {
  let content = fs.readFileSync(MUSIC_DATA_PATH, 'utf8');
  const reg = new RegExp(`(\\{[\\s\\S]*?"id":\\s*"${trackId}"[\\s\\S]*?\\})`);
  const match = content.match(reg);
  if (match) {
    let block = match[1];
    block = block.replace(/"audioSrc":\s*"[^"]+"/, `"audioSrc": "${localFile}"`);
    if (block.includes('"hasLocalAudio"')) {
      block = block.replace(/"hasLocalAudio":\s*(true|false)/, `"hasLocalAudio": true`);
    } else {
      block = block.replace(/\n\s*\},?$/, `,\n    "hasLocalAudio": true\n  }`);
    }
    content = content.replace(match[1], block);
    fs.writeFileSync(MUSIC_DATA_PATH, content, 'utf8');
    console.log(`[CATALOG UPDATED] ${trackId} -> ${localFile}`);
    return true;
  }
  return false;
}

// Map each album to its Archive.org identifier and track resolution rule
const ALBUMS_PIPELINE = [
  // 1. Kanye West - Graduation
  {
    archiveId: 'kanyewestgraduation_202606',
    albumPrefix: 'kanye_graduation',
    tracksPrefix: 'album-graduation-track-',
    mapping: [
      { num: 1, file: '01 Good Morning.mp3' },
      { num: 2, file: '02 Champion.mp3' },
      { num: 3, file: '03 Stronger.mp3' },
      { num: 4, file: '04 I Wonder.mp3' },
      { num: 5, file: '05 Good Life.mp3' },
      { num: 6, file: "06 Can't Tell Me Nothing.mp3" },
      { num: 7, file: '07 Barry Bonds.mp3' },
      { num: 8, file: '09 Flashing Lights.mp3' },
      { num: 9, file: '10 Everything I Am.mp3' },
      { num: 10, file: '11 The Glory.mp3' },
      { num: 11, file: '12 Homecoming.mp3' },
      { num: 12, file: '13 Big Brother.mp3' },
      { num: 13, file: '08 Drunk And Hot Girls.mp3' }
    ]
  },
  // 2. Drake - Views
  {
    archiveId: 'views-by-drake',
    albumPrefix: 'drake_views',
    tracksPrefix: 'album-views-track-',
    mapping: [
      { num: 1, file: 'SpotiDownloader.com - Views/Keep The Family Close.mp3' },
      { num: 2, file: 'SpotiDownloader.com - Views/9.mp3' },
      { num: 3, file: 'SpotiDownloader.com - Views/U With Me_.mp3' },
      { num: 4, file: 'SpotiDownloader.com - Views/Feel No Ways.mp3' },
      { num: 5, file: 'SpotiDownloader.com - Views/Hype.mp3' },
      { num: 6, file: 'SpotiDownloader.com - Views/Weston Road Flows.mp3' },
      { num: 7, file: 'SpotiDownloader.com - Views/Redemption.mp3' },
      { num: 8, file: 'SpotiDownloader.com - Views/With You.mp3' },
      { num: 9, file: 'SpotiDownloader.com - Views/Faithful.mp3' },
      { num: 10, file: 'SpotiDownloader.com - Views/Still Here.mp3' },
      { num: 11, file: 'SpotiDownloader.com - Views/Controlla.mp3' },
      { num: 12, file: 'SpotiDownloader.com - Views/One Dance.mp3' },
      { num: 13, file: 'SpotiDownloader.com - Views/Grammys.mp3' },
      { num: 14, file: 'SpotiDownloader.com - Views/Childs Play.mp3' },
      { num: 15, file: 'SpotiDownloader.com - Views/Pop Style.mp3' },
      { num: 16, file: 'SpotiDownloader.com - Views/Too Good.mp3' },
      { num: 17, file: 'SpotiDownloader.com - Views/Summers Over Interlude.mp3' },
      { num: 18, file: 'SpotiDownloader.com - Views/Fire & Desire.mp3' },
      { num: 19, file: 'SpotiDownloader.com - Views/Views.mp3' },
      { num: 20, file: 'SpotiDownloader.com - Views/Hotline Bling.mp3' }
    ]
  },
  // 3. Drake - Certified Lover Boy
  {
    archiveId: 'certified-lover-boy-drake_202609',
    albumPrefix: 'drake_clb',
    tracksPrefix: 'album-clb-track-',
    mapping: [
      { num: 1, file: '01. Champagne Poetry.mp3' },
      { num: 2, file: '02. Papi’s Home.mp3' },
      { num: 3, file: '03. Girls Want Girls Ft. Lil Baby.mp3' },
      { num: 4, file: '04. In The Bible Ft. Lil Durk, GIVĒON.mp3' },
      { num: 5, file: '05. Love All Ft. JAŸ-Z.mp3' },
      { num: 6, file: '06. Fair Trade Ft. Travis Scott.mp3' },
      { num: 7, file: '07. Way 2 Sexy Ft. Future, Young Thug.mp3' },
      { num: 8, file: '08. TSU.mp3' },
      { num: 9, file: '09. N 2 Deep Ft. Future.mp3' },
      { num: 10, file: '10. Pipe Down.mp3' },
      { num: 11, file: '11. Yebba’s Heartbreak Ft. Yebba.mp3' },
      { num: 12, file: '12. No Friends In The Industry.mp3' },
      { num: 13, file: '13. Knife Talk Ft. 21 Savage, Project Pat.mp3' },
      { num: 14, file: '14. 7am On Bridle Path.mp3' },
      { num: 15, file: '15. Race My Mind.mp3' },
      { num: 16, file: '16. Fountains Ft. Tems.mp3' },
      { num: 17, file: '17. Get Along Better Ft. Ty Dolla $ign.mp3' },
      { num: 18, file: '18. You Only Live Twice Ft. Lil Wayne, Rick Ross.mp3' },
      { num: 19, file: '19. IMY2 Ft. Kid Cudi.mp3' },
      { num: 20, file: '20. Fucking Fans.mp3' },
      { num: 21, file: '21. The Remorse.mp3' }
    ]
  },
  // 4. Tyler, The Creator - CALL ME IF YOU GET LOST
  {
    archiveId: 'call-me-if-you-get-lost_20250821',
    albumPrefix: 'tyler_cmiygl',
    tracksPrefix: 'album-cmiygl-track-',
    mapping: [
      { num: 1, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/01 - SIR BAUDELAIRE feat. DJ Drama.mp3' },
      { num: 2, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/02 - CORSO.mp3' },
      { num: 3, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/03 - LEMONHEAD feat. 42 Dugg.mp3' },
      { num: 4, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/04 - WUSYANAME feat. YoungBoy Never Broke Again & Ty Dolla $ign.mp3' },
      { num: 5, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/05 - LUMBERJACK.mp3' },
      { num: 6, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/06 - HOT WIND BLOWS feat. Lil Wayne.mp3' },
      { num: 7, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/07 - MASSA.mp3' },
      { num: 8, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/08 - RUNITUP feat. Teezo Touchdown.mp3' },
      { num: 9, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/09 - MANIFESTO feat. Domo Genesis.mp3' },
      { num: 10, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/10 - SWEET _ I THOUGHT YOU WANTED TO DANCE feat. Brent Faiyaz & Fana Hues.mp3' },
      { num: 11, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/11 - MOMMA TALK.mp3' },
      { num: 12, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/12 - RISE! feat. DAISY WORLD.mp3' },
      { num: 13, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/21 - DOGTOOTH.mp3' },
      { num: 14, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/14 - JUGGERNAUT feat. Lil Uzi Vert & Pharrell Williams.mp3' },
      { num: 15, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/15 - WILSHIRE.mp3' },
      { num: 16, file: 'CALL ME IF YOU GET LOST_ The Estate Sale [Album]/16 - SAFARI.mp3' }
    ]
  },
  // 5. Travis Scott - ASTROWORLD
  {
    archiveId: 'travis-astroworld',
    albumPrefix: 'travis_astroworld',
    tracksPrefix: 'album-astroworld-track-',
    mapping: [
      { num: 1, file: 'STARGAZING.mp3' },
      { num: 2, file: 'CAROUSEL.mp3' },
      { num: 3, file: 'SICKO MODE.mp3' },
      { num: 4, file: 'R.I.P. SCREW.mp3' },
      { num: 5, file: 'STOP TRYING TO BE GOD.mp3' },
      { num: 6, file: 'NO BYSTANDERS.mp3' },
      { num: 7, file: 'SKELETONS.mp3' },
      { num: 8, file: 'WAKE UP.mp3' },
      { num: 9, file: '5% TINT.mp3' },
      { num: 10, file: 'NC-17.mp3' },
      { num: 11, file: 'ASTROTHUNDER.mp3' },
      { num: 12, file: 'YOSEMITE.mp3' },
      { num: 13, file: "CAN'T SAY.mp3" },
      { num: 14, file: 'WHO WHAT!.mp3' },
      { num: 15, file: 'BUTTERFLY EFFECT.mp3' },
      { num: 16, file: 'HOUSTONFORNICATION.mp3' },
      { num: 17, file: 'COFFEE BEAN.mp3' }
    ]
  },
  // 6. Travis Scott - UTOPIA
  {
    archiveId: 'utopia_202607',
    albumPrefix: 'travis_utopia',
    tracksPrefix: 'album-utopia-track-',
    mapping: [
      { num: 1, file: '01 - HYAENA [Explicit].mp3' },
      { num: 2, file: '02 - THANK GOD [Explicit].mp3' },
      { num: 3, file: '03 - MODERN JAM [Explicit].mp3' },
      { num: 4, file: '04 - MY EYES [Explicit].mp3' },
      { num: 5, file: "05 - GOD'S COUNTRY [Explicit].mp3" },
      { num: 6, file: '06 - SIRENS [Explicit].mp3' },
      { num: 7, file: '07 - MELTDOWN [Explicit].mp3' },
      { num: 8, file: '08 - FE!N [Explicit].mp3' },
      { num: 9, file: '09 - DELRESTO (ECHOES) [Explicit].mp3' },
      { num: 10, file: '10 - I KNOW ? [Explicit].mp3' },
      { num: 11, file: '11 - TOPIA TWINS [Explicit].mp3' },
      { num: 12, file: '12 - CIRCUS MAXIMUS [Explicit].mp3' },
      { num: 13, file: '13 - PARASAIL [Explicit].mp3' },
      { num: 14, file: '14 - SKITZO [Explicit].mp3' },
      { num: 15, file: '15 - LOST FOREVER [Explicit].mp3' },
      { num: 16, file: '16 - LOOOM [Explicit].mp3' },
      { num: 17, file: '17 - K-POP [Explicit].mp3' },
      { num: 18, file: '18 - TELEKINESIS [Explicit].mp3' },
      { num: 19, file: '19 - TIL FURTHER NOTICE [Explicit].mp3' }
    ]
  },
  // 7. Frank Ocean - Blonde
  {
    archiveId: '17FuturaFree_201703',
    albumPrefix: 'frank_blonde',
    tracksPrefix: 'album-blonde-track-',
    mapping: [
      { num: 1, file: '01 Nikes.mp3' },
      { num: 2, file: '02 Ivy.mp3' },
      { num: 3, file: '03 Pink + White.mp3' },
      { num: 4, file: '04 Be Yourself.mp3' },
      { num: 5, file: '05 Solo.mp3' },
      { num: 6, file: '06 Skyline To.mp3' },
      { num: 7, file: '07 Self Control.mp3' },
      { num: 8, file: '08 Good Guy.mp3' },
      { num: 9, file: '09 Nights.mp3' },
      { num: 10, file: '10 Solo (Reprise).mp3' },
      { num: 11, file: '11 Pretty Sweet.mp3' },
      { num: 12, file: '12 Facebook Story.mp3' },
      { num: 13, file: '13 Close to You.mp3' },
      { num: 14, file: '14 White Ferrari.mp3' },
      { num: 15, file: '15 Seigfried.mp3' },
      { num: 16, file: '16 Godspeed.mp3' },
      { num: 17, file: '17 Futura Free.mp3' }
    ]
  },
  // 8. Frank Ocean - Channel Orange
  {
    archiveId: 'gs_frank-ocean-channel-orange',
    albumPrefix: 'frank_channel_orange',
    tracksPrefix: 'album-channel-orange-track-',
    mapping: [
      { num: 1, file: '01 Start.mp3' },
      { num: 2, file: '02 Thinkin Bout You.mp3' },
      { num: 3, file: '03 Fertilizer.mp3' },
      { num: 4, file: '04 Sierra Leone.mp3' },
      { num: 5, file: '05 Sweet Life.mp3' },
      { num: 6, file: '06 Not Just Money.mp3' },
      { num: 7, file: '07 Super Rich Kids.mp3' },
      { num: 8, file: '08 Pilot Jones.mp3' },
      { num: 9, file: '09 Crack Rock.mp3' },
      { num: 10, file: '10 Pyramids.mp3' },
      { num: 11, file: '11 Lost.mp3' },
      { num: 12, file: '12 White.mp3' },
      { num: 13, file: '13 Monks.mp3' },
      { num: 14, file: '14 Bad Religion.mp3' },
      { num: 15, file: '15 Pink Matter.mp3' },
      { num: 16, file: '16 Forrest Gump.mp3' },
      { num: 17, file: '17 End.mp3' }
    ]
  },
  // 9. Steve Lacy - Gemini Rights
  {
    archiveId: '03.-steve-lacy-mercury',
    albumPrefix: 'steve_gemini',
    tracksPrefix: 'album-gemini-rights-track-',
    mapping: [
      { num: 1, file: '01. Steve Lacy - Static.mp3' },
      { num: 2, file: '02. Steve Lacy - Helmet.mp3' },
      { num: 3, file: '03. Steve Lacy - Mercury.mp3' },
      { num: 4, file: '04. Steve Lacy - Buttons.mp3' },
      { num: 5, file: '05. Steve Lacy - Bad Habit.mp3' },
      { num: 6, file: '06. Steve Lacy - 2Gether (Enterlude).mp3' },
      { num: 7, file: '07. Steve Lacy - Cody Freestyle.mp3' },
      { num: 8, file: '08. Steve Lacy - Amber.mp3' },
      { num: 9, file: '09. Steve Lacy - Sunshine.mp3' },
      { num: 10, file: '10. Steve Lacy - Give You the World.mp3' }
    ]
  },
  // 10. Steve Lacy - Steve Lacy's Demo
  {
    archiveId: '03-dark-red',
    albumPrefix: 'steve_demo',
    tracksPrefix: 'album-steve-demo-track-',
    mapping: [
      { num: 1, file: "Steve Lacy's Demo/01 Looks.mp3" },
      { num: 2, file: "Steve Lacy's Demo/02 Ryd.mp3" },
      { num: 3, file: "Steve Lacy's Demo/03 Dark Red.mp3" },
      { num: 4, file: "Steve Lacy's Demo/04 Thangs.mp3" },
      { num: 5, file: "Steve Lacy's Demo/05 Haterlovin.mp3" },
      { num: 6, file: "Steve Lacy's Demo/06 Some.mp3" }
    ]
  },
  // 11. The Weeknd - After Hours
  {
    archiveId: 'after-hours-the-weeknd_202609',
    albumPrefix: 'weeknd_after_hours',
    tracksPrefix: 'album-after-hours-track-',
    mapping: [
      { num: 1, file: '01. Alone Again.mp3' },
      { num: 2, file: '02. Too Late.mp3' },
      { num: 3, file: '03. Hardest To Love.mp3' },
      { num: 4, file: '04. Scared To Live.mp3' },
      { num: 5, file: '05. Snowchild.mp3' },
      { num: 6, file: '06. Escape From LA.mp3' },
      { num: 7, file: '07. Heartless.mp3' },
      { num: 8, file: '08. Faith.mp3' },
      { num: 9, file: '09. Blinding Lights.mp3' },
      { num: 10, file: '10. In Your Eyes.mp3' },
      { num: 11, file: '11. Save Your Tears.mp3' },
      { num: 12, file: '12. Repeat After Me (Interlude).mp3' },
      { num: 13, file: '13.  After Hours.mp3' },
      { num: 14, file: '14. Until I Bleed Out.mp3' }
    ]
  },
  // 12. The Weeknd - Starboy
  {
    archiveId: 'theweeknd-starboy_20190929_2201',
    albumPrefix: 'weeknd_starboy',
    tracksPrefix: 'album-starboy-track-',
    mapping: [
      { num: 1, file: 'Starboy/The Weeknd - Starboy (official) ft. Daft Punk.mp3' },
      { num: 2, file: 'Starboy/The Weeknd - Party Monster.mp3' },
      { num: 3, file: 'Starboy/The Weeknd - False Alarm.mp3' },
      { num: 4, file: 'Starboy/The Weeknd - Reminder.mp3' },
      { num: 5, file: 'Starboy/Rockin’.mp3' },
      { num: 6, file: 'Starboy/The Weeknd - Secrets.mp3' },
      { num: 7, file: 'Starboy/True Colors.mp3' },
      { num: 8, file: 'Starboy/Stargirl Interlude.mp3' },
      { num: 9, file: 'Starboy/The Weeknd - Sidewalks (Vevo Presents) ft. Kendrick Lamar.mp3' },
      { num: 10, file: 'Starboy/Six Feet Under.mp3' },
      { num: 11, file: 'Starboy/Love To Lay.mp3' },
      { num: 12, file: 'Starboy/A Lonely Night.mp3' },
      { num: 13, file: 'Starboy/Attention.mp3' },
      { num: 14, file: 'Starboy/Ordinary Life.mp3' },
      { num: 15, file: 'Starboy/Nothing Without You.mp3' },
      { num: 16, file: 'Starboy/All I Know.mp3' },
      { num: 17, file: 'Starboy/Die For You.mp3' },
      { num: 18, file: 'Starboy/The Weeknd - I Feel It Coming ft. Daft Punk.mp3' }
    ]
  },
  // 13. Billie Eilish - HIT ME HARD AND SOFT
  {
    archiveId: 'hit-me-hard-and-soft1',
    albumPrefix: 'billie_hit_me_hard',
    tracksPrefix: 'album-hit-me-hard-track-',
    mapping: [
      { num: 1, file: '01-SKINNY.mp3' },
      { num: 2, file: '02-LUNCH.mp3' },
      { num: 3, file: '03-CHIHIRO.mp3' },
      { num: 4, file: '04-BIRDS OF A FEATHER.mp3' },
      { num: 5, file: '05-WILDFLOWER.mp3' },
      { num: 6, file: '06-THE GREATEST.mp3' },
      { num: 7, file: "07-L'AMOUR DE MA VIE.mp3" },
      { num: 8, file: '08-THE DINER.mp3' },
      { num: 9, file: '09-BITTERSUITE.mp3' },
      { num: 10, file: '10-BLUE.mp3' }
    ]
  },
  // 14. Billie Eilish - WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?
  {
    archiveId: 'i-love-you_202610',
    albumPrefix: 'billie_when_we_all_fall',
    tracksPrefix: 'album-when-we-all-fall-track-',
    mapping: [
      { num: 1, file: '!!!!!!!.mp3' },
      { num: 2, file: 'Bad Guy.mp3' },
      { num: 3, file: 'Xanny.mp3' },
      { num: 4, file: 'You Should See Me In A Crown.mp3' },
      { num: 5, file: 'All The Good Girls Go To Hell.mp3' },
      { num: 6, file: 'Wish You Were Gay.mp3' },
      { num: 7, file: "When The Party's Over.mp3" },
      { num: 8, file: '8.mp3' },
      { num: 9, file: 'My Strange Addiction.mp3' },
      { num: 10, file: 'Bury A Friend.mp3' },
      { num: 11, file: 'Ilomilo.mp3' },
      { num: 12, file: 'Listen Before I Go.mp3' },
      { num: 13, file: 'I Love You.mp3' },
      { num: 14, file: 'Goodbye.mp3' }
    ]
  },
  // 15. Kendrick Lamar - DAMN.
  {
    archiveId: '12-fear_202604',
    albumPrefix: 'kendrick_damn',
    tracksPrefix: 'album-damn-track-',
    mapping: [
      { num: 1, file: '01 BLOOD.m4a' },
      { num: 2, file: '02 DNA.m4a' },
      { num: 3, file: '03 YAH.m4a' },
      { num: 4, file: '04 ELEMENT.m4a' },
      { num: 5, file: '05 FEEL.m4a' },
      { num: 6, file: '06 LOYALTY.m4a' },
      { num: 7, file: '07 PRIDE.m4a' },
      { num: 8, file: '08 HUMBLE.m4a' },
      { num: 9, file: '09 LUST.m4a' },
      { num: 10, file: '10 LOVE.m4a' },
      { num: 11, file: '11 XXX.m4a' },
      { num: 12, file: '12 FEAR.m4a' },
      { num: 13, file: '13 GOD.m4a' },
      { num: 14, file: 'DUCKWORTH.m4a' }
    ]
  },
  // 16. Kendrick Lamar - good kid, m.A.A.d city
  {
    archiveId: 'good-kid-m.a.a.d-city_202508',
    albumPrefix: 'kendrick_gkmc',
    tracksPrefix: 'album-gkmc-track-',
    mapping: [
      { num: 1, file: "(2012) Good Kid, M.A.A.D City [24-96]/01 - Kendrick Lamar - Sherane a.k.a Master Splinter's Daughter.mp3" },
      { num: 2, file: "(2012) Good Kid, M.A.A.D City [24-96]/02 - Kendrick Lamar - Bitch, Don't Kill My Vibe.mp3" },
      { num: 3, file: '(2012) Good Kid, M.A.A.D City [24-96]/03 - Kendrick Lamar - Backseat Freestyle.mp3' },
      { num: 4, file: '(2012) Good Kid, M.A.A.D City [24-96]/04 - Kendrick Lamar - The Art of Peer Pressure.mp3' },
      { num: 5, file: '(2012) Good Kid, M.A.A.D City [24-96]/05 - Kendrick Lamar - Money Trees.mp3' },
      { num: 6, file: '(2012) Good Kid, M.A.A.D City [24-96]/06 - Kendrick Lamar - Poetic Justice.mp3' },
      { num: 7, file: '(2012) Good Kid, M.A.A.D City [24-96]/07 - Kendrick Lamar - good kid.mp3' },
      { num: 8, file: '(2012) Good Kid, M.A.A.D City [24-96]/08 - Kendrick Lamar - m.A.A.d city.mp3' },
      { num: 9, file: '(2012) Good Kid, M.A.A.D City [24-96]/09 - Kendrick Lamar - Swimming Pools (Drank).mp3' },
      { num: 10, file: "(2012) Good Kid, M.A.A.D City [24-96]/10 - Kendrick Lamar - Sing About Me, I'm Dying of Thirst.mp3" },
      { num: 11, file: '(2012) Good Kid, M.A.A.D City [24-96]/11 - Kendrick Lamar - Real.mp3' },
      { num: 12, file: '(2012) Good Kid, M.A.A.D City [24-96]/12 - Kendrick Lamar - Compton.mp3' }
    ]
  },
  // 17. Kanye West - The Life of Pablo
  {
    archiveId: 'kanyewest_202605',
    albumPrefix: 'kanye_tlop',
    tracksPrefix: 'album-tlop-track-',
    mapping: [
      { num: 1, file: '01. Ultralight Beam (Feat. Chance The Rapper, The-Dream, Kelly Price & Kirk Franklin).mp3' },
      { num: 2, file: '02. Father Stretch My Hands Pt. 1 (Feat. Kid Cudi).mp3' },
      { num: 3, file: '03. Pt. 2 (Feat. Desiigner & Caroline Shaw).mp3' },
      { num: 4, file: '04. Famous (Feat. Rihanna & Swizz Beatz).mp3' },
      { num: 5, file: '05. Feedback.mp3' },
      { num: 6, file: '06. Low Lights.mp3' },
      { num: 7, file: '07. Highlights (Feat. Young Thug).mp3' },
      { num: 8, file: '08. Freestyle 4 (Feat. Desiigner).mp3' },
      { num: 9, file: '09. I Love Kanye.mp3' },
      { num: 10, file: '10. Waves (Feat. Chris Brown & Kid Cudi).mp3' },
      { num: 11, file: '11. FML (Feat. The Weeknd).mp3' },
      { num: 12, file: '12. Real Friends (Feat. Ty Dolla $ign).mp3' },
      { num: 13, file: '13. Wolves (Feat. Vic Mensa, Sia & Caroline Shaw).mp3' },
      { num: 14, file: "14. Frank's Track (Feat. Frank Ocean).mp3" },
      { num: 15, file: '15. Siiiiiiiiilver Surffffeeeeer Intermission (Feat. Max B & French Montana).mp3' },
      { num: 16, file: '16. 30 Hours (Feat. Andre 3000).mp3' },
      { num: 17, file: '17. No More Parties In L.A. (Feat. Kendrick Lamar).mp3' },
      { num: 18, file: '18. Facts (Charlie Heat Version).mp3' },
      { num: 19, file: '19. Fade (Feat. Post Malone & Ty Dolla $ign).mp3' }
    ]
  },
  // 18. Kanye West - 808s & Heartbreak
  {
    archiveId: '808s-heartbreak',
    albumPrefix: 'kanye_808s',
    tracksPrefix: 'album-808s-track-',
    mapping: [
      { num: 1, file: 'Say You Will(MP3_320K).mp3' },
      { num: 2, file: 'Welcome To Heartbreak- Kanye West(MP3_320K).mp3' },
      { num: 3, file: 'Kanye West - Heartless(MP3_320K).mp3' },
      { num: 4, file: 'Kanye West - Amazing(MP3_320K).mp3' },
      { num: 5, file: 'Kanye West - Love Lockdown(MP3_320K).mp3' },
      { num: 6, file: 'Paranoid(MP3_160K).mp3' },
      { num: 7, file: 'RoboCop(MP3_160K).mp3' },
      { num: 8, file: 'Street Lights(MP3_160K).mp3' },
      { num: 9, file: 'Bad News(MP3_160K).mp3' },
      { num: 10, file: 'See You In My Nightmares(MP3_160K).mp3' },
      { num: 11, file: 'Coldest Winter(MP3_160K).mp3' },
      { num: 12, file: 'Pinocchio Story(MP3_160K).mp3' }
    ]
  },
  // 19. Alex G - Trick
  {
    archiveId: 'full-discography-alex-g',
    albumPrefix: 'alex_g_trick',
    tracksPrefix: 'album-trick-track-',
    mapping: [
      { num: 1, file: 'Alex G/2012 - Trick/01 - Memory.mp3' },
      { num: 2, file: 'Alex G/2012 - Trick/02 - Forever.mp3' },
      { num: 3, file: 'Alex G/2012 - Trick/03 - Animals.mp3' },
      { num: 4, file: 'Alex G/2012 - Trick/04 - String.mp3' },
      { num: 5, file: 'Alex G/2012 - Trick/05 - Advice.mp3' },
      { num: 6, file: 'Alex G/2012 - Trick/06 - People.mp3' },
      { num: 7, file: 'Alex G/2012 - Trick/07 - Whale.mp3' },
      { num: 8, file: 'Alex G/2012 - Trick/08 - Trick.mp3' },
      { num: 9, file: 'Alex G/2012 - Trick/09 - Kute.mp3' },
      { num: 10, file: 'Alex G/2012 - Trick/10 - So.mp3' },
      { num: 11, file: 'Alex G/2012 - Trick/11 - Mary.mp3' },
      { num: 12, file: 'Alex G/2012 - Trick/12 - Change.mp3' },
      { num: 13, file: 'Alex G/2012 - Trick/13 - Clouds.mp3' },
      { num: 14, file: 'Alex G/2012 - Trick/14 - Sarah.mp3' },
      { num: 15, file: 'Alex G/2012 - Trick/15 - 16 Mirrors.mp3' }
    ]
  }
];

async function main() {
  console.log(`Starting conversion pipeline for ${ALBUMS_PIPELINE.length} albums...`);
  
  // Link Kendrick Not Like Us first
  updateTrackInCatalog('track-kendrick-not-like-us', './music/kendrick_not_like_us.mp3');
  updateTrackInCatalog('album-not-like-us-track-1', './music/kendrick_not_like_us.mp3');

  for (const album of ALBUMS_PIPELINE) {
    console.log(`\n========================================`);
    console.log(`Processing ${album.albumPrefix} (${album.mapping.length} tracks)...`);
    console.log(`========================================`);

    for (const item of album.mapping) {
      const localFilename = `${album.albumPrefix}_${String(item.num).padStart(2, '0')}.mp3`;
      const encodedFile = item.file.split('/').map(encodeURIComponent).join('/');
      const archiveUrl = `https://archive.org/download/${album.archiveId}/${encodedFile}`;
      const trackId = `${album.tracksPrefix}${item.num}`;

      const ok = await downloadAndTranscode(archiveUrl, localFilename);
      if (ok) {
        updateTrackInCatalog(trackId, `./music/${localFilename}`);
      }
    }
  }

  console.log('\n========================================');
  console.log('ALL ALBUMS CONVERSION PIPELINE FINISHED!');
  console.log('========================================');
}

main();
