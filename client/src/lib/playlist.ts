/**
 * Tanu Ka Tadka playlist data — keep this simple editable list mixed across Odia and Hindi entries.
 * Each `videoId` is intended for the YouTube IFrame Player API; Spotify URLs are secondary listening options.
 */
export type RadioTrack = {
  videoId: string;
  title: string;
  artist: string;
  language: "Odia" | "Hindi";
  mood: string;
  spotifyUrl: string;
};

export const MIXED_PLAYLIST: RadioTrack[] = [
  {
    videoId: "3UFTqzRwV0w",
    title: "Emiti Eka Chehera",
    artist: "Udit Narayan, Ira Mohanty",
    language: "Odia",
    mood: "Purane Yaadien wo · 2000s Ke Haircut",
    spotifyUrl: "https://open.spotify.com/search/Emiti%20Eka%20Chehera%20Udit%20Narayan",
  },
  {
    videoId: "mt9xg0mmt28",
    title: "Tum Se Hi",
    artist: "Mohit Chauhan",
    language: "Hindi",
    mood: "Purane Yaadien wo · 2000s Ke Haircut",
    spotifyUrl: "https://open.spotify.com/search/Tum%20Se%20Hi%20Mohit%20Chauhan",
  },
  {
    videoId: "kE01Bi84ZEs",
    title: "Mun To Prema Rogi",
    artist: "Udit Narayan, Tapu Mishra",
    language: "Odia",
    mood: "Chul katiba bele · Rainy radio mix",
    spotifyUrl: "https://open.spotify.com/track/47giZRw2WKDi3Q1IO2koK2",
  },
  {
    videoId: "zWEOx7TSM6I",
    title: "Chand Sifarish",
    artist: "Shaan, Kailash Kher",
    language: "Hindi",
    mood: "Mirror ke saamne · 2000s Ke Haircut",
    spotifyUrl: "https://open.spotify.com/search/Chand%20Sifarish%20Shaan",
  },
  {
    videoId: "HIOhO98atFY",
    title: "Aji Mun Kahuchi Tate",
    artist: "Udit Narayan, Tapu Mishra",
    language: "Odia",
    mood: "Mohalla romance · Old saloon signal",
    spotifyUrl: "https://open.spotify.com/search/Aji%20Mun%20Kahuchi%20Tate",
  },
  {
    videoId: "BadBAMnPX0I",
    title: "Pehli Nazar Mein",
    artist: "Atif Aslam",
    language: "Hindi",
    mood: "Purane Yaadien wo · Tape rewind",
    spotifyUrl: "https://open.spotify.com/search/Pehli%20Nazar%20Mein%20Atif%20Aslam",
  },
];
