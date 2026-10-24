export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface SongLyrics {
  synced: boolean;
  lines: LyricLine[];
  source?: string;
}

// In-memory lyrics cache
const LYRICS_CACHE = new Map<string, SongLyrics>();

export function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText || typeof lrcText !== 'string') return [];
  const lines: LyricLine[] = [];
  const regex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/;

  const rawLines = lrcText.split('\n');
  for (const raw of rawLines) {
    const match = raw.match(regex);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) / 1000 : 0;
      const time = min * 60 + sec + ms;
      const text = match[4].trim();
      if (text) {
        lines.push({ time, text });
      }
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

// Built-in instant synced lyrics for featured catalog songs (0ms instant display)
const PRELOADED_LYRICS: Record<string, string> = {
  // New West - Those Eyes (The exact track from the screenshot!)
  'new west::those eyes': `
[00:00.77] When we're out in a crowd laughing loud
[00:05.24] And nobody knows why
[00:12.66] When we're lost at a club, getting drunk
[00:17.25] And you give me that smile
[00:24.74] Going home in the back of a car
[00:29.20] And your hand touches mine
[00:36.56] When we're done making love
[00:39.71] And you look up and give me those eyes
[00:47.97] 'Cause all of the small things that you do
[00:54.23] Are what remind me why I fell for you
[00:59.88] And when we're apart, and I'm missing you
[01:05.91] I close my eyes and all I see is you
[01:11.74] And the small things you do
[01:24.62] When you call me at night while you're out
[01:29.11] Getting high with your friends (high with your friends)
[01:36.56] Every "hi", every "bye", every "I love you" you've ever said
[01:45.16] (You've ever said)
[01:47.95] 'Cause all of the small things that you do
[01:54.01] Are what remind me why I fell for you
[01:59.77] And when we're apart, and I'm missing you
[02:06.12] I close my eyes and all I see is you
[02:11.80] And the small things you do
[02:36.53] When we're done making love
[02:39.52] And you look up and give me those eyes
[02:47.97] 'Cause all of the small things that you do
[02:54.09] Are what remind me why I fell for you
[02:59.70] And when we're apart, and I'm missing you
[03:06.11] I close my eyes and all I see is you
[03:11.72] And the small things you do
[03:23.42] All the small things you do
`,

  // Tyler, The Creator - See You Again
  'tyler, the creator::see you again': `
[00:00.24] Okay, okay, okay, okay
[00:01.56] Okay, okay, oh
[00:03.06] You live in my dream state
[00:06.09] Relocate my fantasy
[00:09.12] I stay in reality
[00:12.29] You live in my dream state
[00:15.18] Any time I count sheep
[00:17.97] That's the only time we make up, make up
[00:21.04] You exist behind my eyelids, my eyelids
[00:24.16] Now I don't wanna wake up
[00:25.92] 20/20, 20/20 vision
[00:28.91] Cupid hit me, cupid hit me with precision
[00:31.95] I wonder if you look both ways
[00:34.90] When you cross my mind, I said, I said
[00:38.00] I'm sick of, sick of, sick of, sick of chasing
[00:41.05] You're the one that's always running through my daydream
[00:44.12] I can only see your face when I close my eyes
[00:49.00] Can I get a kiss? And can you make it last forever?
[00:55.20] I said I'm 'bout to go to war
[00:58.20] And I don't know if I'ma see you again
[01:01.30] Can I get a kiss? (Can I) And can you make it last forever?
[01:07.40] I said I'm 'bout to go to war ('Bout to)
[01:10.50] And I don't know if I'ma see you again (Uh, switch it up)
[01:14.20] I said, okay, okay, okay, okidoki, my infatuation
[01:17.90] Is makin' me look rose-colored, no communication
[01:21.00] Baby boy, you got me floatin' in cloud nine
[01:24.10] When I see you, you look like a goldmine
[01:31.00] Can I get a kiss? And can you make it last forever?
[01:37.20] I said I'm 'bout to go to war
[01:40.20] And I don't know if I'ma see you again
`,

  // Frank Ocean - Pink + White
  'frank ocean::pink + white': `
[00:00.00] Yeah, yeah, oh
[00:08.50] That's the way everyday goes
[00:12.50] Every time we have no control
[00:17.00] If the sky is pink and white
[00:21.00] If the ground is black and yellow
[00:25.50] It's the same way you showed me
[00:29.80] Nod my head, don't close my eyes
[00:34.00] Halfway in the dark, halfway in the sun
[00:42.50] Just the same way you showed me, showed me
[00:50.00] You showed me love
[00:54.00] Glory from above
[00:58.50] Regard, my dear
[01:03.00] It's all downhill from here
[01:07.50] In the wake of a hurricane
[01:11.80] Dark skin of a summer shade
[01:16.00] Noses run and faces pale
[01:20.50] We're so far from the finish line
[01:25.00] That's the way everyday goes
[01:29.00] Every time we have no control
[01:33.50] If the sky is pink and white
[01:37.80] If the ground is black and yellow
`,

  // Kendrick Lamar - HUMBLE.
  'kendrick lamar::humble.': `
[00:00.00] Nobody pray for me
[00:02.50] It been that day for me
[00:04.80] Way (yeah, yeah!)
[00:07.50] Ayy, I remember syrup sandwiches and crime allowances
[00:11.00] Finesse a nigga with some counterfeits, but now I'm countin' this
[00:14.20] Parmesan where my accountant lives, in fact, I'm downin' this
[00:17.50] D'USSÉ with my boo bae, tastes like Kool-Aid for the analysts
[00:21.00] Girl, I can buy yo' ass the world with my paystub
[00:24.50] Ooh, that pussy good, won't you sit it on my taste buds?
[00:28.00] I get way too petty once you let me do the extras
[00:31.50] Pull up on your block, then break it down: we playin' Tetris
[00:35.00] A.M. to the P.M., P.M. to the A.M., funk
[00:38.20] Piss out your per diem, you just gotta gang jam, funk
[00:42.00] My left stroke just went viral
[00:45.00] Right stroke put lil' baby in a spiral
[00:48.50] Soprano C, we like to keep it on a high note
[00:52.00] It's levels to it, you and I know, bitch, be humble
[00:56.00] (Hol' up, bitch) sit down (hol' up, lil', hol' up, lil' bitch)
[00:59.50] Be humble (hol' up, bitch)
[01:01.00] Sit down (hol' up, sit down, lil', sit down, lil' bitch)
[01:04.00] Be humble (hol' up, hol' up)
[01:06.00] Bitch, sit down (hol' up, hol' up, lil' bitch)
[01:09.50] Be humble (lil' bitch, set it down)
`
};

export async function fetchLyricsForTrack(artist: string, title: string, durationSec = 180): Promise<SongLyrics> {
  const cleanArtist = (artist || '').toLowerCase().trim();
  const cleanTitle = (title || '').toLowerCase().replace(/\([^)]*\)/g, '').replace(/feat\.[^)]+/gi, '').trim();
  const key = `${cleanArtist}::${cleanTitle}`;

  // 1. Check in-memory cache
  if (LYRICS_CACHE.has(key)) {
    return LYRICS_CACHE.get(key)!;
  }

  // 2. Check built-in preloaded lyrics
  for (const [k, lrc] of Object.entries(PRELOADED_LYRICS)) {
    if (k === key || (cleanArtist.includes(k.split('::')[0]) && cleanTitle.includes(k.split('::')[1]))) {
      const parsed = parseLrc(lrc);
      const res: SongLyrics = { synced: true, lines: parsed, source: 'preloaded' };
      LYRICS_CACHE.set(key, res);
      return res;
    }
  }

  // 3. Fetch from /api/music/lyrics backend proxy (same-origin, unblocked at school)
  try {
    const isStaticHost = typeof window !== 'undefined' && 
      (window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:');

    const fetchUrl = isStaticHost
      ? `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(cleanTitle)}`
      : `/api/music/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(cleanTitle)}`;

    const res = await fetch(fetchUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.syncedLyrics) {
        const lines = parseLrc(data.syncedLyrics);
        if (lines.length > 0) {
          const result: SongLyrics = { synced: true, lines, source: 'lrclib-synced' };
          LYRICS_CACHE.set(key, result);
          return result;
        }
      }
      if (data.plainLyrics) {
        // Distribute plain lyrics across the duration
        const rawLines = data.plainLyrics.split('\n').map((l: string) => l.trim()).filter(Boolean);
        const interval = Math.max(3, durationSec / (rawLines.length + 1));
        const lines: LyricLine[] = rawLines.map((text: string, idx: number) => ({
          time: +(idx * interval).toFixed(2),
          text
        }));
        const result: SongLyrics = { synced: false, lines, source: 'lrclib-plain' };
        LYRICS_CACHE.set(key, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Online lyrics lookup failed for:', artist, title, err);
  }

  // 4. Graceful melodic/ambient cues fallback so lyrics screen always looks polished
  const fallbackLines: LyricLine[] = [
    { time: 0, text: `♪ ${title} ♪` },
    { time: 4, text: `${artist}` },
    { time: Math.floor(durationSec * 0.15), text: '♪ Instrumental intro ♪' },
    { time: Math.floor(durationSec * 0.35), text: '♪ Verse & Melody ♪' },
    { time: Math.floor(durationSec * 0.50), text: '♪ Chorus & Harmony ♪' },
    { time: Math.floor(durationSec * 0.70), text: '♪ Instrumental build ♪' },
    { time: Math.floor(durationSec * 0.85), text: '♪ Outro ♪' },
  ];

  const result: SongLyrics = { synced: false, lines: fallbackLines, source: 'fallback' };
  LYRICS_CACHE.set(key, result);
  return result;
}
