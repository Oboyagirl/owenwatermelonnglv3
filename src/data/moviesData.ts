export interface MovieItem {
  id: number;
  title: string;
  mediaType: 'movie' | 'tv';
  year: number;
  rating: number;
  duration?: string;
  genres: string[];
  poster: string;
  backdrop: string;
  overview: string;
  featured?: boolean;
  trending?: boolean;
  is4k?: boolean;
  imdbId?: string;
}

export type MovieServer = 'vidlink' | 'embed123' | 'smashy' | 'movy_proxy';

export const MOVIE_SERVERS: { id: MovieServer; name: string; badge: string; desc: string }[] = [
  { id: 'vidlink', name: 'VidLink Ultra (Ad-Free)', badge: 'Default HD', desc: 'Clean 1080p/4K stream with zero inappropriate ads & no sandbox blocks' },
  { id: 'embed123', name: '123Embed Cinema', badge: 'Zero Ads', desc: 'Unrestricted ALLOWALL streaming mirror' },
  { id: 'smashy', name: 'SmashyStream Clean', badge: 'Clean Mirror', desc: 'Reliable fast multi-server cloud stream' },
  { id: 'movy_proxy', name: 'Movy SX Unblocked', badge: 'Movy SX', desc: 'Direct movy.sx proxy with X-Frame-Options stripped & anti-ad shield' }
];

export function getDirectMovyUrl(
  item: MovieItem,
  season: number = 1,
  episode: number = 1
): string {
  return item.mediaType === 'tv'
    ? `https://www.movy.sx/tv/${item.id}/${season}/${episode}`
    : `https://www.movy.sx/movie/${item.id}`;
}

export function getMovieSourceUrl(
  item: MovieItem,
  server: MovieServer = 'vidlink',
  season: number = 1,
  episode: number = 1
): string {
  const isTv = item.mediaType === 'tv';

  switch (server) {
    case 'vidlink':
      return isTv
        ? `https://vidlink.pro/tv/${item.id}/${season}/${episode}?primaryColor=06b6d4&secondaryColor=0891b2&iconColor=ffffff&autoplay=false`
        : `https://vidlink.pro/movie/${item.id}?primaryColor=06b6d4&secondaryColor=0891b2&iconColor=ffffff&autoplay=false`;

    case 'embed123':
      return isTv
        ? `https://play2.123embed.net/tv/${item.id}/${season}/${episode}`
        : `https://play2.123embed.net/movie/${item.id}`;

    case 'smashy':
      return isTv
        ? `https://anyembed.xyz/embed/tmdb-tv-${item.id}-${season}-${episode}`
        : `https://anyembed.xyz/embed/tmdb-movie-${item.id}`;

    case 'movy_proxy':
      return isTv
        ? `/api/movies/movy-stream?type=tv&id=${item.id}&s=${season}&e=${episode}`
        : `/api/movies/movy-stream?type=movie&id=${item.id}`;

    default:
      return isTv
        ? `https://vidlink.pro/tv/${item.id}/${season}/${episode}?primaryColor=06b6d4&autoplay=false`
        : `https://vidlink.pro/movie/${item.id}?primaryColor=06b6d4&autoplay=false`;
  }
}

export const MOVIE_CATEGORIES = [
  'All',
  'Trending',
  '4K Ultra HD',
  'Action',
  'Animation',
  'Sci-Fi',
  'Comedy',
  'Drama',
  'Horror',
  'TV Series',
  'Watchlist'
] as const;

export const MOVIES_CATALOG: MovieItem[] = [
  {
    "id": 533535,
    "title": "Deadpool & Wolverine",
    "mediaType": "movie",
    "year": 2024,
    "rating": 8.0,
    "duration": "2h 8m",
    "genres": [
      "Action",
      "Comedy",
      "Sci-Fi"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
    "overview": "A listless Wade Wilson toils away in civilian life until the Time Variance Authority pulls him into a new mission, forcing him to team up with an even more reluctant Wolverine.",
    "featured": true,
    "trending": true,
    "is4k": true
  },
  {
    "id": 569094,
    "title": "Spider-Man: Across the Spider-Verse",
    "mediaType": "movie",
    "year": 2023,
    "rating": 8.8,
    "duration": "2h 20m",
    "genres": [
      "Animation",
      "Action",
      "Sci-Fi"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    "overview": "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    "featured": true,
    "trending": true,
    "is4k": true
  },
  {
    "id": 693134,
    "title": "Dune: Part Two",
    "mediaType": "movie",
    "year": 2024,
    "rating": 8.5,
    "duration": "2h 46m",
    "genres": [
      "Sci-Fi",
      "Adventure",
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg",
    "overview": "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    "featured": true,
    "trending": true,
    "is4k": true
  },
  {
    "id": 872585,
    "title": "Oppenheimer",
    "mediaType": "movie",
    "year": 2023,
    "rating": 8.9,
    "duration": "3h 0m",
    "genres": [
      "Drama",
      "History",
      "Biography"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/fm6K9vYqq0YeQZxgIO9zyF6zg8s.jpg",
    "overview": "The story of J. Robert Oppenheimer role in the development of the atomic bomb during World War II.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 1022789,
    "title": "Inside Out 2",
    "mediaType": "movie",
    "year": 2024,
    "rating": 8.1,
    "duration": "1h 36m",
    "genres": [
      "Animation",
      "Family",
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/xg27NrXi79CGPVmuVgUVF74qnUV.jpg",
    "overview": "Teenager Riley headquarters undergoes a sudden demolition to make room for something unexpected: brand-new Emotions!",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 157336,
    "title": "Interstellar",
    "mediaType": "movie",
    "year": 2014,
    "rating": 8.7,
    "duration": "2h 49m",
    "genres": [
      "Sci-Fi",
      "Drama",
      "Adventure"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 155,
    "title": "The Dark Knight",
    "mediaType": "movie",
    "year": 2008,
    "rating": 9.0,
    "duration": "2h 32m",
    "genres": [
      "Action",
      "Crime",
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 66732,
    "title": "Stranger Things",
    "mediaType": "tv",
    "year": 2016,
    "rating": 8.6,
    "duration": "4 Seasons",
    "genres": [
      "Sci-Fi",
      "Horror",
      "Mystery"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    "overview": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1396,
    "title": "Breaking Bad",
    "mediaType": "tv",
    "year": 2008,
    "rating": 9.5,
    "duration": "5 Seasons",
    "genres": [
      "Drama",
      "Crime",
      "Thriller"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/9faGSFi5jam6pDWGNd0p8J2qPtZ.jpg",
    "overview": "Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and decides to enter the dangerous world of drugs to secure his family financial future.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 100088,
    "title": "The Last of Us",
    "mediaType": "tv",
    "year": 2023,
    "rating": 8.7,
    "duration": "2 Seasons",
    "genres": [
      "Drama",
      "Sci-Fi",
      "Action"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    "overview": "Twenty years after modern civilization has been destroyed, Joel is hired to smuggle Ellie out of an oppressive quarantine zone.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 94605,
    "title": "Arcane",
    "mediaType": "tv",
    "year": 2021,
    "rating": 9.0,
    "duration": "2 Seasons",
    "genres": [
      "Animation",
      "Sci-Fi",
      "Action"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/rkB4LyZHo1NHXSTXYZaCRRhFu52.jpg",
    "overview": "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 291870,
    "title": "Dirty Grandpa",
    "mediaType": "movie",
    "year": 2016,
    "rating": 5.9,
    "duration": "4K UHD",
    "genres": [
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/k0Lz1TfSlbcQthQKYGwE7blDfwN.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/yUjc0QIKJe0kyzjQ7Ky6dKRasv1.jpg",
    "overview": "Stream Dirty Grandpa in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 252747,
    "title": "The Mothers of Penguins",
    "mediaType": "tv",
    "year": 2024,
    "rating": 7.2,
    "duration": "4K UHD",
    "genres": [
      "Drama",
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/1pBeRmqnMEGlBgpjPK0OYqPw6Kg.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/aGbsulAQ4pHf2ErFKXvr01KWqYP.jpg",
    "overview": "Stream The Mothers of Penguins in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 289080,
    "title": "Rising Justice",
    "mediaType": "tv",
    "year": 2026,
    "rating": 7.8,
    "duration": "4K UHD",
    "genres": [
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/jzGDCMFErqM8Ceus8BNbyK8bzic.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/5tt435rcKQ32qtJpug4qrfG0rn.jpg",
    "overview": "Stream Rising Justice in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 42684,
    "title": "Skyline",
    "mediaType": "movie",
    "year": 2010,
    "rating": 5.1,
    "duration": "4K UHD",
    "genres": [
      "Sci-Fi",
      "Action",
      "Thriller"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/7pdUFPw76zGwDKbNpXxJknh0YWB.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/22RHzAdZDXukBBFewCOT099jZWL.jpg",
    "overview": "Stream Skyline in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 73586,
    "title": "Yellowstone",
    "mediaType": "tv",
    "year": 2018,
    "rating": 8.3,
    "duration": "4K UHD",
    "genres": [
      "Western",
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/peNC0eyc3TQJa6x4TdKcBPNP4t0.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/ynSOcgDLZfdLCZfRSYZGiTgYJVo.jpg",
    "overview": "Stream Yellowstone in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 64387,
    "title": "The Girlfriend Experience",
    "mediaType": "tv",
    "year": 2016,
    "rating": 7.0,
    "duration": "4K UHD",
    "genres": [
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/vkXG4uqXQVwfwmE6CUSPFvz6MLn.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/ucZNLBOeI7s8p23z4NnzCrZhtxa.jpg",
    "overview": "Stream The Girlfriend Experience in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 1375161,
    "title": "Don't Move",
    "mediaType": "movie",
    "year": 2026,
    "rating": 5.2,
    "duration": "4K UHD",
    "genres": [
      "Horror",
      "Thriller"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/uh0ZSdM8iOQgHwnUlhhanP8Dkl6.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/1b0wNCRLYT3mGwvHyTEbqOk98Ix.jpg",
    "overview": "Stream Don't Move in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 41956,
    "title": "Death in Paradise",
    "mediaType": "tv",
    "year": 2011,
    "rating": 7.5,
    "duration": "4K UHD",
    "genres": [
      "Comedy",
      "Crime",
      "Drama",
      "Mystery"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/u7t6vCyqAdD5hE4eEfTrZmVljDi.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/nCwAmyCcA6w1ZFjKrmwCRPiy4gt.jpg",
    "overview": "Stream Death in Paradise in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 304452,
    "title": "The Lament of Autumn",
    "mediaType": "tv",
    "year": 2026,
    "rating": 8.0,
    "duration": "4K UHD",
    "genres": [
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/nGSj4YtMOwP4cjGSD1fDlI6WLag.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/vD84yLJVVd7cC2lKF8sEukQG2A3.jpg",
    "overview": "Stream The Lament of Autumn in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 82596,
    "title": "Emily in Paris",
    "mediaType": "tv",
    "year": 2020,
    "rating": 7.5,
    "duration": "4K UHD",
    "genres": [
      "Drama",
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/c0bkO416OU7YGdOFktk45H8REgL.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/jXTZaHarR9TZiMoQwiQWsGYXqnS.jpg",
    "overview": "Stream Emily in Paris in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 82856,
    "title": "The Mandalorian",
    "mediaType": "tv",
    "year": 2019,
    "rating": 8.4,
    "duration": "4K UHD",
    "genres": [
      "Sci-Fi & Fantasy",
      "Action & Adventure"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/9zcbqSxdsRMZWHYtyCd1nXPr2xq.jpg",
    "overview": "Stream The Mandalorian in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 1490214,
    "title": "The Sun Never Sets",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.2,
    "duration": "4K UHD",
    "genres": [
      "Romance",
      "Drama",
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/hpzzGHyVN4nE0GzqoAu12ko6ER3.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/ckDLzhqHG40CoNUwQWrAvzCYRIe.jpg",
    "overview": "Stream The Sun Never Sets in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 1282159,
    "title": "Let's Have Kids!",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.9,
    "duration": "4K UHD",
    "genres": [
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/ciHBHFWAUn9tXNpm5NfDOkcgcMx.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/A42JE6WJDMsICN3NU6XkUyYEF5F.jpg",
    "overview": "Stream Let's Have Kids! in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 205272,
    "title": "Reasonable Doubt",
    "mediaType": "tv",
    "year": 2022,
    "rating": 6.1,
    "duration": "4K UHD",
    "genres": [
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/v9p9VbljJdJ9GjLqp3l5YpWJ8HO.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/5Nu95w2oWsbmDeAjG2NJF4x33Ud.jpg",
    "overview": "Stream Reasonable Doubt in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 1291366,
    "title": "The Deputy",
    "mediaType": "movie",
    "year": 2026,
    "rating": 6.4,
    "duration": "4K UHD",
    "genres": [
      "Action",
      "Crime",
      "Thriller"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/qL654LNOfBu49e12jnnQIv6mny.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/3WBGquZOd4iNl288BmWzkp0Fbdy.jpg",
    "overview": "Stream The Deputy in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 331033,
    "title": "Collision",
    "mediaType": "tv",
    "year": 2026,
    "rating": 8.4,
    "duration": "4K UHD",
    "genres": [
      "Drama",
      "General"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/ue1kLkkh9AbhnEs1sfY0Jo2f6Fy.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/oaRWutbj0UiJej6xIYB3p8wwP9V.jpg",
    "overview": "Stream Collision in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 294446,
    "title": "The Vanishing Beauty",
    "mediaType": "tv",
    "year": 2026,
    "rating": 7.5,
    "duration": "4K UHD",
    "genres": [
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/m3r695bVVi5y4UjbqIdkSkz060f.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/6Iha7gx0lTdrv6x7dECtjB8YnLA.jpg",
    "overview": "Stream The Vanishing Beauty in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 232018,
    "title": "Has Fallen",
    "mediaType": "tv",
    "year": 2024,
    "rating": 7.0,
    "duration": "4K UHD",
    "genres": [
      "Action & Adventure",
      "General"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/eyK6fy2NWfjmyBjUvRAR14FynPK.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/3yoTM5JtkxnPZvVzQOrL0c2ILVM.jpg",
    "overview": "Stream Has Fallen in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 211288,
    "title": "Tracker",
    "mediaType": "tv",
    "year": 2024,
    "rating": 7.6,
    "duration": "4K UHD",
    "genres": [
      "Drama",
      "Crime"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/otula4h1ITZ0eV84eg7Lb8u614C.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/5C5cMYUlmX6BU5YxBqhp7ZpSd3Q.jpg",
    "overview": "Stream Tracker in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 290856,
    "title": "Marshals",
    "mediaType": "tv",
    "year": 2026,
    "rating": 8.0,
    "duration": "4K UHD",
    "genres": [
      "Drama",
      "Crime",
      "Action & Adventure"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/zV1MRb6eqx6Uj3NSXquZFfz75pa.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/yGJGwt7DdIWTUXuahLfhcH1gi7G.jpg",
    "overview": "Stream Marshals in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 285418,
    "title": "Youth",
    "mediaType": "tv",
    "year": 2026,
    "rating": 7.5,
    "duration": "4K UHD",
    "genres": [
      "Comedy",
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/bk1zbzbu0xaYQuIANv4Pe8HHyAY.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/7pwybpJ2VSqqWgxZHTYqzRz01qH.jpg",
    "overview": "Stream Youth in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 1306293,
    "title": "It Takes Two To Tango",
    "mediaType": "movie",
    "year": 2025,
    "rating": 5.9,
    "duration": "4K UHD",
    "genres": [
      "Comedy",
      "Romance"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/gBT1mJ2E7K8QqOM0HVtStlBElvV.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/55SgWijKbM9GkoVuiW8MtW4qaly.jpg",
    "overview": "Stream It Takes Two To Tango in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 193610,
    "title": "The Other Woman",
    "mediaType": "movie",
    "year": 2014,
    "rating": 6.4,
    "duration": "4K UHD",
    "genres": [
      "Comedy",
      "Romance"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/yHnbb6z8REuFIyBLT2Nj3MX54dY.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/vqL1DAd9FbU2CvnG6hLX82bQM0q.jpg",
    "overview": "Stream The Other Woman in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 8274,
    "title": "American Pie Presents: Band Camp",
    "mediaType": "movie",
    "year": 2005,
    "rating": 5.5,
    "duration": "4K UHD",
    "genres": [
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/6BgKeWEGROpWwEWvpw7vwfTCr9C.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/TWchvpMO36QZTIiNjFBm4MYsmQ.jpg",
    "overview": "Stream American Pie Presents: Band Camp in ultra high-definition with multiple streaming servers on WatermelonBase Cinema.",
    "featured": false,
    "trending": true,
    "is4k": true
  },
  {
    "id": 969681,
    "title": "Spider-Man: Brand New Day",
    "mediaType": "movie",
    "year": 2026,
    "rating": 8.5,
    "duration": "HD Movie",
    "genres": [
      "Sci-Fi",
      "Action",
      "Adventure"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/r08LxMJCbf1SiJIWeyH9aJmdqwC.jpg",
    "overview": "Watch Spider-Man: Brand New Day online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 687163,
    "title": "Project Hail Mary",
    "mediaType": "movie",
    "year": 2026,
    "rating": 8.6,
    "duration": "HD Movie",
    "genres": [
      "Sci-Fi",
      "Adventure"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/iOb2fjXLbpJgyQXe46n1WtGCnaa.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/8Tfys3mDZVp4tNoH2ktm06a0Tau.jpg",
    "overview": "Watch Project Hail Mary online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1003596,
    "title": "Avengers: Doomsday",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.8,
    "duration": "HD Movie",
    "genres": [
      "Sci-Fi",
      "Action",
      "Adventure"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/jzPwsojjFStf5lR5Nm07w2hH56G.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/xaA2vNo563CwmchBWztkAYRf86Y.jpg",
    "overview": "Watch Avengers: Doomsday online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1368337,
    "title": "The Odyssey",
    "mediaType": "movie",
    "year": 2026,
    "rating": 8.0,
    "duration": "HD Movie",
    "genres": [
      "Adventure",
      "Action",
      "Fantasy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/bulFtfy3oBQtCnAMSi7g6DSSds3.jpg",
    "overview": "Watch The Odyssey online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1153576,
    "title": "Street Fighter",
    "mediaType": "movie",
    "year": 2026,
    "rating": 6.4,
    "duration": "HD Movie",
    "genres": [
      "Action",
      "Fantasy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/ccxdepKqORLwccbzvO4eAGkN0IC.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/qRN8eqYwG6HPSy0i3fKzuLrUOhp.jpg",
    "overview": "Watch Street Fighter online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1101412,
    "title": "Fall 2: Deadpoint",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.3,
    "duration": "HD Movie",
    "genres": [
      "Thriller"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/nGau0KBOaRILSK5MqFcuTfv7GMl.jpg",
    "overview": "Watch Fall 2: Deadpoint online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1400940,
    "title": "Clayface",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.6,
    "duration": "HD Movie",
    "genres": [
      "Horror",
      "Thriller",
      "Sci-Fi"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/9l1NuFjel2j89hiuiJbsxfblqjy.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/uL4cIrNi2uaUnWIOQQ28EVnkETG.jpg",
    "overview": "Watch Clayface online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1291595,
    "title": "Insidious: Out of the Further",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.7,
    "duration": "HD Movie",
    "genres": [
      "Horror",
      "Thriller"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/4tTrW9dXCByS5wt2pXVWb58zNjz.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/p40lmrdI4blcAPZQMTPaiy5v5Ym.jpg",
    "overview": "Watch Insidious: Out of the Further online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1148365,
    "title": "Matchbox the Movie",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.8,
    "duration": "HD Movie",
    "genres": [
      "Action",
      "Comedy",
      "Adventure"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/aHhHRz6nOpwkqJs5ASeRGAdK2dt.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/jdJsnhHfkIi3J7jwfiCFT4gXNx5.jpg",
    "overview": "Watch Matchbox the Movie online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1561726,
    "title": "Masterplan",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.0,
    "duration": "HD Movie",
    "genres": [
      "Action",
      "Thriller"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/5xmXVd7nCK3tAo34XkO58SxUCip.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/dgUDj84BWtW6EZzee8BkgKnjDhh.jpg",
    "overview": "Watch Masterplan online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1400837,
    "title": "Other Mommy",
    "mediaType": "movie",
    "year": 2026,
    "rating": 5.8,
    "duration": "HD Movie",
    "genres": [
      "Horror"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/fGRNCssTRrhYZxNzykGGCoMsAVq.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/ncm7djsVTHQQMX2HEbEVxMUFchG.jpg",
    "overview": "Watch Other Mommy online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1255833,
    "title": "Whalefall",
    "mediaType": "movie",
    "year": 2026,
    "rating": 6.6,
    "duration": "HD Movie",
    "genres": [
      "Thriller"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/vjTYUTgh9nO88i6HZ4YPRhiFL05.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/shW2jHkQLZVv4Fko2rJDqTGU0gx.jpg",
    "overview": "Watch Whalefall online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1228834,
    "title": "The Fix",
    "mediaType": "movie",
    "year": 2026,
    "rating": 6.4,
    "duration": "HD Movie",
    "genres": [
      "Action",
      "Thriller"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/jlP8XDjZN89GrpM3je5Uf8Grqx8.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/dJTWIecL2vxsCRl5G0lRhPsfrhc.jpg",
    "overview": "Watch The Fix online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1423191,
    "title": "Resident Evil",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.3,
    "duration": "HD Movie",
    "genres": [
      "Horror",
      "Sci-Fi",
      "Adventure"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/i7UyjfPio0VFHB9rBUZSFyhOoM8.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/3icyRAqgakNcQn6aDVz9libFmBA.jpg",
    "overview": "Watch Resident Evil online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1236045,
    "title": "Animals",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.0,
    "duration": "HD Movie",
    "genres": [
      "Thriller",
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/iISM36voS1E8gX9BM0DVK0kgi3E.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/tzoarEu7TsG959upiELyYPm5kO9.jpg",
    "overview": "Watch Animals online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1514026,
    "title": "Buddy",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.1,
    "duration": "HD Movie",
    "genres": [
      "Horror",
      "Comedy",
      "Fantasy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/1BdZbNvl1SfrrX8J9X5tQzN6Ivu.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/ytoLEl5yDaxB8AtZ52uKWjaQ9ql.jpg",
    "overview": "Watch Buddy online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1377237,
    "title": "Runner",
    "mediaType": "movie",
    "year": 2026,
    "rating": 8.3,
    "duration": "HD Movie",
    "genres": [
      "Action",
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/vJk2TW1QZAmBiD7oj9ZF9EPTYY1.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/npXZNWjOEYrqdMDPQ11SGBrXqAG.jpg",
    "overview": "Watch Runner online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1712451,
    "title": "Resident Dead",
    "mediaType": "movie",
    "year": 2026,
    "rating": 5.9,
    "duration": "HD Movie",
    "genres": [
      "Horror"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/qKhMVWwFikSUzOpkhOl35GBLkGH.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/yKx5gYrYgakKZuUWAsuFDStBroy.jpg",
    "overview": "Watch Resident Dead online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1248832,
    "title": "Digger",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.5,
    "duration": "HD Movie",
    "genres": [
      "Comedy",
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/1ATXKrIPJyKNwnJ6lcG088Sa6zi.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/vC5IxhgO6cVmw9O4QgkraRzfHvh.jpg",
    "overview": "Watch Digger online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1302904,
    "title": "Practical Magic 2",
    "mediaType": "movie",
    "year": 2026,
    "rating": 7.1,
    "duration": "HD Movie",
    "genres": [
      "Romance",
      "Fantasy",
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/ogwQOLbCfncjvBhFb5l0OmQH8KC.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/oIglj0Jy9duG4LnrRUpH8n001Pk.jpg",
    "overview": "Watch Practical Magic 2 online with zero buffering and ad-shielded streaming mirrors.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1416,
    "title": "Grey's Anatomy",
    "mediaType": "tv",
    "year": 2005,
    "rating": 8.2,
    "duration": "TV Series",
    "genres": [
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/gO8Fo47KV1opiutRDdBS5jclTQB.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/A4NwkQXTXElE5iAsne5RpvS8R2Z.jpg",
    "overview": "Complete season and episode streaming for Grey's Anatomy with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1411,
    "title": "Person of Interest",
    "mediaType": "tv",
    "year": 2011,
    "rating": 8.1,
    "duration": "TV Series",
    "genres": [
      "Action & Adventure",
      "Crime",
      "Sci-Fi & Fantasy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/f8aIvYk5h7Z8EP3dinCmVgQFYow.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/efeMgQn6iRALsOqDa2cqlf6Pw5O.jpg",
    "overview": "Complete season and episode streaming for Person of Interest with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 83631,
    "title": "What We Do in the Shadows",
    "mediaType": "tv",
    "year": 2019,
    "rating": 8.0,
    "duration": "TV Series",
    "genres": [
      "Comedy",
      "Sci-Fi & Fantasy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/wa3ZQE9kLnqwN3vQ0NNjg1NPsCa.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/mKikck71CvVISUSTLk29fwRbH4y.jpg",
    "overview": "Complete season and episode streaming for What We Do in the Shadows with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1426,
    "title": "Luther",
    "mediaType": "tv",
    "year": 2010,
    "rating": 7.9,
    "duration": "TV Series",
    "genres": [
      "Crime",
      "Drama",
      "Mystery"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/hDxOMX8zzH1FiqKWVBzNaYGBkle.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/A2qdFRq9oJDC5E7fbgSS4POUMDF.jpg",
    "overview": "Complete season and episode streaming for Luther with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1480,
    "title": "Ally McBeal",
    "mediaType": "tv",
    "year": 1997,
    "rating": 6.5,
    "duration": "TV Series",
    "genres": [
      "Drama",
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/weS8htxS2j0EQ6jorK3WOR1dZpH.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/xCMs3IxaGqKSc5cwngRUlhmjbwl.jpg",
    "overview": "Complete season and episode streaming for Ally McBeal with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 2190,
    "title": "South Park",
    "mediaType": "tv",
    "year": 1997,
    "rating": 8.3,
    "duration": "TV Series",
    "genres": [
      "Comedy",
      "Animation"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/k7n2EVge7G77eMr3brztRGG1fFU.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/3UviYOlhn8EgXMBuiT6MnUuo1w9.jpg",
    "overview": "Complete season and episode streaming for South Park with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 549,
    "title": "Law & Order",
    "mediaType": "tv",
    "year": 1990,
    "rating": 7.3,
    "duration": "TV Series",
    "genres": [
      "Crime",
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/hmd2tEtjolLWpNLCTvXS2PO5VCi.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/hrfP9BQ4mOMZOa8nHbFJLSDHBLz.jpg",
    "overview": "Complete season and episode streaming for Law & Order with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 136315,
    "title": "The Bear",
    "mediaType": "tv",
    "year": 2022,
    "rating": 8.2,
    "duration": "TV Series",
    "genres": [
      "Drama",
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/eKfVzzEazSIjJMrw9ADa2x8ksLz.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/aJtG4txtmiRHwAAqENQHZvBs6kY.jpg",
    "overview": "Complete season and episode streaming for The Bear with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 22980,
    "title": "Watch What Happens Live with Andy Cohen",
    "mediaType": "tv",
    "year": 2009,
    "rating": 4.9,
    "duration": "TV Series",
    "genres": [
      "Drama",
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/onSD9UXfJwrMXWhq7UY7hGF2S1h.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/hINekSpbcBxjnjGqmIm6I4bz2ab.jpg",
    "overview": "Complete season and episode streaming for Watch What Happens Live with Andy Cohen with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 2734,
    "title": "Law & Order: Special Victims Unit",
    "mediaType": "tv",
    "year": 1999,
    "rating": 8.0,
    "duration": "TV Series",
    "genres": [
      "Crime",
      "Drama",
      "Mystery"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/pHNhUwSXuDQ9jPZOCb8SgJaQZsc.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/xhK9YCxNwnE0OB1SWvCY39heHQI.jpg",
    "overview": "Complete season and episode streaming for Law & Order: Special Victims Unit with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 2261,
    "title": "The Tonight Show Starring Johnny Carson",
    "mediaType": "tv",
    "year": 1962,
    "rating": 7.6,
    "duration": "TV Series",
    "genres": [
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/uSvET5YUvHNDIeoCpErrbSmasFb.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/qFfWFwfaEHzDLWLuttWiYq7Poy2.jpg",
    "overview": "Complete season and episode streaming for The Tonight Show Starring Johnny Carson with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 59941,
    "title": "The Tonight Show Starring Jimmy Fallon",
    "mediaType": "tv",
    "year": 2014,
    "rating": 5.8,
    "duration": "TV Series",
    "genres": [
      "Comedy",
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/1N4o5PmmqhlVDrcdJ2RlCFWbLGX.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/i4OYRb5V13BrOnTPJGdyXWg4r0J.jpg",
    "overview": "Complete season and episode streaming for The Tonight Show Starring Jimmy Fallon with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 5920,
    "title": "The Mentalist",
    "mediaType": "tv",
    "year": 2008,
    "rating": 8.4,
    "duration": "TV Series",
    "genres": [
      "Crime",
      "Drama",
      "Mystery"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/acYXu4KaDj1NIkMgObnhe4C4a0T.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/rJFqKcmMSttdNP58l0dVzY2NcTA.jpg",
    "overview": "Complete season and episode streaming for The Mentalist with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 456,
    "title": "The Simpsons",
    "mediaType": "tv",
    "year": 1989,
    "rating": 8.0,
    "duration": "TV Series",
    "genres": [
      "Animation",
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/k5UALlcA0EnviaCUn2wMjOWYiOO.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/jIArNHIekrCSVgdMbKPAXpPY03Y.jpg",
    "overview": "Complete season and episode streaming for The Simpsons with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 63770,
    "title": "The Late Show with Stephen Colbert",
    "mediaType": "tv",
    "year": 2015,
    "rating": 6.1,
    "duration": "TV Series",
    "genres": [
      "Comedy",
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/9jkThAGYj2yp8jsS6Nriy5mzKFT.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/gMMnf8VRg3Z98WaFmOLr9Jk8pIs.jpg",
    "overview": "Complete season and episode streaming for The Late Show with Stephen Colbert with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 213375,
    "title": "VisionQuest",
    "mediaType": "tv",
    "year": 2026,
    "rating": 8.7,
    "duration": "TV Series",
    "genres": [
      "Sci-Fi & Fantasy",
      "Drama"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/xK27l5uwaVyZSlENWnmLlWwDQNS.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/uoXXbN2PrOxH6UKyP7kYwmGpAAP.jpg",
    "overview": "Complete season and episode streaming for VisionQuest with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 4614,
    "title": "NCIS",
    "mediaType": "tv",
    "year": 2003,
    "rating": 7.6,
    "duration": "TV Series",
    "genres": [
      "Crime",
      "Drama",
      "Action & Adventure"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/y4fGncqELtnvRQuwSpuH8LncZqU.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/c1aBrG5s5xFa6Tbnihu2Hhj4t2q.jpg",
    "overview": "Complete season and episode streaming for NCIS with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  },
  {
    "id": 1434,
    "title": "Family Guy",
    "mediaType": "tv",
    "year": 1999,
    "rating": 7.4,
    "duration": "TV Series",
    "genres": [
      "Animation",
      "Comedy"
    ],
    "poster": "https://image.tmdb.org/t/p/w500/3PFsEuAiyLkWsP4GG6dIV37Q6gu.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/jbTqU6BJMufoMnPSlO4ThrcXs3Y.jpg",
    "overview": "Complete season and episode streaming for Family Guy with high-speed unblocked playback.",
    "featured": false,
    "trending": true,
    "is4k": false
  }
];
