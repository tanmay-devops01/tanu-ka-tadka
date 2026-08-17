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
  Volume2,
  Waves,
  X,
  Youtube,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MIXED_PLAYLIST, type RadioTrack } from "@/lib/playlist";

const LOGO_IMAGE = "/manus-storage/tanu-ka-tadka-logo-mark_1cf2b397.png";
const RADIO_IMAGE = "/manus-storage/tanu-ka-tadka-radio-detail_5270d6dc.png";
const MONSOON_IMAGE = "/manus-storage/tanu-ka-tadka-monsoon-window_51d299e1.png";
const STUDIO_HERO_IMAGE = "/manus-storage/tanu-ka-tadka-studio-hero_7b168e01.jpeg";
const UPI_QR_IMAGE = "/manus-storage/tanu-ka-tadka-upi-qr_25f9bcf8.jpeg";

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
  const initialTrackIndexRef = useRef(Math.floor(Math.random() * MIXED_PLAYLIST.length));
  const [trackIndex, setTrackIndex] = useState(initialTrackIndexRef.current);
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
  const playerRef = useRef<YouTubePlayer | null>(null);
  const rainRef = useRef<RainGraph | null>(null);
  const trackIndexRef = useRef(initialTrackIndexRef.current);
  const currentTrack = MIXED_PLAYLIST[trackIndex];

  const pickRandomIndex = (exclude = trackIndexRef.current) => {
    if (MIXED_PLAYLIST.length < 2) return 0;
    let next = exclude;
    while (next === exclude) next = Math.floor(Math.random() * MIXED_PLAYLIST.length);
    return next;
  };

  const loadTrack = (nextIndex: number, autoplay: boolean) => {
    trackIndexRef.current = nextIndex;
    setTrackIndex(nextIndex);
    setElapsed(0);
    setDuration(0);
    const player = playerRef.current;
    if (!player) return;
    if (autoplay) player.loadVideoById(MIXED_PLAYLIST[nextIndex].videoId);
    else player.cueVideoById(MIXED_PLAYLIST[nextIndex].videoId);
  };

  const playNext = () => loadTrack(pickRandomIndex(), true);
  const playPrevious = () => {
    const previous = (trackIndexRef.current - 1 + MIXED_PLAYLIST.length) % MIXED_PLAYLIST.length;
    loadTrack(previous, true);
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
    const ready = () => {
      playerRef.current = new window.YT!.Player("tanu-youtube-player", {
        width: 1,
        height: 1,
        videoId: MIXED_PLAYLIST[trackIndexRef.current].videoId,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: (event) => {
            event.target.cueVideoById(MIXED_PLAYLIST[trackIndexRef.current].videoId);
            setPlayerReady(true);
          },
          onStateChange: (event) => {
            if (event.data === 1) setIsPlaying(true);
            if (event.data === 2) setIsPlaying(false);
            if (event.data === 0) playNext();
          },
          onError: () => playNext(),
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

  return (
    <main className="site-shell">
      <div id="tanu-youtube-player" className="youtube-host" aria-hidden="true" />
      <header className="site-header compact-header">
        <a href="#top" className="brand-mark" aria-label="Tanu Ka Tadka home">
          <img src={LOGO_IMAGE} alt="" className="brand-icon" />
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

          <div className="share-card">
            <span className="whatsapp-orb"><MessageCircle size={25} fill="currentColor" /></span>
            <div className="share-copy"><strong lang="hi">शेयर करे और जादू देखे! ✨</strong><span>5 Groups me share karein ({shareCount}/5)</span></div>
            <button type="button" onClick={handleShare} className="share-button">Share <b>{shareCount}/5</b></button>
            <div className="share-progress" aria-label={`${shareCount} of 5 shares`}><i style={{ width: `${(shareCount / 5) * 100}%` }} /></div>
          </div>

          <section className="compact-player" aria-label="YouTube radio player">
            <div className="track-row">
              <img className="track-thumb" src={`https://i.ytimg.com/vi/${currentTrack.videoId}/hqdefault.jpg`} alt="" />
              <div className="track-meta">
                <div className="track-kicker"><span className={currentTrack.language === "Odia" ? "odia-tag" : "hindi-tag"}>{currentTrack.language}</span> TUNED IN</div>
                <strong title={currentTrack.title}>{currentTrack.title}</strong>
                <span className="track-subtitle">{currentTrack.mood}</span>
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
            <div className="player-foot"><span>{playerReady ? (isPlaying ? "Playing from YouTube" : "Tap play to tune in") : "Tuning the old radio…"}</span><a href={currentTrack.spotifyUrl} target="_blank" rel="noreferrer">Listen full song on Spotify <ExternalLink size={13} /></a></div>
          </section>
          <p className="saloon-quote"><Scissors size={15} /> {saloonQuotes[quoteIndex]}</p>
        </div>
      </section>

      <section id="about" className="about-section" aria-labelledby="about-heading">
        <div className="about-image-wrap"><img src={RADIO_IMAGE} alt="Illustrated old transistor radio on a saloon counter" className="about-image" /><span className="image-ticket"><img src={LOGO_IMAGE} alt="" /> <span lang="or">ପୁରୁଣା ରେଡିଓ</span></span></div>
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
        <div className="faq-list"><div className="faq-receipt"><img src={LOGO_IMAGE} alt="" /><span lang="hi">सवाल पर्ची</span></div>{faqs.map((faq, index) => { const isOpen = activeFaq === index; return <article className={isOpen ? "faq-item faq-open" : "faq-item"} key={faq.question}><button type="button" onClick={() => setActiveFaq(isOpen ? null : index)} aria-expanded={isOpen}><span className="faq-number">0{index + 1}</span><span>{faq.question}</span><ChevronDown size={19} /></button><div className="faq-answer" hidden={!isOpen}><p>{faq.answer}</p></div></article>; })}</div>
      </section>

      <section id="support" className="support-section" aria-labelledby="support-heading">
        <div className="support-copy"><div className="section-eyebrow"><span>03</span><span lang="hi">दुकान खुली रहे</span> · <span lang="or">ରେଡିଓ ଚାଲୁ ରହୁ</span></div><h2 id="support-heading">Chai ka paisa nahi.<br /><em>Bas radio chalta rahe.</em></h2><p>Tanu Ka Tadka stays free. If this little corner makes your day softer, an optional voluntary contribution helps keep the curation, art, and radio signal alive.</p><p className="support-small">No pressure. Your listening is already support enough.</p></div>
        <div className="upi-card"><span className="upi-corner upi-tl" /><span className="upi-corner upi-tr" /><span className="upi-corner upi-bl" /><span className="upi-corner upi-br" /><div className="upi-top"><span>PHONEPE · UPI</span><span>OPTIONAL</span></div><div className="upi-qr-frame"><img src={UPI_QR_IMAGE} alt="UPI payment QR code for Tanmay Malik" /></div><strong>TANMAY MALIK</strong><small>Scan with any UPI app to support the radio.</small></div>
      </section>

      <section className="community-section" aria-labelledby="community-heading"><div className="community-copy"><span className="community-eyebrow"><span lang="hi">गाना सूचना</span> · <span lang="or">ଗୀତ ଖବର</span><img src={LOGO_IMAGE} alt="" /></span><h2 id="community-heading">Naya purana gaana mila?<br /><em>WhatsApp pe bol dena.</em></h2><p>Join the TANU Ka Tadka noticeboard for song updates, rainy-day picks, and the occasional “yeh waala suna do” request.</p></div><Dialog><DialogTrigger asChild><button type="button" className="whatsapp-button"><Send size={19} /> Join the WhatsApp channel <ChevronRight size={18} /></button></DialogTrigger><DialogContent className="saloon-dialog border-[#d69a35]/40 bg-[#28140c] text-[#f8edcf] sm:max-w-md"><DialogHeader><div className="dialog-icon"><Send size={23} /></div><DialogTitle className="font-[Yatra_One] text-3xl font-normal text-[#f6c75a]">Mohalla noticeboard</DialogTitle><DialogDescription className="text-base leading-relaxed text-[#e7cf9d]">The TANU Ka Tadka WhatsApp Channel is live for fresh song updates, rainy-day picks, and neighbourhood radio notices.</DialogDescription></DialogHeader><a className="dialog-cta" href="https://whatsapp.com/channel/0029VbDJ4ay2ZjCk4YJUwR3Y" target="_blank" rel="noreferrer">Join TANU Ka Tadka <ExternalLink size={16} /></a></DialogContent></Dialog></section>

      <footer className="site-footer"><div className="footer-brand"><img src={LOGO_IMAGE} alt="" /><div><span>तनु का तड़का</span><small>THE MOHALLA MEMORY STATION</small></div></div><p><span lang="hi">रेडियो वाला कोना खुला है।</span><br /><span lang="or">ରେଡିଓ କୋଣ ସବୁବେଳେ ଖୋଲା।</span></p><div className="footer-links"><a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={17} />Instagram</a><a href="https://www.youtube.com" target="_blank" rel="noreferrer"><Youtube size={18} />YouTube</a><a href="mailto:radio@tanukatadka.in"><Mail size={17} />Contact</a></div><div className="footer-bottom"><span>© 2026 Tanu Ka Tadka</span><span>Powered by <strong>Tadka Studio</strong></span><span>No login. Just radio.</span></div></footer>
    </main>
  );
}
