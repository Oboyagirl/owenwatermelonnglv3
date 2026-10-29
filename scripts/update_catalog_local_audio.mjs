import fs from 'fs';
import path from 'path';

const musicDataFile = path.resolve('src/data/musicData.ts');
let content = fs.readFileSync(musicDataFile, 'utf8');

const MAPPINGS = [
  // Those Eyes
  { id: 'album-those-eyes-track-1', file: './music/new_west_those_eyes.mp3' },

  // Tyler, The Creator - Flower Boy
  { id: 'album-flower-boy-track-1', file: './music/tyler_flower_boy_01_foreword.mp3' },
  { id: 'album-flower-boy-track-2', file: './music/tyler_flower_boy_02_where_this_flower_blooms.mp3' },
  { id: 'album-flower-boy-track-3', file: './music/tyler_flower_boy_03_sometimes.mp3' },
  { id: 'album-flower-boy-track-4', file: './music/tyler_see_you_again.mp3' },
  { id: 'album-flower-boy-track-5', file: './music/tyler_flower_boy_05_who_dat_boy.mp3' },
  { id: 'album-flower-boy-track-6', file: './music/tyler_flower_boy_06_pothole.mp3' },
  { id: 'album-flower-boy-track-7', file: './music/tyler_flower_boy_07_garden_shed.mp3' },
  { id: 'album-flower-boy-track-8', file: './music/tyler_flower_boy_08_boredom.mp3' },
  { id: 'album-flower-boy-track-9', file: './music/tyler_flower_boy_09_i_aint_got_time.mp3' },
  { id: 'album-flower-boy-track-10', file: './music/tyler_flower_boy_10_911_mr_lonely.mp3' },
  { id: 'album-flower-boy-track-11', file: './music/tyler_flower_boy_11_droppin_seeds.mp3' },
  { id: 'album-flower-boy-track-12', file: './music/tyler_flower_boy_12_november.mp3' },
  { id: 'album-flower-boy-track-13', file: './music/tyler_flower_boy_13_glitter.mp3' },
  { id: 'album-flower-boy-track-14', file: './music/tyler_flower_boy_14_enjoy_right_now_today.mp3' },

  // Tyler, The Creator - IGOR
  { id: 'album-igor-track-1', file: './music/tyler_igor_01_igors_theme.mp3' },
  { id: 'album-igor-track-2', file: './music/tyler_igor_02_earfquake.mp3' },
  { id: 'album-igor-track-3', file: './music/tyler_igor_03_i_think.mp3' },
  { id: 'album-igor-track-4', file: './music/tyler_igor_04_exactly_what_you_run_from.mp3' },
  { id: 'album-igor-track-5', file: './music/tyler_igor_05_running_out_of_time.mp3' },
  { id: 'album-igor-track-6', file: './music/tyler_igor_06_new_magic_wand.mp3' },
  { id: 'album-igor-track-7', file: './music/tyler_igor_07_a_boy_is_a_gun.mp3' },
  { id: 'album-igor-track-8', file: './music/tyler_igor_08_puppet.mp3' },
  { id: 'album-igor-track-9', file: './music/tyler_igor_09_whats_good.mp3' },
  { id: 'album-igor-track-10', file: './music/tyler_igor_10_gone_gone_thank_you.mp3' },
  { id: 'album-igor-track-11', file: './music/tyler_igor_11_i_dont_love_you_anymore.mp3' },
  { id: 'album-igor-track-12', file: './music/tyler_igor_12_are_we_still_friends.mp3' },

  // Drake - Take Care
  { id: 'album-take-care-track-1', file: './music/drake_take_care_01_over_my_dead_body.mp3' },
  { id: 'album-take-care-track-2', file: './music/drake_take_care_02_shot_for_me.mp3' },
  { id: 'album-take-care-track-3', file: './music/drake_take_care_03_headlines.mp3' },
  { id: 'album-take-care-track-4', file: './music/drake_take_care_04_crew_love.mp3' },
  { id: 'album-take-care-track-5', file: './music/drake_take_care_05_take_care.mp3' },
  { id: 'album-take-care-track-6', file: './music/drake_take_care_06_marvins_room.mp3' },
  { id: 'album-take-care-track-7', file: './music/drake_take_care_07_buried_alive.mp3' },
  { id: 'album-take-care-track-8', file: './music/drake_take_care_08_under_ground_kings.mp3' },
  { id: 'album-take-care-track-9', file: './music/drake_take_care_09_well_be_fine.mp3' },
  { id: 'album-take-care-track-10', file: './music/drake_take_care_10_make_me_proud.mp3' },
  { id: 'album-take-care-track-11', file: './music/drake_take_care_11_lord_knows.mp3' },
  { id: 'album-take-care-track-12', file: './music/drake_take_care_12_cameras_good_ones_go.mp3' },
  { id: 'album-take-care-track-13', file: './music/drake_take_care_13_doing_it_wrong.mp3' },
  { id: 'album-take-care-track-14', file: './music/drake_take_care_14_the_real_her.mp3' },
  { id: 'album-take-care-track-15', file: './music/drake_take_care_15_look_what_youve_done.mp3' },
  { id: 'album-take-care-track-16', file: './music/drake_take_care_16_hyfr.mp3' },
  { id: 'album-take-care-track-17', file: './music/drake_take_care_17_practice.mp3' },
  { id: 'album-take-care-track-18', file: './music/drake_take_care_18_the_ride.mp3' },

  // Kendrick Lamar
  { id: 'track-kendrick-not-like-us', file: './music/kendrick_not_like_us.mp3' },
  { id: 'album-not-like-us-track-1', file: './music/kendrick_not_like_us.mp3' },

  // Kanye West
  { id: 'album-tlop-track-13', file: './music/kanye_wolves.mp3' },
  { id: 'album-tlop-track-14', file: './music/kanye_franks_track.mp3' },

  // Alex G
  { id: 'album-trick-track-2', file: './music/alex_g_sarah.mp3' },
  { id: 'album-trick-track-16', file: './music/alex_g_treehouse.mp3' }
];

let updatedCount = 0;
for (const item of MAPPINGS) {
  const localRelative = item.file.replace(/^\.\//, '');
  const absPath = path.resolve('public', localRelative);
  if (!fs.existsSync(absPath)) {
    console.log(`Skipping ${item.id}: ${item.file} not ready yet`);
    continue;
  }

  // Regex to match the track block by id
  const trackRegex = new RegExp(`(\\{\\s*"id":\\s*"${item.id}"[\\s\\S]*?\\})`, 'm');
  const match = content.match(trackRegex);
  if (match) {
    let block = match[1];
    // Replace audioSrc
    block = block.replace(/"audioSrc":\s*"[^"]+"/, `"audioSrc": "${item.file}"`);
    // Replace hasLocalAudio
    if (block.includes('"hasLocalAudio"')) {
      block = block.replace(/"hasLocalAudio":\s*(true|false)/, `"hasLocalAudio": true`);
    } else {
      block = block.replace(/\n\s*\},?$/, `,\n    "hasLocalAudio": true\n  }`);
    }
    content = content.replace(match[1], block);
    updatedCount++;
    console.log(`Updated ${item.id} -> ${item.file}`);
  }
}

fs.writeFileSync(musicDataFile, content, 'utf8');
console.log(`Successfully updated ${updatedCount} tracks in src/data/musicData.ts`);
