export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  duration: string;
  durationSec: number;
  cover: string; // Real local downloaded album artwork
  genre: string;
  audioSrc: string; // Real local downloaded MP3 file
  spotifyId?: string;
  youtubeId?: string;
  albumId?: string;
  trackNumber?: number;
  hasLocalAudio?: boolean;
}

export interface MusicAlbum {
  id: string;
  title: string;
  artist: string;
  year: number;
  cover: string;
  genre: string;
  tracksCount: number;
  description: string;
  spotifyAlbumId?: string;
}

export const POPULAR_ARTISTS = [
  'All',
  'Tyler, The Creator',
  'Alex G',
  'Kanye West',
  'Drake',
  'Kendrick Lamar',
  'Travis Scott',
  'Frank Ocean',
  'Steve Lacy',
  'The Weeknd',
  'Billie Eilish'
];

export const POPULAR_ALBUMS: MusicAlbum[] = [
  {
    id: "album-flower-boy",
    title: "Flower Boy",
    artist: "Tyler, The Creator",
    year: 2017,
    cover: "./music/covers/tyler_flower_boy.jpg",
    genre: "Hip Hop / Neo Soul",
    tracksCount: 1,
    description: "Grammy-nominated milestone album featuring the platinum anthem 'See You Again' with Kali Uchis.",
    spotifyAlbumId: "2nkto6YNI4hgFU1bDcJoPV"
  },
  {
    id: "album-igor",
    title: "IGOR",
    artist: "Tyler, The Creator",
    year: 2019,
    cover: "./music/covers/tyler_igor.jpg",
    genre: "Experimental Hip Hop / Funk",
    tracksCount: 2,
    description: "Grammy Award-winning Best Rap Album featuring 'EARFQUAKE' and 'NEW MAGIC WAND'.",
    spotifyAlbumId: "5zi7WsKlIiUXv09tbGLKsE"
  },
  {
    id: "album-trick",
    title: "Trick",
    artist: "Alex G",
    year: 2012,
    cover: "./music/covers/alex_g_trick.jpg",
    genre: "Indie Rock / Lo-Fi",
    tracksCount: 3,
    description: "Cult-classic DIY breakthrough album featuring 'Sarah', 'Mary', and 'Treehouse'.",
    spotifyAlbumId: "19vH1M4W7D3p8Y2u3h5g2H"
  },
  {
    id: "album-house-of-sugar",
    title: "House of Sugar",
    artist: "Alex G",
    year: 2019,
    cover: "./music/covers/alex_g_house_of_sugar.jpg",
    genre: "Art Pop / Experimental Indie",
    tracksCount: 1,
    description: "Critically revered studio masterpiece featuring the viral hit 'Pretend'.",
    spotifyAlbumId: "0v9N8c4qX1w2b4m7k5L1a9"
  },
  {
    id: "album-graduation",
    title: "Graduation",
    artist: "Kanye West",
    year: 2007,
    cover: "./music/covers/kanye_graduation.jpg",
    genre: "Hip Hop / Synthpop",
    tracksCount: 2,
    description: "Multi-platinum stadium rap classic featuring worldwide anthems 'Stronger' and 'Flashing Lights'.",
    spotifyAlbumId: "4SZko61aMnmgvEGfhVTu7o"
  },
  {
    id: "album-the-life-of-pablo",
    title: "The Life of Pablo",
    artist: "Kanye West",
    year: 2016,
    cover: "./music/covers/kanye_tlop.jpg",
    genre: "Hip Hop / Gospel Rap",
    tracksCount: 1,
    description: "Visionary avant-garde hip-hop opus featuring 'Father Stretch My Hands Pt. 1'.",
    spotifyAlbumId: "7v2W0K9m5m6j4x8q1v2z3b"
  },
  {
    id: "album-808s",
    title: "808s & Heartbreak",
    artist: "Kanye West",
    year: 2008,
    cover: "./music/covers/kanye_808s.jpg",
    genre: "Electropop / R&B",
    tracksCount: 1,
    description: "Pioneering auto-tuned emotional synth journey featuring the iconic single 'Heartless'.",
    spotifyAlbumId: "3AHe3O07i70559j1t6y3fC"
  },
  {
    id: "album-views",
    title: "Views",
    artist: "Drake",
    year: 2016,
    cover: "./music/covers/drake_views.jpg",
    genre: "Hip Hop / Dancehall / R&B",
    tracksCount: 1,
    description: "Record-breaking chart-topping album featuring the global #1 smash 'One Dance'.",
    spotifyAlbumId: "40GMAhRIYAKKVx693mIR1t"
  },
  {
    id: "album-scorpion",
    title: "Scorpion",
    artist: "Drake",
    year: 2018,
    cover: "./music/covers/drake_scorpion.jpg",
    genre: "Hip Hop / Trap / R&B",
    tracksCount: 1,
    description: "Double album blockbuster featuring the diamond-certified mega-hit 'God\\'s Plan'.",
    spotifyAlbumId: "1ATL5GLyef8AJ009xOFM03"
  },
  {
    id: "album-more-life",
    title: "More Life",
    artist: "Drake",
    year: 2017,
    cover: "./music/covers/drake_more_life.jpg",
    genre: "Dancehall / Afrobeat / Trap",
    tracksCount: 1,
    description: "Vibrant global playlist featuring the lush tropical grooves of 'Passionfruit'.",
    spotifyAlbumId: "1YXjhT6wK2K0q4w8y2j5V1"
  },
  {
    id: "album-damn",
    title: "DAMN.",
    artist: "Kendrick Lamar",
    year: 2017,
    cover: "./music/covers/kendrick_damn.jpg",
    genre: "Hip Hop / Conscious Rap",
    tracksCount: 1,
    description: "Pulitzer Prize-winning masterpiece featuring the colossal #1 hit 'HUMBLE.'.",
    spotifyAlbumId: "4eLPsYPBmXABThSJuc2NdL"
  },
  {
    id: "album-not-like-us",
    title: "Not Like Us",
    artist: "Kendrick Lamar",
    year: 2024,
    cover: "./music/covers/kendrick_not_like_us.jpg",
    genre: "West Coast Hip Hop",
    tracksCount: 1,
    description: "Historic cultural phenomenon and Mustard-produced West Coast anthem 'Not Like Us'.",
    spotifyAlbumId: "6AI3ezQ4o3HUJW8NuEGdhst"
  },
  {
    id: "album-astroworld",
    title: "ASTROWORLD",
    artist: "Travis Scott",
    year: 2018,
    cover: "./music/covers/travis_astroworld.jpg",
    genre: "Psychedelic Trap",
    tracksCount: 1,
    description: "Psychedelic trap landmark featuring the diamond smash hit 'SICKO MODE' with Drake.",
    spotifyAlbumId: "41GuZcammIkupRtYGDsvVa"
  },
  {
    id: "album-utopia",
    title: "UTOPIA",
    artist: "Travis Scott",
    year: 2023,
    cover: "./music/covers/travis_utopia.jpg",
    genre: "Rage / Industrial Trap",
    tracksCount: 1,
    description: "Atmospheric industrial trap juggernaut featuring the viral festival anthem 'FE!N'.",
    spotifyAlbumId: "18NOKLkZETSb4AGMyqw7Aw"
  },
  {
    id: "album-blonde",
    title: "Blonde",
    artist: "Frank Ocean",
    year: 2016,
    cover: "./music/covers/frank_blonde.jpg",
    genre: "Avant-Garde R&B / Neo Soul",
    tracksCount: 2,
    description: "Universally acclaimed modern classic featuring masterpieces 'Pink + White' and 'Nights'.",
    spotifyAlbumId: "3mH6qwIy9crq0I9YQbOuDf"
  },
  {
    id: "album-gemini-rights",
    title: "Gemini Rights",
    artist: "Steve Lacy",
    year: 2022,
    cover: "./music/covers/steve_gemini_rights.jpg",
    genre: "Indie R&B / Psychedelic Funk",
    tracksCount: 1,
    description: "Grammy Award-winning Best Progressive R&B Album featuring the global smash 'Bad Habit'.",
    spotifyAlbumId: "6Ibtb98jN4C02i8u1q7z3j"
  },
  {
    id: "album-steve-demo",
    title: "Steve Lacy's Demo",
    artist: "Steve Lacy",
    year: 2017,
    cover: "./music/covers/steve_demo.jpg",
    genre: "Lo-fi Soul / GarageBand R&B",
    tracksCount: 1,
    description: "Groundbreaking iPhone-produced debut EP featuring the beloved signature song 'Dark Red'.",
    spotifyAlbumId: "2jG5q0m44v8b1q0u9z3l5m"
  },
  {
    id: "album-after-hours",
    title: "After Hours",
    artist: "The Weeknd",
    year: 2020,
    cover: "./music/covers/weeknd_after_hours.jpg",
    genre: "Synthwave / R&B / Pop",
    tracksCount: 1,
    description: "Record-shattering 80s synthwave renaissance featuring Billboard's #1 Greatest Hot 100 Song 'Blinding Lights'.",
    spotifyAlbumId: "4yP0hdKOZPNshxUOjY0cZj"
  },
  {
    id: "album-hit-me-hard",
    title: "HIT ME HARD AND SOFT",
    artist: "Billie Eilish",
    year: 2024,
    cover: "./music/covers/billie_hit_me_hard.jpg",
    genre: "Indie Pop / Alternative",
    tracksCount: 1,
    description: "Critically exalted third studio album featuring the multi-platinum worldwide smash 'BIRDS OF A FEATHER'.",
    spotifyAlbumId: "7aJuG4MyrZwUr4GeSYaqYq"
  }
];

export const REAL_MUSIC_CATALOG: MusicTrack[] = [
  // 1. Tyler, The Creator - See You Again
  {
    id: "track-tyler-see-you-again",
    title: "See You Again (feat. Kali Uchis)",
    artist: "Tyler, The Creator",
    album: "Flower Boy",
    year: 2017,
    duration: "3:00",
    durationSec: 180,
    cover: "./music/covers/tyler_flower_boy.jpg",
    genre: "Hip Hop / Neo Soul",
    audioSrc: "./music/tyler_see_you_again.mp3",
    spotifyId: "7KA4W4McWYRpgf0fWsTGwb",
    youtubeId: "TGgcC5393hw",
    albumId: "album-flower-boy",
    trackNumber: 4,
    hasLocalAudio: true
  },
  // 2. Tyler, The Creator - EARFQUAKE
  {
    id: "track-tyler-earfquake",
    title: "EARFQUAKE",
    artist: "Tyler, The Creator",
    album: "IGOR",
    year: 2019,
    duration: "3:10",
    durationSec: 190,
    cover: "./music/covers/tyler_igor.jpg",
    genre: "Experimental Hip Hop / Funk",
    audioSrc: "./music/tyler_earfquake.mp3",
    spotifyId: "5hVghJ4Ka5hyGsHaV7v0Zu",
    youtubeId: "hmYvgvYqg2g",
    albumId: "album-igor",
    trackNumber: 2,
    hasLocalAudio: true
  },
  // 3. Tyler, The Creator - NEW MAGIC WAND
  {
    id: "track-tyler-new-magic-wand",
    title: "NEW MAGIC WAND",
    artist: "Tyler, The Creator",
    album: "IGOR",
    year: 2019,
    duration: "3:15",
    durationSec: 195,
    cover: "./music/covers/tyler_igor.jpg",
    genre: "Experimental Hip Hop / Industrial",
    audioSrc: "./music/tyler_new_magic_wand.mp3",
    spotifyId: "0GwFtqN22y41j2k9L5h2o7",
    youtubeId: "vC2k3w0G-bA",
    albumId: "album-igor",
    trackNumber: 6,
    hasLocalAudio: true
  },
  // 4. Alex G - Sarah
  {
    id: "track-alex-g-sarah",
    title: "Sarah",
    artist: "Alex G",
    album: "Trick",
    year: 2012,
    duration: "2:56",
    durationSec: 176,
    cover: "./music/covers/alex_g_trick.jpg",
    genre: "Indie Rock / Lo-Fi",
    audioSrc: "./music/alex_g_sarah.mp3",
    spotifyId: "3vV84GZ9m38l0Zk941jK2A",
    youtubeId: "P_z_y3b01rU",
    albumId: "album-trick",
    trackNumber: 4,
    hasLocalAudio: true
  },
  // 5. Alex G - Mary
  {
    id: "track-alex-g-mary",
    title: "Mary",
    artist: "Alex G",
    album: "Trick",
    year: 2012,
    duration: "3:14",
    durationSec: 194,
    cover: "./music/covers/alex_g_trick.jpg",
    genre: "Indie Rock / Bedroom Pop",
    audioSrc: "./music/alex_g_mary.mp3",
    spotifyId: "1g10N2z398hK8k401m21Vb",
    youtubeId: "mN2v0Z9bK3Q",
    albumId: "album-trick",
    trackNumber: 12,
    hasLocalAudio: true
  },
  // 6. Alex G - Treehouse
  {
    id: "track-alex-g-treehouse",
    title: "Treehouse (feat. Emily Yacina)",
    artist: "Alex G",
    album: "Trick",
    year: 2012,
    duration: "3:02",
    durationSec: 182,
    cover: "./music/covers/alex_g_trick.jpg",
    genre: "Indie Folk / Lo-Fi",
    audioSrc: "./music/alex_g_treehouse.mp3",
    spotifyId: "2bK24nUaDk5a5Gj01l1mNp",
    youtubeId: "9GZ37Z01y5s",
    albumId: "album-trick",
    trackNumber: 16,
    hasLocalAudio: true
  },
  // 7. Alex G - Pretend
  {
    id: "track-alex-g-pretend",
    title: "Pretend (Bonus Track)",
    artist: "Alex G",
    album: "House of Sugar",
    year: 2019,
    duration: "2:48",
    durationSec: 168,
    cover: "./music/covers/alex_g_house_of_sugar.jpg",
    genre: "Art Pop / Experimental Indie",
    audioSrc: "./music/alex_g_pretend.mp3",
    spotifyId: "1LhM21o558lH7j0qVv9n3z",
    youtubeId: "0z2_v3T8Kjo",
    albumId: "album-house-of-sugar",
    trackNumber: 14,
    hasLocalAudio: true
  },
  // 8. Kanye West - Stronger
  {
    id: "track-kanye-stronger",
    title: "Stronger",
    artist: "Kanye West",
    album: "Graduation",
    year: 2007,
    duration: "5:12",
    durationSec: 312,
    cover: "./music/covers/kanye_graduation.jpg",
    genre: "Hip Hop / Synthpop",
    audioSrc: "./music/kanye_stronger.mp3",
    spotifyId: "4fzsfWzRhPawzqhXZdoJwR",
    youtubeId: "PsO6ZnUZI0g",
    albumId: "album-graduation",
    trackNumber: 3,
    hasLocalAudio: true
  },
  // 9. Kanye West - Flashing Lights
  {
    id: "track-kanye-flashing-lights",
    title: "Flashing Lights (feat. Dwele)",
    artist: "Kanye West",
    album: "Graduation",
    year: 2007,
    duration: "3:57",
    durationSec: 237,
    cover: "./music/covers/kanye_graduation.jpg",
    genre: "Hip Hop / Synthpop",
    audioSrc: "./music/kanye_flashing_lights.mp3",
    spotifyId: "3ZrA01j42k9Wq652lK7g0p",
    youtubeId: "ila-hAUXR5U",
    albumId: "album-graduation",
    trackNumber: 8,
    hasLocalAudio: true
  },
  // 10. Kanye West - Father Stretch My Hands Pt. 1
  {
    id: "track-kanye-father-stretch",
    title: "Father Stretch My Hands Pt. 1",
    artist: "Kanye West",
    album: "The Life of Pablo",
    year: 2016,
    duration: "2:15",
    durationSec: 135,
    cover: "./music/covers/kanye_tlop.jpg",
    genre: "Hip Hop / Gospel Rap",
    audioSrc: "./music/kanye_father_stretch.mp3",
    spotifyId: "4a9t0Vv9n21oK7h52bJ8r0",
    youtubeId: "p7FCgw_GlWc",
    albumId: "album-the-life-of-pablo",
    trackNumber: 2,
    hasLocalAudio: true
  },
  // 11. Kanye West - Heartless
  {
    id: "track-kanye-heartless",
    title: "Heartless",
    artist: "Kanye West",
    album: "808s & Heartbreak",
    year: 2008,
    duration: "3:31",
    durationSec: 211,
    cover: "./music/covers/kanye_808s.jpg",
    genre: "Electropop / R&B",
    audioSrc: "./music/kanye_heartless.mp3",
    spotifyId: "4xkOaSrk2Qmh6xHxipbFdu",
    youtubeId: "Co0tTeuUVhU",
    albumId: "album-808s",
    trackNumber: 3,
    hasLocalAudio: true
  },
  // 12. Drake - One Dance
  {
    id: "track-drake-one-dance",
    title: "One Dance (feat. Wizkid & Kyla)",
    artist: "Drake",
    album: "Views",
    year: 2016,
    duration: "2:54",
    durationSec: 174,
    cover: "./music/covers/drake_views.jpg",
    genre: "Hip Hop / Dancehall / R&B",
    audioSrc: "./music/drake_one_dance.mp3",
    spotifyId: "1zi7xx7UVEIRvmflVIwY8g",
    youtubeId: "qL7ZRox89hk",
    albumId: "album-views",
    trackNumber: 12,
    hasLocalAudio: true
  },
  // 13. Drake - God's Plan
  {
    id: "track-drake-gods-plan",
    title: "God's Plan",
    artist: "Drake",
    album: "Scorpion",
    year: 2018,
    duration: "3:18",
    durationSec: 198,
    cover: "./music/covers/drake_scorpion.jpg",
    genre: "Hip Hop / Trap / R&B",
    audioSrc: "./music/drake_gods_plan.mp3",
    spotifyId: "6DCZcSspjsKoFjzjrWoCdn",
    youtubeId: "xpVfcZ0ZcFM",
    albumId: "album-scorpion",
    trackNumber: 5,
    hasLocalAudio: true
  },
  // 14. Drake - Passionfruit
  {
    id: "track-drake-passionfruit",
    title: "Passionfruit",
    artist: "Drake",
    album: "More Life",
    year: 2017,
    duration: "4:58",
    durationSec: 298,
    cover: "./music/covers/drake_more_life.jpg",
    genre: "Dancehall / Afrobeat / Trap",
    audioSrc: "./music/drake_passionfruit.mp3",
    spotifyId: "5mCPDfpCDVLV4vyVRcuPt8",
    youtubeId: "COz9lDCFHjw",
    albumId: "album-more-life",
    trackNumber: 3,
    hasLocalAudio: true
  },
  // 15. Kendrick Lamar - HUMBLE.
  {
    id: "track-kendrick-humble",
    title: "HUMBLE.",
    artist: "Kendrick Lamar",
    album: "DAMN.",
    year: 2017,
    duration: "2:57",
    durationSec: 177,
    cover: "./music/covers/kendrick_damn.jpg",
    genre: "Hip Hop / Conscious Rap",
    audioSrc: "./music/kendrick_humble.mp3",
    spotifyId: "7KXjTSCq5nL1LoYtL7XAwS",
    youtubeId: "tvTRZJ-4EyI",
    albumId: "album-damn",
    trackNumber: 8,
    hasLocalAudio: true
  },
  // 16. Kendrick Lamar - Not Like Us
  {
    id: "track-kendrick-not-like-us",
    title: "Not Like Us",
    artist: "Kendrick Lamar",
    album: "Not Like Us (Single)",
    year: 2024,
    duration: "4:34",
    durationSec: 274,
    cover: "./music/covers/kendrick_not_like_us.jpg",
    genre: "West Coast Hip Hop",
    audioSrc: "./music/kendrick_not_like_us.mp3",
    spotifyId: "6AI3ezQ4o3HUJW8NuEGdhst",
    youtubeId: "H58vbez_m4E",
    albumId: "album-not-like-us",
    trackNumber: 1,
    hasLocalAudio: true
  },
  // 17. Travis Scott - SICKO MODE
  {
    id: "track-travis-sicko-mode",
    title: "SICKO MODE (feat. Drake)",
    artist: "Travis Scott",
    album: "ASTROWORLD",
    year: 2018,
    duration: "5:12",
    durationSec: 312,
    cover: "./music/covers/travis_astroworld.jpg",
    genre: "Psychedelic Trap",
    audioSrc: "./music/travis_sicko_mode.mp3",
    spotifyId: "2xLMifvVDvm3f2SThtS73Y",
    youtubeId: "6ONRf7h3Mdk",
    albumId: "album-astroworld",
    trackNumber: 3,
    hasLocalAudio: true
  },
  // 18. Travis Scott - FE!N
  {
    id: "track-travis-fein",
    title: "FE!N (feat. Playboi Carti)",
    artist: "Travis Scott",
    album: "UTOPIA",
    year: 2023,
    duration: "3:11",
    durationSec: 191,
    cover: "./music/covers/travis_utopia.jpg",
    genre: "Rage / Industrial Trap",
    audioSrc: "./music/travis_fein.mp3",
    spotifyId: "42VsgItocQwOQC3XWZ8J43",
    youtubeId: "B9synWjqBn8",
    albumId: "album-utopia",
    trackNumber: 8,
    hasLocalAudio: true
  },
  // 19. Frank Ocean - Pink + White
  {
    id: "track-frank-pink-white",
    title: "Pink + White",
    artist: "Frank Ocean",
    album: "Blonde",
    year: 2016,
    duration: "3:04",
    durationSec: 184,
    cover: "./music/covers/frank_blonde.jpg",
    genre: "Avant-Garde R&B / Neo Soul",
    audioSrc: "./music/frank_ocean_pink_white.mp3",
    spotifyId: "3xKsf9qdS1CyvXS5ip9R5w",
    youtubeId: "uzS3WG6__G4",
    albumId: "album-blonde",
    trackNumber: 3,
    hasLocalAudio: true
  },
  // 20. Frank Ocean - Nights
  {
    id: "track-frank-nights",
    title: "Nights",
    artist: "Frank Ocean",
    album: "Blonde",
    year: 2016,
    duration: "5:07",
    durationSec: 307,
    cover: "./music/covers/frank_blonde.jpg",
    genre: "Avant-Garde R&B / Neo Soul",
    audioSrc: "./music/frank_ocean_nights.mp3",
    spotifyId: "7eqoqGkKwgOaWNNHx90uEZ",
    youtubeId: "r4l9bFqgMaQ",
    albumId: "album-blonde",
    trackNumber: 9,
    hasLocalAudio: true
  },
  // 21. Steve Lacy - Bad Habit
  {
    id: "track-steve-bad-habit",
    title: "Bad Habit",
    artist: "Steve Lacy",
    album: "Gemini Rights",
    year: 2022,
    duration: "3:52",
    durationSec: 232,
    cover: "./music/covers/steve_gemini_rights.jpg",
    genre: "Indie R&B / Psychedelic Funk",
    audioSrc: "./music/steve_lacy_bad_habit.mp3",
    spotifyId: "4PgGfcx0T38qK2q0j21K9W",
    youtubeId: "VF-FGy_M80v",
    albumId: "album-gemini-rights",
    trackNumber: 5,
    hasLocalAudio: true
  },
  // 22. Steve Lacy - Dark Red
  {
    id: "track-steve-dark-red",
    title: "Dark Red",
    artist: "Steve Lacy",
    album: "Steve Lacy's Demo",
    year: 2017,
    duration: "2:53",
    durationSec: 173,
    cover: "./music/covers/steve_demo.jpg",
    genre: "Lo-fi Soul / GarageBand R&B",
    audioSrc: "./music/steve_lacy_dark_red.mp3",
    spotifyId: "37NqxuvCPSk82vY1nU2r8g",
    youtubeId: "xrvS8Y7T36k",
    albumId: "album-steve-demo",
    trackNumber: 3,
    hasLocalAudio: true
  },
  // 23. The Weeknd - Blinding Lights
  {
    id: "track-weeknd-blinding-lights",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    year: 2020,
    duration: "3:20",
    durationSec: 200,
    cover: "./music/covers/weeknd_after_hours.jpg",
    genre: "Synthwave / R&B / Pop",
    audioSrc: "./music/weeknd_blinding_lights.mp3",
    spotifyId: "0VjIjW4GlUZAMYd2vXMi3b",
    youtubeId: "4NRXx6U8ABQ",
    albumId: "album-after-hours",
    trackNumber: 9,
    hasLocalAudio: true
  },
  // 24. Billie Eilish - BIRDS OF A FEATHER
  {
    id: "track-billie-birds-of-a-feather",
    title: "BIRDS OF A FEATHER",
    artist: "Billie Eilish",
    album: "HIT ME HARD AND SOFT",
    year: 2024,
    duration: "3:30",
    durationSec: 210,
    cover: "./music/covers/billie_hit_me_hard.jpg",
    genre: "Indie Pop / Alternative",
    audioSrc: "./music/billie_birds_of_a_feather.mp3",
    spotifyId: "6dOtVTDmmp49JWUtN443Qe",
    youtubeId: "V9PVRfjEBTI",
    albumId: "album-hit-me-hard",
    trackNumber: 4,
    hasLocalAudio: true
  }
];
