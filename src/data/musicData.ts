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
  // Tyler, The Creator
  {
    id: 'album-flower-boy',
    title: 'Flower Boy',
    artist: 'Tyler, The Creator',
    year: 2017,
    cover: '/music/covers/tyler_flower_boy.jpg',
    genre: 'Hip Hop / Neo Soul',
    tracksCount: 14,
    description: 'Grammy-nominated milestone album featuring See You Again, 911 / Mr. Lonely, and Boredom.'
  },
  {
    id: 'album-igor',
    title: 'IGOR',
    artist: 'Tyler, The Creator',
    year: 2019,
    cover: '/music/covers/tyler_igor.jpg',
    genre: 'Experimental Hip Hop / Funk',
    tracksCount: 12,
    description: 'Grammy Award-winning Best Rap Album featuring EARFQUAKE, NEW MAGIC WAND, and A BOY IS A GUN*.'
  },
  {
    id: 'album-cmiygl',
    title: 'CALL ME IF YOU GET LOST',
    artist: 'Tyler, The Creator',
    year: 2021,
    cover: '/music/covers/tyler_cmiygl.jpg',
    genre: 'Hip Hop / Rap',
    tracksCount: 16,
    description: 'Hosted by DJ Drama, acclaimed follow-up featuring LUMBERJACK, WUSYANAME, and JUGGERNAUT.'
  },

  // Alex G
  {
    id: 'album-trick',
    title: 'Trick',
    artist: 'Alex G',
    year: 2012,
    cover: '/music/covers/alex_g_trick.jpg',
    genre: 'Indie Rock / Lo-fi',
    tracksCount: 16,
    description: 'Breakout underground bedroom indie record featuring Mary, Sarah, Whale, and Advice.'
  },
  {
    id: 'album-house-of-sugar',
    title: 'House of Sugar',
    artist: 'Alex G',
    year: 2019,
    cover: '/music/covers/alex_g_house_of_sugar.jpg',
    genre: 'Art Pop / Experimental Indie',
    tracksCount: 13,
    description: 'Critically acclaimed 2019 release featuring Hope, Gretel, Southern Sky, and Pretend.'
  },
  {
    id: 'album-god-save-the-animals',
    title: 'God Save the Animals',
    artist: 'Alex G',
    year: 2022,
    cover: '/music/covers/alex_g_god_save.jpg',
    genre: 'Indie Rock / Electronic',
    tracksCount: 13,
    description: 'Masterwork ninth studio album featuring Runner, Miracles, and Cross the Sea.'
  },

  // Kanye West
  {
    id: 'album-graduation',
    title: 'Graduation',
    artist: 'Kanye West',
    year: 2007,
    cover: '/music/covers/kanye_graduation.jpg',
    genre: 'Hip Hop / Synthpop',
    tracksCount: 13,
    description: 'Stadium status classic featuring Stronger, Flashing Lights, Good Morning, and Can\'t Tell Me Nothing.'
  },
  {
    id: 'album-the-life-of-pablo',
    title: 'The Life of Pablo',
    artist: 'Kanye West',
    year: 2016,
    cover: '/music/covers/kanye_tlop.jpg',
    genre: 'Hip Hop / Gospel Rap',
    tracksCount: 20,
    description: 'Pioneering living album featuring Father Stretch My Hands Pt. 1, Ultralight Beam, and Famous.'
  },
  {
    id: 'album-808s',
    title: '808s & Heartbreak',
    artist: 'Kanye West',
    year: 2008,
    cover: '/music/covers/kanye_808s.jpg',
    genre: 'Electropop / R&B',
    tracksCount: 12,
    description: 'Genre-defining emotional masterpiece featuring Heartless, Love Lockdown, and Street Lights.'
  },

  // Drake
  {
    id: 'album-views',
    title: 'Views',
    artist: 'Drake',
    year: 2016,
    cover: '/music/covers/drake_views.jpg',
    genre: 'Hip Hop / Dancehall / R&B',
    tracksCount: 20,
    description: 'Blockbuster multi-platinum album featuring One Dance, Hotline Bling, and Controlla.'
  },
  {
    id: 'album-scorpion',
    title: 'Scorpion',
    artist: 'Drake',
    year: 2018,
    cover: '/music/covers/drake_scorpion.jpg',
    genre: 'Hip Hop / Trap / R&B',
    tracksCount: 25,
    description: 'Record-shattering double album featuring God\'s Plan, In My Feelings, and Nonstop.'
  },
  {
    id: 'album-more-life',
    title: 'More Life',
    artist: 'Drake',
    year: 2017,
    cover: '/music/covers/drake_more_life.jpg',
    genre: 'Dancehall / Afrobeat / Trap',
    tracksCount: 22,
    description: 'Global playlist project featuring Passionfruit, Blem, Fake Love, and Get It Together.'
  },

  // Kendrick Lamar
  {
    id: 'album-damn',
    title: 'DAMN.',
    artist: 'Kendrick Lamar',
    year: 2017,
    cover: '/music/covers/kendrick_damn.jpg',
    genre: 'Hip Hop / Conscious Rap',
    tracksCount: 14,
    description: 'Pulitzer Prize-winning album featuring HUMBLE., DNA., LOYALTY., and LOVE.'
  },
  {
    id: 'album-gkmc',
    title: 'good kid, m.A.A.d city',
    artist: 'Kendrick Lamar',
    year: 2012,
    cover: '/music/covers/kendrick_gkmc.jpg',
    genre: 'West Coast Hip Hop',
    tracksCount: 12,
    description: 'A short film by Kendrick Lamar featuring Swimming Pools (Drank), Bitch Don\'t Kill My Vibe, and Money Trees.'
  },
  {
    id: 'album-not-like-us',
    title: 'Not Like Us (Single)',
    artist: 'Kendrick Lamar',
    year: 2024,
    cover: '/music/covers/kendrick_not_like_us.jpg',
    genre: 'West Coast Hip Hop',
    tracksCount: 1,
    description: 'Historical Billboard #1 anthem and cultural rap phenomenon produced by Mustard.'
  },

  // Travis Scott
  {
    id: 'album-astroworld',
    title: 'ASTROWORLD',
    artist: 'Travis Scott',
    year: 2018,
    cover: '/music/covers/travis_astroworld.jpg',
    genre: 'Psychedelic Trap',
    tracksCount: 17,
    description: 'Diamond-certified amusement park epic featuring SICKO MODE, Stargazing, and Butterfly Effect.'
  },
  {
    id: 'album-utopia',
    title: 'UTOPIA',
    artist: 'Travis Scott',
    year: 2023,
    cover: '/music/covers/travis_utopia.jpg',
    genre: 'Rage / Industrial Trap',
    tracksCount: 19,
    description: 'High-concept sonic expedition featuring FE!N, I KNOW ?, MELTDOWN, and TELEKINESIS.'
  },

  // Frank Ocean
  {
    id: 'album-blonde',
    title: 'Blonde',
    artist: 'Frank Ocean',
    year: 2016,
    cover: '/music/covers/frank_blonde.jpg',
    genre: 'Avant-Garde R&B / Neo Soul',
    tracksCount: 17,
    description: 'Generational masterpiece featuring Pink + White, Nights, Ivy, and Self Control.'
  },
  {
    id: 'album-channel-orange',
    title: 'Channel Orange',
    artist: 'Frank Ocean',
    year: 2012,
    cover: '/music/covers/frank_channel_orange.jpg',
    genre: 'R&B / Soul',
    tracksCount: 17,
    description: 'Grammy Award-winning debut featuring Thinkin Bout You, Pyramids, Lost, and Super Rich Kids.'
  },

  // Steve Lacy
  {
    id: 'album-gemini-rights',
    title: 'Gemini Rights',
    artist: 'Steve Lacy',
    year: 2022,
    cover: '/music/covers/steve_gemini_rights.jpg',
    genre: 'Indie R&B / Psychedelic Funk',
    tracksCount: 10,
    description: 'Grammy-winning breakthrough album featuring Billboard #1 smash Bad Habit, Static, and Sunshine.'
  },
  {
    id: 'album-steve-demo',
    title: "Steve Lacy's Demo",
    artist: 'Steve Lacy',
    year: 2017,
    cover: '/music/covers/steve_demo.jpg',
    genre: 'Lo-fi Soul / GarageBand R&B',
    tracksCount: 6,
    description: 'Pioneering iPhone-produced project featuring eternal viral favorite Dark Red.'
  },

  // The Weeknd
  {
    id: 'album-after-hours',
    title: 'After Hours',
    artist: 'The Weeknd',
    year: 2020,
    cover: '/music/covers/weeknd_after_hours.jpg',
    genre: 'Synthwave / R&B / Pop',
    tracksCount: 14,
    description: 'Cinematic red-suit classic featuring Blinding Lights, Save Your Tears, and Heartless.'
  },
  {
    id: 'album-starboy',
    title: 'Starboy',
    artist: 'The Weeknd',
    year: 2016,
    cover: '/music/covers/weeknd_starboy.jpg',
    genre: 'Electropop / R&B',
    tracksCount: 18,
    description: 'Daft Punk-collaborated phenomenon featuring Starboy, I Feel It Coming, and Reminder.'
  },

  // Billie Eilish
  {
    id: 'album-hit-me-hard',
    title: 'HIT ME HARD AND SOFT',
    artist: 'Billie Eilish',
    year: 2024,
    cover: '/music/covers/billie_hit_me_hard.jpg',
    genre: 'Indie Pop / Alternative',
    tracksCount: 10,
    description: 'Critically lauded third studio album featuring BIRDS OF A FEATHER, LUNCH, and CHIHIRO.'
  },
  {
    id: 'album-when-we-all-fall',
    title: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    artist: 'Billie Eilish',
    year: 2019,
    cover: '/music/covers/billie_when_we_all_fall.jpg',
    genre: 'Dark Pop / Electropop',
    tracksCount: 14,
    description: 'Grammy Album of the Year sweeper featuring bad guy, bury a friend, and when the party\'s over.'
  }
];

export const REAL_MUSIC_CATALOG: MusicTrack[] = [
  // Tyler, The Creator
  {
    id: 'tyler-see-you-again',
    title: 'See You Again (feat. Kali Uchis)',
    artist: 'Tyler, The Creator',
    album: 'Flower Boy',
    year: 2017,
    duration: '3:00',
    durationSec: 180,
    cover: '/music/covers/tyler_flower_boy.jpg',
    genre: 'Hip Hop / Neo Soul',
    audioSrc: '/music/tyler_see_you_again.mp3',
    spotifyId: '7KA4W4McWYR5T022cwAzPt',
    youtubeId: 'TGgcC53fjY8',
    albumId: 'album-flower-boy'
  },
  {
    id: 'tyler-earfquake',
    title: 'EARFQUAKE',
    artist: 'Tyler, The Creator',
    album: 'IGOR',
    year: 2019,
    duration: '3:10',
    durationSec: 190,
    cover: '/music/covers/tyler_igor.jpg',
    genre: 'Neo Soul / Funk',
    audioSrc: '/music/tyler_earfquake.mp3',
    spotifyId: '5hVghJ4Ka5hyGsHaV7v0Zu',
    youtubeId: 'HmAsUQEFYGI',
    albumId: 'album-igor'
  },
  {
    id: 'tyler-new-magic-wand',
    title: 'NEW MAGIC WAND',
    artist: 'Tyler, The Creator',
    album: 'IGOR',
    year: 2019,
    duration: '3:15',
    durationSec: 195,
    cover: '/music/covers/tyler_igor.jpg',
    genre: 'Experimental Hip Hop',
    audioSrc: '/music/tyler_new_magic_wand.mp3',
    spotifyId: '0fvA1Q8eD8Jk88a0vXzHjR',
    youtubeId: 'WkR95yE0z_w',
    albumId: 'album-igor'
  },

  // Alex G
  {
    id: 'alex-g-mary',
    title: 'Mary',
    artist: 'Alex G',
    album: 'Trick',
    year: 2012,
    duration: '3:16',
    durationSec: 196,
    cover: '/music/covers/alex_g_trick.jpg',
    genre: 'Indie Rock / Lo-fi',
    audioSrc: '/music/alex_g_mary.mp3',
    spotifyId: '77Yx0bFh9Vq761bJ8r3g9p',
    youtubeId: 'r5c13kZ708k',
    albumId: 'album-trick'
  },
  {
    id: 'alex-g-treehouse',
    title: 'Treehouse',
    artist: 'Alex G',
    album: 'Trick',
    year: 2011,
    duration: '2:12',
    durationSec: 132,
    cover: '/music/covers/alex_g_trick.jpg',
    genre: 'Indie Pop / Acoustic',
    audioSrc: '/music/alex_g_treehouse.mp3',
    spotifyId: '2bK24nUaDk5a5Gj01l1mNp',
    youtubeId: '9GZ37Z01y5s',
    albumId: 'album-trick'
  },
  {
    id: 'alex-g-sarah',
    title: 'Sarah',
    artist: 'Alex G',
    album: 'Trick',
    year: 2012,
    duration: '2:55',
    durationSec: 175,
    cover: '/music/covers/alex_g_trick.jpg',
    genre: 'Indie Rock',
    audioSrc: '/music/alex_g_sarah.mp3',
    spotifyId: '57lPz84Wv5h762bH7g0p',
    youtubeId: 'mO4B17L44y0',
    albumId: 'album-trick'
  },
  {
    id: 'alex-g-pretend',
    title: 'Pretend',
    artist: 'Alex G',
    album: 'House of Sugar',
    year: 2014,
    duration: '2:48',
    durationSec: 168,
    cover: '/music/covers/alex_g_house_of_sugar.jpg',
    genre: 'Lo-fi Bedroom Pop',
    audioSrc: '/music/alex_g_pretend.mp3',
    spotifyId: '1LhM21o558lH7j0qVv9n3z',
    youtubeId: '0z2_v3T8Kjo',
    albumId: 'album-house-of-sugar'
  },

  // Kanye West
  {
    id: 'kanye-flashing-lights',
    title: 'Flashing Lights',
    artist: 'Kanye West',
    album: 'Graduation',
    year: 2007,
    duration: '3:57',
    durationSec: 237,
    cover: '/music/covers/kanye_graduation.jpg',
    genre: 'Hip Hop / Synthpop',
    audioSrc: '/music/kanye_flashing_lights.mp3',
    spotifyId: '3ZrA01j42k9Wq652lK7g0p',
    youtubeId: 'ila-hAUXR5U',
    albumId: 'album-graduation'
  },
  {
    id: 'kanye-father-stretch',
    title: 'Father Stretch My Hands Pt. 1',
    artist: 'Kanye West',
    album: 'The Life of Pablo',
    year: 2016,
    duration: '2:15',
    durationSec: 135,
    cover: '/music/covers/kanye_tlop.jpg',
    genre: 'Hip Hop / Gospel Rap',
    audioSrc: '/music/kanye_father_stretch.mp3',
    spotifyId: '4a9t0Vv9n21oK7h52bJ8r0',
    youtubeId: 'p7FCgw_GlWc',
    albumId: 'album-the-life-of-pablo'
  },
  {
    id: 'kanye-stronger',
    title: 'Stronger',
    artist: 'Kanye West',
    album: 'Graduation',
    year: 2007,
    duration: '5:12',
    durationSec: 312,
    cover: '/music/covers/kanye_graduation.jpg',
    genre: 'Electro Hip Hop',
    audioSrc: '/music/kanye_stronger.mp3',
    spotifyId: '4fzsfWzRhPawzqhXZdoJwR',
    youtubeId: 'PsO6ZnUZI0g',
    albumId: 'album-graduation'
  },
  {
    id: 'kanye-heartless',
    title: 'Heartless',
    artist: 'Kanye West',
    album: '808s & Heartbreak',
    year: 2008,
    duration: '3:31',
    durationSec: 211,
    cover: '/music/covers/kanye_808s.jpg',
    genre: 'Electropop / R&B',
    audioSrc: '/music/kanye_heartless.mp3',
    spotifyId: '4xkOaSrk2Qmh6xHxipbFdu',
    youtubeId: 'Co0tTeuUVhU',
    albumId: 'album-808s'
  },

  // Drake
  {
    id: 'drake-gods-plan',
    title: "God's Plan",
    artist: 'Drake',
    album: 'Scorpion',
    year: 2018,
    duration: '3:18',
    durationSec: 198,
    cover: '/music/covers/drake_scorpion.jpg',
    genre: 'Hip Hop / Trap',
    audioSrc: '/music/drake_gods_plan.mp3',
    spotifyId: '6DCZcSspjsKoFjzjrWoCdn',
    youtubeId: 'xpVfcZ0ZcFM',
    albumId: 'album-scorpion'
  },
  {
    id: 'drake-passionfruit',
    title: 'Passionfruit',
    artist: 'Drake',
    album: 'More Life',
    year: 2017,
    duration: '4:58',
    durationSec: 298,
    cover: '/music/covers/drake_more_life.jpg',
    genre: 'Dancehall / R&B',
    audioSrc: '/music/drake_passionfruit.mp3',
    spotifyId: '5mCPDfpCDVLV4vyVRcuPt8',
    youtubeId: 'COz9lDCFHjw',
    albumId: 'album-more-life'
  },
  {
    id: 'drake-one-dance',
    title: 'One Dance (feat. Wizkid & Kyla)',
    artist: 'Drake',
    album: 'Views',
    year: 2016,
    duration: '2:54',
    durationSec: 174,
    cover: '/music/covers/drake_views.jpg',
    genre: 'Afrobeats / Dancehall',
    audioSrc: '/music/drake_one_dance.mp3',
    spotifyId: '1zi7xx7UVEIRvmflVIwY8g',
    youtubeId: 'qL7ZRox89hk',
    albumId: 'album-views'
  },

  // Kendrick Lamar
  {
    id: 'kendrick-not-like-us',
    title: 'Not Like Us',
    artist: 'Kendrick Lamar',
    album: 'Single',
    year: 2024,
    duration: '4:34',
    durationSec: 274,
    cover: '/music/covers/kendrick_not_like_us.jpg',
    genre: 'West Coast Hip Hop',
    audioSrc: '/music/kendrick_not_like_us.mp3',
    spotifyId: '6AI3ezQ4o3HUJW8NuEGdhst',
    youtubeId: 'H58vbez_m4E',
    albumId: 'album-not-like-us'
  },
  {
    id: 'kendrick-humble',
    title: 'HUMBLE.',
    artist: 'Kendrick Lamar',
    album: 'DAMN.',
    year: 2017,
    duration: '2:57',
    durationSec: 177,
    cover: '/music/covers/kendrick_damn.jpg',
    genre: 'Hip Hop',
    audioSrc: '/music/kendrick_humble.mp3',
    spotifyId: '7KXjTSCq5nL1LoYtL7XAwS',
    youtubeId: 'tvTRZJ-4EyI',
    albumId: 'album-damn'
  },

  // Travis Scott
  {
    id: 'travis-fein',
    title: 'FE!N (feat. Playboi Carti)',
    artist: 'Travis Scott',
    album: 'UTOPIA',
    year: 2023,
    duration: '3:11',
    durationSec: 191,
    cover: '/music/covers/travis_utopia.jpg',
    genre: 'Rage / Trap',
    audioSrc: '/music/travis_fein.mp3',
    spotifyId: '42VsgItocQwOQC3XWZ8J43',
    youtubeId: 'B9synWjqBn8',
    albumId: 'album-utopia'
  },
  {
    id: 'travis-sicko-mode',
    title: 'SICKO MODE (feat. Drake)',
    artist: 'Travis Scott',
    album: 'ASTROWORLD',
    year: 2018,
    duration: '5:12',
    durationSec: 312,
    cover: '/music/covers/travis_astroworld.jpg',
    genre: 'Psychedelic Trap',
    audioSrc: '/music/travis_sicko_mode.mp3',
    spotifyId: '2xLMifvVDvm3f2SThtS73Y',
    youtubeId: '6ONRf7h3Mdk',
    albumId: 'album-astroworld'
  },

  // Frank Ocean
  {
    id: 'frank-pink-white',
    title: 'Pink + White',
    artist: 'Frank Ocean',
    album: 'Blonde',
    year: 2016,
    duration: '3:04',
    durationSec: 184,
    cover: '/music/covers/frank_blonde.jpg',
    genre: 'Neo Soul / R&B',
    audioSrc: '/music/frank_ocean_pink_white.mp3',
    spotifyId: '3xKsf9qdS1CyvXS5ip9R5w',
    youtubeId: 'uzS3WG6__G4',
    albumId: 'album-blonde'
  },
  {
    id: 'frank-nights',
    title: 'Nights',
    artist: 'Frank Ocean',
    album: 'Blonde',
    year: 2016,
    duration: '5:07',
    durationSec: 307,
    cover: '/music/covers/frank_blonde.jpg',
    genre: 'R&B / Experimental',
    audioSrc: '/music/frank_ocean_nights.mp3',
    spotifyId: '7eqoqGkKwgOaWNNHx90uEZ',
    youtubeId: 'r4l9bFqgMaQ',
    albumId: 'album-blonde'
  },

  // Steve Lacy
  {
    id: 'steve-bad-habit',
    title: 'Bad Habit',
    artist: 'Steve Lacy',
    album: 'Gemini Rights',
    year: 2022,
    duration: '3:52',
    durationSec: 232,
    cover: '/music/covers/steve_gemini_rights.jpg',
    genre: 'Indie R&B / Funk',
    audioSrc: '/music/steve_lacy_bad_habit.mp3',
    spotifyId: '4PgGfcx0T38qK2q0j21K9W',
    youtubeId: 'VF-FGy_M80v',
    albumId: 'album-gemini-rights'
  },
  {
    id: 'steve-dark-red',
    title: 'Dark Red',
    artist: 'Steve Lacy',
    album: "Steve Lacy's Demo",
    year: 2017,
    duration: '2:53',
    durationSec: 173,
    cover: '/music/covers/steve_demo.jpg',
    genre: 'Lo-fi Soul',
    audioSrc: '/music/steve_lacy_dark_red.mp3',
    spotifyId: '37NqxuvCPSk82vY1nU2r8g',
    youtubeId: 'xrvS8Y7T36k',
    albumId: 'album-steve-demo'
  },

  // The Weeknd
  {
    id: 'weeknd-blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    year: 2019,
    duration: '3:20',
    durationSec: 200,
    cover: '/music/covers/weeknd_after_hours.jpg',
    genre: 'Synthwave / Pop',
    audioSrc: '/music/weeknd_blinding_lights.mp3',
    spotifyId: '0VjIjW4GlUZAMYd2vXMi3b',
    youtubeId: '4NRXx6U8ABQ',
    albumId: 'album-after-hours'
  },

  // Billie Eilish
  {
    id: 'billie-birds-of-a-feather',
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    year: 2024,
    duration: '3:30',
    durationSec: 210,
    cover: '/music/covers/billie_hit_me_hard.jpg',
    genre: 'Indie Pop',
    audioSrc: '/music/billie_birds_of_a_feather.mp3',
    spotifyId: '6dOtVTDmmp49JWUtN443Qe',
    youtubeId: 'V9PVRfjEBTI',
    albumId: 'album-hit-me-hard'
  }
];
