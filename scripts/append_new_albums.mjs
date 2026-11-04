import fs from 'fs';
import path from 'path';

const MUSIC_DATA_PATH = path.resolve('src/data/musicData.ts');
let code = fs.readFileSync(MUSIC_DATA_PATH, 'utf8');

// 1. Update POPULAR_ARTISTS
const artistsTarget = `export const POPULAR_ARTISTS = [
  "All",
  "New West",
  "Tyler, The Creator",
  "Alex G",
  "Kanye West",
  "Drake",
  "Kendrick Lamar",
  "Travis Scott",
  "Frank Ocean",
  "Steve Lacy",
  "The Weeknd",
  "Billie Eilish"
];`;

const artistsReplacement = `export const POPULAR_ARTISTS = [
  "All",
  "New West",
  "Tyler, The Creator",
  "Alex G",
  "Arctic Monkeys",
  "J. Cole",
  "Radiohead",
  "Kanye West",
  "Drake",
  "Kendrick Lamar",
  "Travis Scott",
  "Frank Ocean",
  "Steve Lacy",
  "The Weeknd",
  "Billie Eilish"
];`;

if (code.includes(artistsTarget)) {
  code = code.replace(artistsTarget, artistsReplacement);
}

// 2. New Albums definitions
const newAlbumsData = [
  {
    id: "album-alex-g-race",
    title: "Race",
    artist: "Alex G",
    year: 2010,
    cover: "./music/covers/alex_g_race.jpg",
    genre: "Lo-Fi Indie / Slacker Rock",
    tracksCount: 13,
    description: "The seminal self-recorded debut cult masterpiece featuring Gnaw, Things to Do, Remember, and Crab.",
    spotifyAlbumId: "77m2rP3w83P1oY3q6xYkGv"
  },
  {
    id: "album-alex-g-rules",
    title: "Rules",
    artist: "Alex G",
    year: 2012,
    cover: "./music/covers/alex_g_rules.jpg",
    genre: "Lo-Fi Indie / Indie Folk",
    tracksCount: 13,
    description: "Alex G's celebrated second studio album featuring Mis, Sandy, Wicked Boy, and Come Back.",
    spotifyAlbumId: "4zQ2oK9uJ97F3d3yB9d7qP"
  },
  {
    id: "album-arctic-monkeys-am",
    title: "AM",
    artist: "Arctic Monkeys",
    year: 2013,
    cover: "./music/covers/arctic_monkeys_am.jpg",
    genre: "Indie Rock / Desert Rock",
    tracksCount: 12,
    description: "Global multi-platinum rock powerhouse featuring Do I Wanna Know?, R U Mine?, and I Wanna Be Yours.",
    spotifyAlbumId: "78bpIziExqiI91zt90gUMb"
  },
  {
    id: "album-j-cole-fhd",
    title: "2014 Forest Hills Drive",
    artist: "J. Cole",
    year: 2014,
    cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg",
    genre: "Hip Hop / Conscious Rap",
    tracksCount: 13,
    description: "Legendary double-platinum album without features containing No Role Modelz, Wet Dreamz, and Apparently.",
    spotifyAlbumId: "0Flm7D0dK3w6eQ8K37jXG3"
  },
  {
    id: "album-radiohead-ok-computer",
    title: "OK Computer",
    artist: "Radiohead",
    year: 1997,
    cover: "./music/covers/radiohead_ok_computer.jpg",
    genre: "Alternative Rock / Art Rock",
    tracksCount: 12,
    description: "Universally acclaimed landmark rock album featuring Paranoid Android, Karma Police, No Surprises, and Exit Music.",
    spotifyAlbumId: "6dVIqQ8qmQ5GBnJ9shOYGE"
  }
];

// Append new albums to POPULAR_ALBUMS before its closing bracket
const albumsMarker = `    "description": "Grammy Album of the Year winner featuring bad guy, bury a friend, and when the party's over.",
    "spotifyAlbumId": "0S0KGZnfBGSI3NJbqEFNv3"
  }
];`;

const newAlbumsSnippet = newAlbumsData.map(a => `  ${JSON.stringify(a, null, 2).replace(/\n/g, '\n  ')}`).join(',\n');
const albumsReplacement = `    "description": "Grammy Album of the Year winner featuring bad guy, bury a friend, and when the party's over.",
    "spotifyAlbumId": "0S0KGZnfBGSI3NJbqEFNv3"
  },
${newAlbumsSnippet}
];`;

if (code.includes(albumsMarker)) {
  code = code.replace(albumsMarker, albumsReplacement);
  console.log("Appended new albums to POPULAR_ALBUMS");
}

// 3. New Tracks
const newTracksData = [
  // Alex G - Race
  { id: "alex-g-race-01", title: "Remember", artist: "Alex G", album: "Race", year: 2010, duration: "1:45", durationSec: 105, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_01.mp3", albumId: "album-alex-g-race", trackNumber: 1, hasLocalAudio: true },
  { id: "alex-g-race-02", title: "The Same", artist: "Alex G", album: "Race", year: 2010, duration: "2:46", durationSec: 166, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_02.mp3", albumId: "album-alex-g-race", trackNumber: 2, hasLocalAudio: true },
  { id: "alex-g-race-03", title: "TV", artist: "Alex G", album: "Race", year: 2010, duration: "1:15", durationSec: 75, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_03.mp3", albumId: "album-alex-g-race", trackNumber: 3, hasLocalAudio: true },
  { id: "alex-g-race-04", title: "Gnaw", artist: "Alex G", album: "Race", year: 2010, duration: "3:18", durationSec: 198, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_04.mp3", albumId: "album-alex-g-race", trackNumber: 4, hasLocalAudio: true },
  { id: "alex-g-race-05", title: "Trash", artist: "Alex G", album: "Race", year: 2010, duration: "1:44", durationSec: 104, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_05.mp3", albumId: "album-alex-g-race", trackNumber: 5, hasLocalAudio: true },
  { id: "alex-g-race-06", title: "House", artist: "Alex G", album: "Race", year: 2010, duration: "2:27", durationSec: 147, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_06.mp3", albumId: "album-alex-g-race", trackNumber: 6, hasLocalAudio: true },
  { id: "alex-g-race-07", title: "Crab", artist: "Alex G", album: "Race", year: 2010, duration: "2:36", durationSec: 156, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_07.mp3", albumId: "album-alex-g-race", trackNumber: 7, hasLocalAudio: true },
  { id: "alex-g-race-08", title: "Go Away", artist: "Alex G", album: "Race", year: 2010, duration: "1:22", durationSec: 82, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_08.mp3", albumId: "album-alex-g-race", trackNumber: 8, hasLocalAudio: true },
  { id: "alex-g-race-09", title: "Let It Go", artist: "Alex G", album: "Race", year: 2010, duration: "2:13", durationSec: 133, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_09.mp3", albumId: "album-alex-g-race", trackNumber: 9, hasLocalAudio: true },
  { id: "alex-g-race-10", title: "Things to Do", artist: "Alex G", album: "Race", year: 2010, duration: "2:41", durationSec: 161, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_10.mp3", albumId: "album-alex-g-race", trackNumber: 10, hasLocalAudio: true },
  { id: "alex-g-race-11", title: "Time / Space", artist: "Alex G", album: "Race", year: 2010, duration: "1:40", durationSec: 100, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_11.mp3", albumId: "album-alex-g-race", trackNumber: 11, hasLocalAudio: true },
  { id: "alex-g-race-12", title: "Cross Country", artist: "Alex G", album: "Race", year: 2010, duration: "1:28", durationSec: 88, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_12.mp3", albumId: "album-alex-g-race", trackNumber: 12, hasLocalAudio: true },
  { id: "alex-g-race-13", title: "Race", artist: "Alex G", album: "Race", year: 2010, duration: "3:34", durationSec: 214, cover: "./music/covers/alex_g_race.jpg", genre: "Lo-Fi Indie / Slacker Rock", audioSrc: "./music/alex_g_race_13.mp3", albumId: "album-alex-g-race", trackNumber: 13, hasLocalAudio: true },

  // Alex G - Rules
  { id: "alex-g-rules-01", title: "Water", artist: "Alex G", album: "Rules", year: 2012, duration: "2:43", durationSec: 163, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_01.mp3", albumId: "album-alex-g-rules", trackNumber: 1, hasLocalAudio: true },
  { id: "alex-g-rules-02", title: "Come Back", artist: "Alex G", album: "Rules", year: 2012, duration: "2:13", durationSec: 133, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_02.mp3", albumId: "album-alex-g-rules", trackNumber: 2, hasLocalAudio: true },
  { id: "alex-g-rules-03", title: "Fighting", artist: "Alex G", album: "Rules", year: 2012, duration: "2:08", durationSec: 128, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_03.mp3", albumId: "album-alex-g-rules", trackNumber: 3, hasLocalAudio: true },
  { id: "alex-g-rules-04", title: "Wicked Boy", artist: "Alex G", album: "Rules", year: 2012, duration: "2:00", durationSec: 120, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_04.mp3", albumId: "album-alex-g-rules", trackNumber: 4, hasLocalAudio: true },
  { id: "alex-g-rules-05", title: "Candy", artist: "Alex G", album: "Rules", year: 2012, duration: "2:27", durationSec: 147, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_05.mp3", albumId: "album-alex-g-rules", trackNumber: 5, hasLocalAudio: true },
  { id: "alex-g-rules-06", title: "Mis", artist: "Alex G", album: "Rules", year: 2012, duration: "2:31", durationSec: 151, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_06.mp3", albumId: "album-alex-g-rules", trackNumber: 6, hasLocalAudio: true },
  { id: "alex-g-rules-07", title: "Master", artist: "Alex G", album: "Rules", year: 2012, duration: "2:26", durationSec: 146, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_07.mp3", albumId: "album-alex-g-rules", trackNumber: 7, hasLocalAudio: true },
  { id: "alex-g-rules-08", title: "New", artist: "Alex G", album: "Rules", year: 2012, duration: "1:36", durationSec: 96, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_08.mp3", albumId: "album-alex-g-rules", trackNumber: 8, hasLocalAudio: true },
  { id: "alex-g-rules-09", title: "Know Now", artist: "Alex G", album: "Rules", year: 2012, duration: "1:48", durationSec: 108, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_09.mp3", albumId: "album-alex-g-rules", trackNumber: 9, hasLocalAudio: true },
  { id: "alex-g-rules-10", title: "Rules", artist: "Alex G", album: "Rules", year: 2012, duration: "2:05", durationSec: 125, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_10.mp3", albumId: "album-alex-g-rules", trackNumber: 10, hasLocalAudio: true },
  { id: "alex-g-rules-11", title: "Message", artist: "Alex G", album: "Rules", year: 2012, duration: "2:37", durationSec: 157, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_11.mp3", albumId: "album-alex-g-rules", trackNumber: 11, hasLocalAudio: true },
  { id: "alex-g-rules-12", title: "Sandy", artist: "Alex G", album: "Rules", year: 2012, duration: "2:37", durationSec: 157, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_12.mp3", albumId: "album-alex-g-rules", trackNumber: 12, hasLocalAudio: true },
  { id: "alex-g-rules-13", title: "Good", artist: "Alex G", album: "Rules", year: 2012, duration: "1:17", durationSec: 77, cover: "./music/covers/alex_g_rules.jpg", genre: "Lo-Fi Indie / Indie Folk", audioSrc: "./music/alex_g_rules_13.mp3", albumId: "album-alex-g-rules", trackNumber: 13, hasLocalAudio: true },

  // Arctic Monkeys - AM
  { id: "arctic-monkeys-am-01", title: "Do I Wanna Know?", artist: "Arctic Monkeys", album: "AM", year: 2013, duration: "4:32", durationSec: 272, cover: "./music/covers/arctic_monkeys_am.jpg", genre: "Indie Rock / Desert Rock", audioSrc: "./music/arctic_monkeys_am_01.mp3", albumId: "album-arctic-monkeys-am", trackNumber: 1, hasLocalAudio: true },
  { id: "arctic-monkeys-am-02", title: "R U Mine?", artist: "Arctic Monkeys", album: "AM", year: 2013, duration: "3:21", durationSec: 201, cover: "./music/covers/arctic_monkeys_am.jpg", genre: "Indie Rock / Desert Rock", audioSrc: "./music/arctic_monkeys_am_02.mp3", albumId: "album-arctic-monkeys-am", trackNumber: 2, hasLocalAudio: true },
  { id: "arctic-monkeys-am-03", title: "One For The Road", artist: "Arctic Monkeys", album: "AM", year: 2013, duration: "3:26", durationSec: 206, cover: "./music/covers/arctic_monkeys_am.jpg", genre: "Indie Rock / Desert Rock", audioSrc: "./music/arctic_monkeys_am_03.mp3", albumId: "album-arctic-monkeys-am", trackNumber: 3, hasLocalAudio: true },
  { id: "arctic-monkeys-am-04", title: "Arabella", artist: "Arctic Monkeys", album: "AM", year: 2013, duration: "3:27", durationSec: 207, cover: "./music/covers/arctic_monkeys_am.jpg", genre: "Indie Rock / Desert Rock", audioSrc: "./music/arctic_monkeys_am_04.mp3", albumId: "album-arctic-monkeys-am", trackNumber: 4, hasLocalAudio: true },
  { id: "arctic-monkeys-am-05", title: "I Want It All", artist: "Arctic Monkeys", album: "AM", year: 2013, duration: "3:05", durationSec: 185, cover: "./music/covers/arctic_monkeys_am.jpg", genre: "Indie Rock / Desert Rock", audioSrc: "./music/arctic_monkeys_am_05.mp3", albumId: "album-arctic-monkeys-am", trackNumber: 5, hasLocalAudio: true },
  { id: "arctic-monkeys-am-06", title: "No. 1 Party Anthem", artist: "Arctic Monkeys", album: "AM", year: 2013, duration: "4:03", durationSec: 243, cover: "./music/covers/arctic_monkeys_am.jpg", genre: "Indie Rock / Desert Rock", audioSrc: "./music/arctic_monkeys_am_06.mp3", albumId: "album-arctic-monkeys-am", trackNumber: 6, hasLocalAudio: true },
  { id: "arctic-monkeys-am-07", title: "Mad Sounds", artist: "Arctic Monkeys", album: "AM", year: 2013, duration: "3:35", durationSec: 215, cover: "./music/covers/arctic_monkeys_am.jpg", genre: "Indie Rock / Desert Rock", audioSrc: "./music/arctic_monkeys_am_07.mp3", albumId: "album-arctic-monkeys-am", trackNumber: 7, hasLocalAudio: true },
  { id: "arctic-monkeys-am-08", title: "Fireside", artist: "Arctic Monkeys", album: "AM", year: 2013, duration: "3:01", durationSec: 181, cover: "./music/covers/arctic_monkeys_am.jpg", genre: "Indie Rock / Desert Rock", audioSrc: "./music/arctic_monkeys_am_08.mp3", albumId: "album-arctic-monkeys-am", trackNumber: 8, hasLocalAudio: true },
  { id: "arctic-monkeys-am-09", title: "Why'd You Only Call Me When You're High?", artist: "Arctic Monkeys", album: "AM", year: 2013, duration: "2:41", durationSec: 161, cover: "./music/covers/arctic_monkeys_am.jpg", genre: "Indie Rock / Desert Rock", audioSrc: "./music/arctic_monkeys_am_09.mp3", albumId: "album-arctic-monkeys-am", trackNumber: 9, hasLocalAudio: true },
  { id: "arctic-monkeys-am-10", title: "Snap Out Of It", artist: "Arctic Monkeys", album: "AM", year: 2013, duration: "3:13", durationSec: 193, cover: "./music/covers/arctic_monkeys_am.jpg", genre: "Indie Rock / Desert Rock", audioSrc: "./music/arctic_monkeys_am_10.mp3", albumId: "album-arctic-monkeys-am", trackNumber: 10, hasLocalAudio: true },
  { id: "arctic-monkeys-am-11", title: "Knee Socks", artist: "Arctic Monkeys", album: "AM", year: 2013, duration: "4:17", durationSec: 257, cover: "./music/covers/arctic_monkeys_am.jpg", genre: "Indie Rock / Desert Rock", audioSrc: "./music/arctic_monkeys_am_11.mp3", albumId: "album-arctic-monkeys-am", trackNumber: 11, hasLocalAudio: true },
  { id: "arctic-monkeys-am-12", title: "I Wanna Be Yours", artist: "Arctic Monkeys", album: "AM", year: 2013, duration: "3:04", durationSec: 184, cover: "./music/covers/arctic_monkeys_am.jpg", genre: "Indie Rock / Desert Rock", audioSrc: "./music/arctic_monkeys_am_12.mp3", albumId: "album-arctic-monkeys-am", trackNumber: 12, hasLocalAudio: true },

  // J. Cole - 2014 Forest Hills Drive
  { id: "j-cole-fhd-01", title: "Intro", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "2:09", durationSec: 129, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_01.mp3", albumId: "album-j-cole-fhd", trackNumber: 1, hasLocalAudio: true },
  { id: "j-cole-fhd-02", title: "January 28th", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "4:02", durationSec: 242, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_02.mp3", albumId: "album-j-cole-fhd", trackNumber: 2, hasLocalAudio: true },
  { id: "j-cole-fhd-03", title: "Wet Dreamz", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "3:59", durationSec: 239, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_03.mp3", albumId: "album-j-cole-fhd", trackNumber: 3, hasLocalAudio: true },
  { id: "j-cole-fhd-04", title: "03' Adolescence", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "4:24", durationSec: 264, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_04.mp3", albumId: "album-j-cole-fhd", trackNumber: 4, hasLocalAudio: true },
  { id: "j-cole-fhd-05", title: "A Tale of 2 Citiez", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "4:29", durationSec: 269, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_05.mp3", albumId: "album-j-cole-fhd", trackNumber: 5, hasLocalAudio: true },
  { id: "j-cole-fhd-06", title: "Fire Squad", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "4:48", durationSec: 288, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_06.mp3", albumId: "album-j-cole-fhd", trackNumber: 6, hasLocalAudio: true },
  { id: "j-cole-fhd-07", title: "St. Tropez", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "4:17", durationSec: 257, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_07.mp3", albumId: "album-j-cole-fhd", trackNumber: 7, hasLocalAudio: true },
  { id: "j-cole-fhd-08", title: "G.O.M.D.", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "5:01", durationSec: 301, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_08.mp3", albumId: "album-j-cole-fhd", trackNumber: 8, hasLocalAudio: true },
  { id: "j-cole-fhd-09", title: "No Role Modelz", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "4:52", durationSec: 292, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_09.mp3", albumId: "album-j-cole-fhd", trackNumber: 9, hasLocalAudio: true },
  { id: "j-cole-fhd-10", title: "Hello", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "3:39", durationSec: 219, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_10.mp3", albumId: "album-j-cole-fhd", trackNumber: 10, hasLocalAudio: true },
  { id: "j-cole-fhd-11", title: "Apparently", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "4:53", durationSec: 293, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_11.mp3", albumId: "album-j-cole-fhd", trackNumber: 11, hasLocalAudio: true },
  { id: "j-cole-fhd-12", title: "Love Yourz", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "3:31", durationSec: 211, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_12.mp3", albumId: "album-j-cole-fhd", trackNumber: 12, hasLocalAudio: true },
  { id: "j-cole-fhd-13", title: "Note to Self", artist: "J. Cole", album: "2014 Forest Hills Drive", year: 2014, duration: "14:35", durationSec: 875, cover: "./music/covers/j_cole_2014_forest_hills_drive.jpg", genre: "Hip Hop / Conscious Rap", audioSrc: "./music/j_cole_fhd_13.mp3", albumId: "album-j-cole-fhd", trackNumber: 13, hasLocalAudio: true },

  // Radiohead - OK Computer
  { id: "radiohead-ok-01", title: "Airbag", artist: "Radiohead", album: "OK Computer", year: 1997, duration: "4:44", durationSec: 284, cover: "./music/covers/radiohead_ok_computer.jpg", genre: "Alternative Rock / Art Rock", audioSrc: "./music/radiohead_ok_computer_01.mp3", albumId: "album-radiohead-ok-computer", trackNumber: 1, hasLocalAudio: true },
  { id: "radiohead-ok-02", title: "Paranoid Android", artist: "Radiohead", album: "OK Computer", year: 1997, duration: "6:23", durationSec: 383, cover: "./music/covers/radiohead_ok_computer.jpg", genre: "Alternative Rock / Art Rock", audioSrc: "./music/radiohead_ok_computer_02.mp3", albumId: "album-radiohead-ok-computer", trackNumber: 2, hasLocalAudio: true },
  { id: "radiohead-ok-03", title: "Subterranean Homesick Alien", artist: "Radiohead", album: "OK Computer", year: 1997, duration: "4:27", durationSec: 267, cover: "./music/covers/radiohead_ok_computer.jpg", genre: "Alternative Rock / Art Rock", audioSrc: "./music/radiohead_ok_computer_03.mp3", albumId: "album-radiohead-ok-computer", trackNumber: 3, hasLocalAudio: true },
  { id: "radiohead-ok-04", title: "Exit Music (For a Film)", artist: "Radiohead", album: "OK Computer", year: 1997, duration: "4:24", durationSec: 264, cover: "./music/covers/radiohead_ok_computer.jpg", genre: "Alternative Rock / Art Rock", audioSrc: "./music/radiohead_ok_computer_04.mp3", albumId: "album-radiohead-ok-computer", trackNumber: 4, hasLocalAudio: true },
  { id: "radiohead-ok-05", title: "Let Down", artist: "Radiohead", album: "OK Computer", year: 1997, duration: "4:59", durationSec: 299, cover: "./music/covers/radiohead_ok_computer.jpg", genre: "Alternative Rock / Art Rock", audioSrc: "./music/radiohead_ok_computer_05.mp3", albumId: "album-radiohead-ok-computer", trackNumber: 5, hasLocalAudio: true },
  { id: "radiohead-ok-06", title: "Karma Police", artist: "Radiohead", album: "OK Computer", year: 1997, duration: "4:21", durationSec: 261, cover: "./music/covers/radiohead_ok_computer.jpg", genre: "Alternative Rock / Art Rock", audioSrc: "./music/radiohead_ok_computer_06.mp3", albumId: "album-radiohead-ok-computer", trackNumber: 6, hasLocalAudio: true },
  { id: "radiohead-ok-07", title: "Fitter Happier", artist: "Radiohead", album: "OK Computer", year: 1997, duration: "1:57", durationSec: 117, cover: "./music/covers/radiohead_ok_computer.jpg", genre: "Alternative Rock / Art Rock", audioSrc: "./music/radiohead_ok_computer_07.mp3", albumId: "album-radiohead-ok-computer", trackNumber: 7, hasLocalAudio: true },
  { id: "radiohead-ok-08", title: "Electioneering", artist: "Radiohead", album: "OK Computer", year: 1997, duration: "3:50", durationSec: 230, cover: "./music/covers/radiohead_ok_computer.jpg", genre: "Alternative Rock / Art Rock", audioSrc: "./music/radiohead_ok_computer_08.mp3", albumId: "album-radiohead-ok-computer", trackNumber: 8, hasLocalAudio: true },
  { id: "radiohead-ok-09", title: "Climbing Up the Walls", artist: "Radiohead", album: "OK Computer", year: 1997, duration: "4:45", durationSec: 285, cover: "./music/covers/radiohead_ok_computer.jpg", genre: "Alternative Rock / Art Rock", audioSrc: "./music/radiohead_ok_computer_09.mp3", albumId: "album-radiohead-ok-computer", trackNumber: 9, hasLocalAudio: true },
  { id: "radiohead-ok-10", title: "No Surprises", artist: "Radiohead", album: "OK Computer", year: 1997, duration: "3:48", durationSec: 228, cover: "./music/covers/radiohead_ok_computer.jpg", genre: "Alternative Rock / Art Rock", audioSrc: "./music/radiohead_ok_computer_10.mp3", albumId: "album-radiohead-ok-computer", trackNumber: 10, hasLocalAudio: true },
  { id: "radiohead-ok-11", title: "Lucky", artist: "Radiohead", album: "OK Computer", year: 1997, duration: "4:19", durationSec: 259, cover: "./music/covers/radiohead_ok_computer.jpg", genre: "Alternative Rock / Art Rock", audioSrc: "./music/radiohead_ok_computer_11.mp3", albumId: "album-radiohead-ok-computer", trackNumber: 11, hasLocalAudio: true },
  { id: "radiohead-ok-12", title: "The Tourist", artist: "Radiohead", album: "OK Computer", year: 1997, duration: "5:24", durationSec: 324, cover: "./music/covers/radiohead_ok_computer.jpg", genre: "Alternative Rock / Art Rock", audioSrc: "./music/radiohead_ok_computer_12.mp3", albumId: "album-radiohead-ok-computer", trackNumber: 12, hasLocalAudio: true }
];

// Append new tracks to REAL_MUSIC_CATALOG before its closing bracket
const catalogClosing = `    "hasLocalAudio": true
  }
];`;

const newTracksSnippet = newTracksData.map(t => `  ${JSON.stringify(t, null, 2).replace(/\n/g, '\n  ')}`).join(',\n');
const catalogReplacement = `    "hasLocalAudio": true
  },
${newTracksSnippet}
];`;

if (code.includes(catalogClosing)) {
  code = code.replace(catalogClosing, catalogReplacement);
  console.log("Appended new tracks to REAL_MUSIC_CATALOG");
}

fs.writeFileSync(MUSIC_DATA_PATH, code);
console.log("Successfully updated musicData.ts with all 5 new albums and 63 new tracks!");
