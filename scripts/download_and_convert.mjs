import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MUSIC_DIR = path.resolve('public/music');
if (!fs.existsSync(MUSIC_DIR)) {
  fs.mkdirSync(MUSIC_DIR, { recursive: true });
}

async function downloadAndTranscode(url, targetFilename) {
  const targetPath = path.join(MUSIC_DIR, targetFilename);
  if (fs.existsSync(targetPath)) {
    console.log(`[EXISTS] ${targetFilename}`);
    return targetPath;
  }

  const tempRaw = path.join('/tmp', `raw_${Date.now()}_${Math.random().toString(36).substring(7)}.tmp`);
  try {
    console.log(`[DOWNLOADING] ${url} -> ${targetFilename}`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': '*/*'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000)
    });

    if (!res.ok) {
      console.warn(`[HTTP ERROR] ${res.status} for ${url}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(tempRaw, Buffer.from(arrayBuffer));

    console.log(`[TRANSCODING] ${targetFilename} with ffmpeg to 128k 44.1kHz stereo MP3...`);
    // Encode with libmp3lame, 44.1kHz, 128kbps, 2 channels (identical profile to tyler_see_you_again.mp3)
    execSync(`ffmpeg -y -v error -i "${tempRaw}" -vn -c:a libmp3lame -b:a 128k -ar 44100 -ac 2 "${targetPath}"`);
    console.log(`[DONE] Created ${targetFilename} (${fs.statSync(targetPath).size} bytes)`);
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

// Target tracks for Flower Boy, IGOR, Take Care, and essentials
const BATCH_1 = [
  // Those Eyes
  {
    url: "https://archive.org/download/new-west-those-eyes-mp-3.pm_202607/New_West_-_Those_Eyes_(mp3.pm).mp3",
    file: "new_west_those_eyes.mp3"
  },
  // Tyler, The Creator - Flower Boy
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/01%20Foreword%20(Featuring%20Rex%20Orange%20Co.mp3",
    file: "tyler_flower_boy_01_foreword.mp3"
  },
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/02%20Where%20This%20Flower%20Blooms%20(Featuri.mp3",
    file: "tyler_flower_boy_02_where_this_flower_blooms.mp3"
  },
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/03%20Sometimes....mp3",
    file: "tyler_flower_boy_03_sometimes.mp3"
  },
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/05%20Who%20Dat%20Boy%20(Featuring%20A%24Ap%20Rocky.mp3",
    file: "tyler_flower_boy_05_who_dat_boy.mp3"
  },
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/06%20Pothole%20(Featuring%20Jaden%20Smith).mp3",
    file: "tyler_flower_boy_06_pothole.mp3"
  },
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/07%20Garden%20Shed%20(Featuring%20Estelle).mp3",
    file: "tyler_flower_boy_07_garden_shed.mp3"
  },
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/08%20Boredom%20(Featuring%20Rex%20County%20Ora.mp3",
    file: "tyler_flower_boy_08_boredom.mp3"
  },
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/09%20I%20Ain't%20Got%20Time!.mp3",
    file: "tyler_flower_boy_09_i_aint_got_time.mp3"
  },
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/10%20911%20(Featuring%20Frank%20Ocean%20%26%20Stev.mp3",
    file: "tyler_flower_boy_10_911_mr_lonely.mp3"
  },
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/11%20Droppin'%20Seeds%20(Featuring%20Lil'%20Wa.mp3",
    file: "tyler_flower_boy_11_droppin_seeds.mp3"
  },
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/12%20November.mp3",
    file: "tyler_flower_boy_12_november.mp3"
  },
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/13%20Glitter.mp3",
    file: "tyler_flower_boy_13_glitter.mp3"
  },
  {
    url: "https://archive.org/download/tyler-the-creator-flower-boy_22222/14%20Enjoy%20Right%20Now%2C%20Today.mp3",
    file: "tyler_flower_boy_14_enjoy_right_now_today.mp3"
  },
  // Tyler, The Creator - IGOR
  {
    url: "https://archive.org/download/igor-tyler-the-creator_202608/01.%20IGOR'S%20THEME.mp3",
    file: "tyler_igor_01_igors_theme.mp3"
  },
  {
    url: "https://archive.org/download/igor-tyler-the-creator_202608/02.%20EARFQUAKE.mp3",
    file: "tyler_igor_02_earfquake.mp3"
  },
  {
    url: "https://archive.org/download/igor-tyler-the-creator_202608/03.%20I%20THINK.mp3",
    file: "tyler_igor_03_i_think.mp3"
  },
  {
    url: "https://archive.org/download/igor-tyler-the-creator_202608/04.%20EXACTLY%20WHAT%20YOU%20RUN%20FROM%20YOU%20END.mp3",
    file: "tyler_igor_04_exactly_what_you_run_from.mp3"
  },
  {
    url: "https://archive.org/download/igor-tyler-the-creator_202608/05.%20RUNNING%20OUT%20OF%20TIME.mp3",
    file: "tyler_igor_05_running_out_of_time.mp3"
  },
  {
    url: "https://archive.org/download/igor-tyler-the-creator_202608/06.%20NEW%20MAGIC%20WAND.mp3",
    file: "tyler_igor_06_new_magic_wand.mp3"
  },
  {
    url: "https://archive.org/download/igor-tyler-the-creator_202608/07.%20A%20BOY%20IS%20A%20GUN.mp3",
    file: "tyler_igor_07_a_boy_is_a_gun.mp3"
  },
  {
    url: "https://archive.org/download/igor-tyler-the-creator_202608/08.%20PUPPET.mp3",
    file: "tyler_igor_08_puppet.mp3"
  },
  {
    url: "https://archive.org/download/igor-tyler-the-creator_202608/09.%20WHAT'S%20GOOD.mp3",
    file: "tyler_igor_09_whats_good.mp3"
  },
  {
    url: "https://archive.org/download/igor-tyler-the-creator_202608/10.%20GONE%2C%20GONE%20THANK%20YOU.mp3",
    file: "tyler_igor_10_gone_gone_thank_you.mp3"
  },
  {
    url: "https://archive.org/download/igor-tyler-the-creator_202608/11.%20I%20DON'T%20LOVE%20YOU%20ANYMORE.mp3",
    file: "tyler_igor_11_i_dont_love_you_anymore.mp3"
  },
  {
    url: "https://archive.org/download/igor-tyler-the-creator_202608/12.%20ARE%20WE%20STILL%20FRIENDS.mp3",
    file: "tyler_igor_12_are_we_still_friends.mp3"
  },
  // Drake - Take Care
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
    url: "https://archive.org/download/take-care-drake_202609/06.%20Marvins%20Room.mp3",
    file: "drake_take_care_06_marvins_room.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/07.%20Buried%20Alive%20Interlude.mp3",
    file: "drake_take_care_07_buried_alive.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/08.%20Under%20Ground%20Kings.mp3",
    file: "drake_take_care_08_under_ground_kings.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/09.%20We%27ll%20Be%20Fine.mp3",
    file: "drake_take_care_09_well_be_fine.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/10.%20Make%20Me%20Proud%20(Feat.%20Nicki%20Minaj).mp3",
    file: "drake_take_care_10_make_me_proud.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/11.%20Lord%20Knows%20(Feat.%20Rick%20Ross).mp3",
    file: "drake_take_care_11_lord_knows.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/12.%20Cameras%20%26%20Good%20Ones%20Go%20Interlude.mp3",
    file: "drake_take_care_12_cameras_good_ones_go.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/13.%20Doing%20It%20Wrong.mp3",
    file: "drake_take_care_13_doing_it_wrong.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/14.%20The%20Real%20Her%20(Feat.%20Lil%20Wayne%20%26%20Andre%203000).mp3",
    file: "drake_take_care_14_the_real_her.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/15.%20Look%20What%20You%27ve%20Done.mp3",
    file: "drake_take_care_15_look_what_youve_done.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/16.%20HYFR%20(Hell%20Ya%20Fucking%20Right)%20(Feat.%20Lil%20Wayne).mp3",
    file: "drake_take_care_16_hyfr.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/17.%20Practice.mp3",
    file: "drake_take_care_17_practice.mp3"
  },
  {
    url: "https://archive.org/download/take-care-drake_202609/18.%20The%20Ride.mp3",
    file: "drake_take_care_18_the_ride.mp3"
  },
  // Kendrick - Not Like Us
  {
    url: "https://archive.org/download/kendrick-lamar-not-like-us_202606/Kendrick_Lamar_-_Not_Like_Us.mp3",
    file: "kendrick_not_like_us.mp3"
  },
  // Kanye West - Frank's Track & Wolves
  {
    url: "https://archive.org/download/kanye-west-the-life-of-pablo_202606/13%20Wolves%20(feat.%20Vic%20Mensa%20%26%20Sia).mp3",
    file: "kanye_wolves.mp3"
  },
  {
    url: "https://archive.org/download/kanye-west-the-life-of-pablo_202606/14%20Frank%27s%20Track.mp3",
    file: "kanye_franks_track.mp3"
  },
  // Alex G - Sarah, Pretend, Treehouse
  {
    url: "https://archive.org/download/alex-g-trick_202608/02%20Sarah.mp3",
    file: "alex_g_sarah.mp3"
  },
  {
    url: "https://archive.org/download/alex-g-trick_202608/16%20Treehouse.mp3",
    file: "alex_g_treehouse.mp3"
  }
];

async function main() {
  console.log(`Starting conversion for ${BATCH_1.length} songs...`);
  for (const item of BATCH_1) {
    await downloadAndTranscode(item.url, item.file);
  }
  console.log('Conversion batch complete!');
}

main();
