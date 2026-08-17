/**
 * Tanu Ka Tadka style reminder: Preserve the compact, centre-stacked 2000s saloon radio reference.
 * The front surface is dark radio hardware; lower sections read as weathered wall, ledger paper, and taped notices.
 */
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Instagram,
  Mail,
  Menu,
  MessageCircle,
  Music2,
  Pause,
  Play,
  Radio,
  Scissors,
  Send,
  SkipBack,
  SkipForward,
  Smartphone,
  Volume2,
  Waves,
  X,
  Youtube,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CATALOGUE_INDEX_META,
  CATALOGUE_TOTAL,
  getTrackAt,
  preloadCatalogueBatch,
  type RadioTrack,
} from "@/lib/catalogue";
import { PersistentRadioQueue } from "@/lib/radioQueue";

const MONSOON_IMAGE = "/manus-storage/tanu-ka-tadka-monsoon-window_51d299e1.png";
const STUDIO_HERO_IMAGE = "/manus-storage/tanu-ka-tadka-studio-hero_7b168e01.jpeg";
const RADIO_IMAGE = STUDIO_HERO_IMAGE;
const UPI_QR_IMAGE = "/manus-storage/tanu-ka-tadka-upi-qr_25f9bcf8.jpeg";
const LOADING_TRACK: RadioTrack = {
  catalogueIndex: -1,
  videoId: "",
  title: "Tuning the larger radio…",
  artist: "Tanu Ka Tadka",
  language: "Hindi",
  category: "1,000-song no-repeat queue",
  duration: 0,
  sourceName: "Tanu Ka Tadka catalogue",
  sourceUrl: "",
  spotifyUrl: "https://open.spotify.com/search/Tanu%20Ka%20Tadka",
  amazonMusicUrl: "https://www.amazon.in/music",
  jioSaavnUrl: "https://www.jiosaavn.com/",
  status: "approved-candidate",
};

interface YouTubePlayer {
  cueVideoById: (videoId: string) => void;
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
}

interface YouTubePlayerEvent {
  data: number;
  target: YouTubePlayer;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          width: number;
          height: number;
          videoId: string;
          playerVars: Record<string, number | string>;
          events: {
            onReady: (event: YouTubePlayerEvent) => void;
            onStateChange: (event: YouTubePlayerEvent) => void;
            onError: () => void;
          };
        },
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const saloonQuotes = [
  "“Bhai, side se thoda aur… volume nahi.”",
  "“କେଉଁ ଗୀତ ଚାଲିଛି? ପୁରୁଣା ଦିନର।”",
  "“Ek number fade. Do number yaadein.”",
  "“बारिश हो या कटिंग, रेडियो चलेगा।”",
];

type StationId = "all" | "bollywood" | "odia-classics" | "2000s" | "2010s" | "party" | "recent";

const STATION_MODES: Array<{
  id: StationId;
  label: string;
  matches: (entry: (typeof CATALOGUE_INDEX_META)[number]) => boolean;
}> = [
  { id: "all", label: "All mix", matches: () => true },
  { id: "bollywood", label: "Bollywood hits", matches: (entry) => entry.language === "Hindi" },
  { id: "odia-classics", label: "Odia classics", matches: (entry) => entry.category === "Odia classics / romance" },
  { id: "2000s", label: "2000s", matches: (entry) => entry.category.includes("2000s") },
  { id: "2010s", label: "2010s", matches: (entry) => entry.category.includes("2010s") },
  { id: "party", label: "Party / dance", matches: (entry) => /party|dance/i.test(entry.category) },
  { id: "recent", label: "Recent", matches: (entry) => entry.category.includes("Recent") },
];

const faqs = [
  {
    question: "What is Tanu Ka Tadka?",
    answer:
      "Tanu Ka Tadka is an independent ambient radio room inspired by the music, rain, and neighbourhood chatter of a classic 2000s Odisha + North Indian barbershop.",
  },
  {
    question: "What kind of music plays here?",
    answer:
      "The editable mixed queue moves naturally between 2000s Odia songs and 2000s Hindi Bollywood songs. It deliberately avoids separate hard sections so it feels like one old radio dial.",
  },
  {
    question: "How do full tracks play?",
    answer:
      "The compact player uses the YouTube IFrame Player API for full-track playback. Browser autoplay protections may require one first tap on the play button before music begins.",
  },
  {
    question: "Can I open the song in Spotify?",
    answer:
      "Yes. Every current track includes a secondary Spotify link that opens a search or available song page in Spotify. It is optional and never replaces the radio player.",
  },
  {
    question: "Is Tanu Ka Tadka free and official?",
    answer:
      "The site is free with no login. It is an independent nostalgia project and is not affiliated with the artists, labels, YouTube, Spotify, or WhatsApp.",
  },
];

type RainGraph = {
  context: AudioContext;
  sources: AudioBufferSourceNode[];
  master: GainNode;
  thunderTimer: number | null;
  flashTimers: number[];
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function createNoiseSource(
  context: AudioContext,
  filterType: BiquadFilterType,
  frequency: number,
  q: number,
  gainValue: number,
  destination: AudioNode,
) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < buffer.length; index += 1) data[index] = Math.random() * 2 - 1;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  source.loop = true;
  filter.type = filterType;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  gain.gain.value = gainValue;
  source.connect(filter).connect(gain).connect(destination);
  source.start();
  return source;
}

function createSoftThunder(context: AudioContext, destination: AudioNode) {
  const seconds = 2.5;
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * seconds), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < buffer.length; index += 1) {
    const envelope = Math.exp((-index / buffer.length) * 3.5);
    data[index] = (Math.random() * 2 - 1) * envelope;
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.value = 150;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, context.currentTime + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + seconds);
  source.connect(filter).connect(gain).connect(destination);
  source.start();

  const crack = context.createOscillator();
  const crackGain = context.createGain();
  crack.type = "triangle";
  crack.frequency.setValueAtTime(210, context.currentTime);
  crack.frequency.exponentialRampToValueAtTime(68, context.currentTime + 0.19);
  crackGain.gain.setValueAtTime(0.0001, context.currentTime);
  crackGain.gain.exponentialRampToValueAtTime(0.028, context.currentTime + 0.018);
  crackGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28);
  crack.connect(crackGain).connect(destination);
  crack.start();
  crack.stop(context.currentTime + 0.3);
}

function stopRainGraph(graph: RainGraph) {
  if (graph.thunderTimer) window.clearTimeout(graph.thunderTimer);
  graph.flashTimers.forEach((timer) => window.clearTimeout(timer));
  graph.sources.forEach((source) => {
    try { source.stop(); } catch { /* Source may already be stopped during cleanup. */ }
  });
  void graph.context.close();
}

function createRainGraph(onLightning: (active: boolean) => void, volume: number) {
  const AudioContextConstructor = window.AudioContext;
  const context = new AudioContextConstructor();
  const master = context.createGain();
  master.gain.value = (volume / 100) * 1.4;
  master.connect(context.destination);
  const closeRain = createNoiseSource(context, "bandpass", 4300, 0.58, 0.1, master);
  const roomRain = createNoiseSource(context, "lowpass", 1450, 0.78, 0.022, master);
  const graph: RainGraph = { context, sources: [closeRain, roomRain], master, thunderTimer: null, flashTimers: [] };

  const flash = () => {
    onLightning(true);
    graph.flashTimers.push(window.setTimeout(() => onLightning(false), 150));
    graph.flashTimers.push(window.setTimeout(() => {
      onLightning(true);
      graph.flashTimers.push(window.setTimeout(() => onLightning(false), 75));
    }, 210));
  };

  const scheduleThunder = (firstRoll = false) => {
    graph.thunderTimer = window.setTimeout(() => {
      flash();
      createSoftThunder(context, master);
      scheduleThunder();
    }, firstRoll ? 2800 + Math.round(Math.random() * 1200) : 11000 + Math.round(Math.random() * 11000));
  };

  scheduleThunder(true);
  void context.resume();
  return graph;
}

export default function Home() {
  const [currentTrack, setCurrentTrack] = useState<RadioTrack | null>(null);
  const [queueProgress, setQueueProgress] = useState({ played: 0, remaining: CATALOGUE_TOTAL });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rainOn, setRainOn] = useState(false);
  const [rainVolume, setRainVolume] = useState(68);
  const [lightningFlash, setLightningFlash] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [stationId, setStationId] = useState<StationId>("all");
  const [isTrackLoading, setIsTrackLoading] = useState(true);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const rainRef = useRef<RainGraph | null>(null);
  const queueRef = useRef<PersistentRadioQueue | null>(null);
  const currentCatalogueIndexRef = useRef<number | null>(null);
  const currentTrackRef = useRef<RadioTrack | null>(null);
  const playerReadyRef = useRef(false);
  const displayTrack = currentTrack ?? LOADING_TRACK;

  if (!queueRef.current) queueRef.current = new PersistentRadioQueue(CATALOGUE_TOTAL);

  const activateTrack = async (catalogueIndex: number, autoplay: boolean) => {
    setIsTrackLoading(true);
    try {
      const track = await getTrackAt(catalogueIndex);
      currentCatalogueIndexRef.current = catalogueIndex;
      currentTrackRef.current = track;
      setCurrentTrack(track);
      setElapsed(0);
      setDuration(0);
      preloadCatalogueBatch(Math.floor(catalogueIndex / 100) + 1);
      const player = playerRef.current;
      if (!player || !playerReadyRef.current) return;
      if (autoplay) player.loadVideoById(track.videoId);
      else player.cueVideoById(track.videoId);
    } catch {
      setIsTrackLoading(false);
      toast.error("Could not load that radio record", { description: "The station is moving to the next available track." });
    }
  };

  const selectNextTrack = (requestedStation: StationId, autoplay = true) => {
    const queue = queueRef.current!;
    const mode = STATION_MODES.find((station) => station.id === requestedStation) ?? STATION_MODES[0];
    const nextIndex = queue.nextMatching((candidateIndex) => mode.matches(CATALOGUE_INDEX_META[candidateIndex]));
    if (nextIndex === null) {
      toast.error("This station has no unplayed records left", { description: "Choose another dial or wait for the next full-cycle reset." });
      return;
    }
    setQueueProgress(queue.progress);
    void activateTrack(nextIndex, autoplay);
  };

  const playNext = () => {
    selectNextTrack(stationId);
  };
  const playPrevious = () => {
    const queue = queueRef.current!;
    const previousIndex = queue.previous();
    setQueueProgress(queue.progress);
    void activateTrack(previousIndex, true);
  };

  const replaceUnavailableTrack = () => {
    const queue = queueRef.current!;
    const failedIndex = currentCatalogueIndexRef.current;
    const failedTrack = currentTrackRef.current;
    if (failedIndex !== null) queue.markUnavailable(failedIndex);
    const replacementIndex = queue.nextMatching((candidateIndex) => {
      if (!failedTrack) return true;
      const candidate = CATALOGUE_INDEX_META[candidateIndex];
      return candidate.language === failedTrack.language && candidate.category === failedTrack.category;
    });
    if (replacementIndex === null) {
      setIsPlaying(false);
      setIsTrackLoading(false);
      toast.error("That YouTube upload is unavailable", { description: "No same-category replacement remains in this cycle." });
      return;
    }
    setQueueProgress(queue.progress);
    toast.error("Skipped an unavailable upload", { description: "The radio found the next matching track in the catalogue." });
    void activateTrack(replacementIndex, true);
  };

  const handleStationChange = (nextStation: StationId) => {
    setStationId(nextStation);
    const mode = STATION_MODES.find((station) => station.id === nextStation) ?? STATION_MODES[0];
    toast.message(`Dial tuned: ${mode.label}`, { description: "The next unplayed record is loading from this station." });
    selectNextTrack(nextStation);
  };

  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player || !playerReady) return;
    if (isPlaying) {
      player.pauseVideo();
      return;
    }
    player.playVideo();
  };

  const toggleRain = () => {
    const nextState = !rainOn;
    setRainOn(nextState);
    if (!nextState && rainRef.current) {
      stopRainGraph(rainRef.current);
      rainRef.current = null;
      setLightningFlash(false);
      return;
    }
    if (nextState && !rainRef.current) {
      rainRef.current = createRainGraph(setLightningFlash, rainVolume);
      void rainRef.current.context.resume();
    }
  };

  const updateRainVolume = (value: number) => {
    setRainVolume(value);
    const graph = rainRef.current;
    if (graph) {
      graph.master.gain.setTargetAtTime(
        (value / 100) * 1.4,
        graph.context.currentTime,
        0.08,
      );
    }
  };

  const handleShare = () => {
    const nextCount = Math.min(shareCount + 1, 5);
    setShareCount(nextCount);
    const text = encodeURIComponent("Tanu Ka Tadka — 2000s Odia + Hindi saloon radio. सुनो और यादें ताज़ा करो!");
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const queue = queueRef.current!;
    const initialIndex = queue.next();
    setQueueProgress(queue.progress);
    void activateTrack(initialIndex, false);
  }, []);

  useEffect(() => {
    const ready = () => {
      playerRef.current = new window.YT!.Player("tanu-youtube-player", {
        width: 1,
        height: 1,
        videoId: "",
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: (event) => {
            playerReadyRef.current = true;
            if (currentTrackRef.current) event.target.cueVideoById(currentTrackRef.current.videoId);
            setPlayerReady(true);
            setIsTrackLoading(false);
          },
          onStateChange: (event) => {
            if (event.data === 1) {
              setIsPlaying(true);
              setIsTrackLoading(false);
            }
            if (event.data === 2) setIsPlaying(false);
            if (event.data === 0) playNext();
          },
          onError: () => {
            setIsTrackLoading(false);
            replaceUnavailableTrack();
          },
        },
      });
    };

    if (window.YT?.Player) {
      ready();
    } else {
      const existingScript = document.getElementById("youtube-iframe-api");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "youtube-iframe-api";
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        ready();
      };
    }

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      playerReadyRef.current = false;
      if (rainRef.current) {
        stopRainGraph(rainRef.current);
        rainRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || !playerRef.current) return undefined;
    const progressTimer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setElapsed(player.getCurrentTime());
      setDuration(player.getDuration());
    }, 600);
    return () => window.clearInterval(progressTimer);
  }, [isPlaying]);

  useEffect(() => {
    const quoteTimer = window.setInterval(() => {
      setQuoteIndex((previous) => (previous + 1) % saloonQuotes.length);
    }, 5500);
    return () => window.clearInterval(quoteTimer);
  }, []);

  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: `Tanu Ka Tadka · ${currentTrack.category}`,
      artwork: [
        { src: `https://i.ytimg.com/vi/${currentTrack.videoId}/hqdefault.jpg`, sizes: "480x360", type: "image/jpeg" },
        { src: "/tanu-tadka-app-icon.svg", sizes: "512x512", type: "image/svg+xml" },
      ],
    });
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const addAction = (action: MediaSessionAction, handler: () => void) => {
      try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* Unsupported actions are safely omitted by the browser. */ }
    };
    addAction("play", () => playerRef.current?.playVideo());
    addAction("pause", () => playerRef.current?.pauseVideo());
    addAction("nexttrack", () => selectNextTrack(stationId));
    addAction("previoustrack", () => playPrevious());
    addAction("seekbackward", () => {
      const nextTime = Math.max(0, (playerRef.current?.getCurrentTime() ?? 0) - 15);
      playerRef.current?.seekTo(nextTime, true);
    });
    addAction("seekforward", () => {
      const nextTime = Math.min(playerRef.current?.getDuration() ?? 0, (playerRef.current?.getCurrentTime() ?? 0) + 15);
      playerRef.current?.seekTo(nextTime, true);
    });
    return () => {
      (["play", "pause", "nexttrack", "previoustrack", "seekbackward", "seekforward"] as MediaSessionAction[]).forEach((action) => {
        try { navigator.mediaSession.setActionHandler(action, null); } catch { /* Action may not be implemented by this browser. */ }
      });
    };
  }, [stationId]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !duration || !Number.isFinite(duration)) return;
    try {
      navigator.mediaSession.setPositionState({ duration, playbackRate: 1, position: Math.min(Math.max(elapsed, 0), duration) });
    } catch { /* Position display is optional and browser-dependent. */ }
  }, [duration, elapsed]);

  return (
    <main className="site-shell">
      <div id="tanu-youtube-player" className="youtube-host" aria-hidden="true" />
      <header className="site-header compact-header">
        <a href="#top" className="brand-mark" aria-label="Tanu Ka Tadka home">
          <Scissors aria-hidden="true" className="brand-icon" />
          <span className="brand-lockup"><span className="brand-devanagari">तनु का तड़का</span><span className="brand-roman">THE MOHALLA MEMORY STATION</span></span>
        </a>
        <button className="mobile-menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="site-navigation">
          {menuOpen ? <X size={18} /> : <Menu size={19} />}<span>Menu</span>
        </button>
        <nav id="site-navigation" className={menuOpen ? "site-nav nav-open" : "site-nav"} aria-label="Primary navigation">
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a><a href="#support" onClick={() => setMenuOpen(false)}>Support</a>
        </nav>
      </header>

      <section id="top" className={rainOn ? "radio-hero monsoon-active" : "radio-hero"} aria-labelledby="radio-title">
        <img className="hero-studio-image" src={STUDIO_HERO_IMAGE} alt="" aria-hidden="true" />
        <div className="background-ephemera" aria-hidden="true"><span className="tuner-ghost" /><span className="rain-window" /><span className="window-glow" /><span className="rain-backdrop" /><span className="rain-foreground" /></div>
        <span className={lightningFlash ? "lightning-flash flash-active" : "lightning-flash"} aria-hidden="true" />
        <div className="hero-wordmark" aria-hidden="true">TANU KA TADKA</div>
        <div className="radio-stack">
          <p className="micro-station"><Radio size={14} /> <span lang="hi">रेडियो नंबर २०००</span> · ODISHA × HINDUSTAN</p>
          <h1 id="radio-title" className="sr-only">Tanu Ka Tadka YouTube radio player</h1>
          <button type="button" className={rainOn ? "rain-pill rain-is-on" : "rain-pill"} onClick={toggleRain} aria-pressed={rainOn} title="Add quiet rain and an occasional soft thunder roll below the song">
            <span className="rain-emoji">🌧️</span><span>Barish or Gaane?</span><b>{rainOn ? "ON" : "OFF"}</b>
          </button>
          <label className={rainOn ? "rain-mixer mixer-live" : "rain-mixer"}>
            <span><Volume2 size={14} /> Rain level</span>
            <input type="range" min="0" max="100" value={rainVolume} onChange={(event) => updateRainVolume(Number(event.target.value))} aria-label="Ambient rain volume" disabled={!rainOn} />
            <output>{rainVolume}%</output>
          </label>

          <section className="station-dial" aria-label="Genre and era station modes">
            <div className="station-dial-title"><SlidersHorizontal size={14} /><span>Station dial</span><b>{STATION_MODES.find((station) => station.id === stationId)?.label}</b></div>
            <div className="station-options">
              {STATION_MODES.map((station) => <button key={station.id} type="button" className={stationId === station.id ? "station-option station-option-active" : "station-option"} onClick={() => handleStationChange(station.id)}>{station.label}</button>)}
            </div>
          </section>

          <div className="share-card">
            <span className="whatsapp-orb"><MessageCircle size={25} fill="currentColor" /></span>
            <div className="share-copy"><strong lang="hi">शेयर करे और जादू देखे! ✨</strong><span>5 Groups me share karein ({shareCount}/5)</span></div>
            <button type="button" onClick={handleShare} className="share-button">Share <b>{shareCount}/5</b></button>
            <div className="share-progress" aria-label={`${shareCount} of 5 shares`}><i style={{ width: `${(shareCount / 5) * 100}%` }} /></div>
          </div>

          <section className="compact-player" aria-label="YouTube radio player">
            {isTrackLoading && <div className="track-loading" role="status"><Loader2 size={14} /><span>Loading next radio record…</span></div>}
            <div className="track-row">
              <img className="track-thumb" src={displayTrack.videoId ? `https://i.ytimg.com/vi/${displayTrack.videoId}/hqdefault.jpg` : RADIO_IMAGE} alt="" />
              <div className="track-meta">
                <div className="track-kicker"><span className={displayTrack.language === "Odia" ? "odia-tag" : "hindi-tag"}>{displayTrack.language}</span> TUNED IN</div>
                <strong title={displayTrack.title}>{displayTrack.title}</strong>
                <span className="track-subtitle">{displayTrack.category} · 1,000-song no-repeat cycle</span>
              </div>
              <div className="compact-controls">
                <button type="button" className="circle-control" onClick={playPrevious} disabled={!playerReady} aria-label="Previous song"><SkipBack fill="currentColor" size={15} /></button>
                <button type="button" className={isPlaying ? "main-control is-playing" : "main-control"} onClick={togglePlayback} disabled={!playerReady} aria-label={isPlaying ? "Pause song" : "Play song"}>
                  {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
                </button>
                <button type="button" className="circle-control" onClick={playNext} disabled={!playerReady} aria-label="Next random song"><SkipForward fill="currentColor" size={15} /></button>
              </div>
            </div>
            <div className="time-row"><span>{formatTime(elapsed)}</span><input type="range" min="0" max={Math.max(duration, 1)} value={Math.min(elapsed, Math.max(duration, 1))} onChange={(event) => { const nextTime = Number(event.target.value); playerRef.current?.seekTo(nextTime, true); setElapsed(nextTime); }} aria-label="Song progress" /><span>{formatTime(duration)}</span></div>
            <div className="player-foot"><span>{playerReady ? (isPlaying ? `Playing from YouTube · ${queueProgress.played}/${CATALOGUE_TOTAL}` : `No-repeat queue · ${queueProgress.remaining} left`) : "Tuning the 1,000-song radio…"}</span><a href={displayTrack.spotifyUrl} target="_blank" rel="noreferrer">Listen full song on Spotify <ExternalLink size={13} /></a></div>
            <div className="lock-screen-note"><Smartphone size={14} /><span><strong>Lock-screen controls:</strong> after you press play, supported browsers can show play, pause, and skip controls. Install the site from your browser menu for a more app-like listener.</span></div>
          </section>
          <p className="saloon-quote"><Scissors size={15} /> {saloonQuotes[quoteIndex]}</p>
        </div>
      </section>

      <section id="about" className="about-section" aria-labelledby="about-heading">
        <div className="about-image-wrap"><img src={RADIO_IMAGE} alt="Illustrated old transistor radio on a saloon counter" className="about-image" /><span className="image-ticket"><Scissors aria-hidden="true" className="ticket-icon" /> <span lang="or">ପୁରୁଣା ରେଡିଓ</span></span></div>
        <div className="about-copy">
          <div className="section-eyebrow"><span>01</span><span lang="hi">कहानी</span> · <span lang="or">କାହାଣୀ</span></div>
          <h2 id="about-heading">Not a playlist.<br /><em>Ek purana adda.</em></h2>
          <p className="lead">Tanu Ka Tadka recreates the sound and feeling of a classic Odisha + North Indian neighbourhood barbershop from the 2000s.</p>
          <p>There was always a battered radio in the corner: an Odia favourite after a Hindi song, scissors tapping against a comb, and someone asking for a “thoda aur short” cut. This is that room, online.</p>
          <div className="about-notes"><div><Youtube size={19} /><span><strong>YouTube radio engine</strong>Full tracks through the hidden player.</span></div><div><Music2 size={19} /><span><strong>Mixed by memory</strong>Odia + Hindi, randomly tuned.</span></div><div><Volume2 size={19} /><span><strong>Spotify, if you want it</strong>Open the current song in the app.</span></div></div>
        </div>
      </section>

      <section className="monsoon-banner" aria-label="Rainy saloon mood"><img src={MONSOON_IMAGE} alt="Illustrated rainy window inside an old neighbourhood barbershop" /><div className="monsoon-copy"><span lang="hi">बारिश वाली साइड B</span><h2>Volume low.<br />Memories high.</h2><button type="button" onClick={toggleRain}>{rainOn ? "Barish band karo" : "Barish chalao"}<Waves size={16} /></button></div></section>

      <section id="faq" className="faq-section" aria-labelledby="faq-heading">
        <div className="faq-intro"><div className="section-eyebrow"><span>02</span><span lang="hi">पूछो</span> · <span lang="or">ପଚାରନ୍ତୁ</span></div><h2 id="faq-heading">Pucho. Hum<br /><em>radio pe hain.</em></h2><p>Natural answers for curious listeners, lost playlists, and anyone wondering why a haircut somehow makes old songs sound better.</p><div className="faq-side-mark"><CircleHelp size={28} /><span>ASK THE<br />SALOON</span></div></div>
        <div className="faq-list"><div className="faq-receipt"><Scissors aria-hidden="true" className="receipt-icon" /><span lang="hi">सवाल पर्ची</span></div>{faqs.map((faq, index) => { const isOpen = activeFaq === index; return <article className={isOpen ? "faq-item faq-open" : "faq-item"} key={faq.question}><button type="button" onClick={() => setActiveFaq(isOpen ? null : index)} aria-expanded={isOpen}><span className="faq-number">0{index + 1}</span><span>{faq.question}</span><ChevronDown size={19} /></button><div className="faq-answer" hidden={!isOpen}><p>{faq.answer}</p></div></article>; })}</div>
      </section>

      <section id="support" className="support-section" aria-labelledby="support-heading">
        <div className="support-copy"><div className="section-eyebrow"><span>03</span><span lang="hi">दुकान खुली रहे</span> · <span lang="or">ରେଡିଓ ଚାଲୁ ରହୁ</span></div><h2 id="support-heading">Chai ka paisa nahi.<br /><em>Bas radio chalta rahe.</em></h2><p>Tanu Ka Tadka stays free. If this little corner makes your day softer, an optional voluntary contribution helps keep the curation, art, and radio signal alive.</p><p className="support-small">No pressure. Your listening is already support enough.</p></div>
        <div className="upi-card"><span className="upi-corner upi-tl" /><span className="upi-corner upi-tr" /><span className="upi-corner upi-bl" /><span className="upi-corner upi-br" /><div className="upi-top"><span>PHONEPE · UPI</span><span>OPTIONAL</span></div><div className="upi-qr-frame"><img src={UPI_QR_IMAGE} alt="UPI payment QR code for Tanmay Malik" /></div><strong>TANMAY MALIK</strong><small>Scan with any UPI app to support the radio.</small></div>
      </section>

      <section className="community-section" aria-labelledby="community-heading"><div className="community-copy"><span className="community-eyebrow"><span lang="hi">गाना सूचना</span> · <span lang="or">ଗୀତ ଖବର</span><Scissors aria-hidden="true" className="community-mark" /></span><h2 id="community-heading">Naya purana gaana mila?<br /><em>WhatsApp pe bol dena.</em></h2><p>Join the TANU Ka Tadka noticeboard for song updates, rainy-day picks, and the occasional “yeh waala suna do” request.</p></div><Dialog><DialogTrigger asChild><button type="button" className="whatsapp-button"><Send size={19} /> Join the WhatsApp channel <ChevronRight size={18} /></button></DialogTrigger><DialogContent className="saloon-dialog border-[#d69a35]/40 bg-[#28140c] text-[#f8edcf] sm:max-w-md"><DialogHeader><div className="dialog-icon"><Send size={23} /></div><DialogTitle className="font-[Yatra_One] text-3xl font-normal text-[#f6c75a]">Mohalla noticeboard</DialogTitle><DialogDescription className="text-base leading-relaxed text-[#e7cf9d]">The TANU Ka Tadka WhatsApp Channel is live for fresh song updates, rainy-day picks, and neighbourhood radio notices.</DialogDescription></DialogHeader><a className="dialog-cta" href="https://whatsapp.com/channel/0029VbDJ4ay2ZjCk4YJUwR3Y" target="_blank" rel="noreferrer">Join TANU Ka Tadka <ExternalLink size={16} /></a></DialogContent></Dialog></section>

      <footer className="site-footer"><div className="footer-brand"><Scissors aria-hidden="true" className="footer-icon" /><div><span>तनु का तड़का</span><small>THE MOHALLA MEMORY STATION</small></div></div><p><span lang="hi">रेडियो वाला कोना खुला है।</span><br /><span lang="or">ରେଡିଓ କୋଣ ସବୁବେଳେ ଖୋଲା।</span></p><div className="footer-links"><a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={17} />Instagram</a><a href="https://www.youtube.com" target="_blank" rel="noreferrer"><Youtube size={18} />YouTube</a><a href="mailto:radio@tanukatadka.in"><Mail size={17} />Contact</a></div><div className="footer-bottom"><span>© 2026 Tanu Ka Tadka</span><span>Powered by <strong>Tadka Studio</strong></span><span>No login. Just radio.</span></div></footer>
    </main>
  );
}
