'use client';

import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { useEffect, useMemo, useRef, useState } from 'react';

type Film = { id: string; act: string; title: string; cue: string; prompt: string };

function thumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

function useVenueAudio(awake: boolean) {
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!awake || audioRef.current) return;

    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    const ctx = new AudioCtor();
    audioRef.current = ctx;

    const master = ctx.createGain();
    const low = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const pulse = ctx.createOscillator();
    const pulseGain = ctx.createGain();
    const shimmerGain = ctx.createGain();
    const lowGain = ctx.createGain();

    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 8);
    low.frequency.value = 43.65;
    shimmer.frequency.value = 220;
    pulse.frequency.value = 0.23;
    low.type = 'sine';
    shimmer.type = 'triangle';
    pulse.type = 'sine';
    lowGain.gain.value = 0.62;
    shimmerGain.gain.value = 0.025;
    pulseGain.gain.value = 0.015;

    low.connect(lowGain).connect(master);
    shimmer.connect(shimmerGain).connect(master);
    pulse.connect(pulseGain).connect(master);
    master.connect(ctx.destination);
    low.start();
    shimmer.start();
    pulse.start();

    return () => {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      window.setTimeout(() => void ctx.close(), 900);
      audioRef.current = null;
    };
  }, [awake]);
}

export default function NightJourney({ films }: { films: Film[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 82, damping: 26, mass: 0.22 });
  const glow = useTransform(progress, [0, 0.12, 0.52, 0.84, 1], ['rgba(20,14,8,.05)', 'rgba(197,164,105,.18)', 'rgba(255,255,255,.13)', 'rgba(197,164,105,.32)', 'rgba(0,0,0,.02)']);
  const exposure = useTransform(progress, [0, 0.1, 0.6, 0.9, 1], [0.45, 0.82, 0.9, 0.72, 0.16]);
  const curtain = useTransform(progress, [0, 0.78, 0.93, 1], ['rgba(0,0,0,.52)', 'rgba(0,0,0,.08)', 'rgba(0,0,0,.72)', 'rgba(0,0,0,.94)']);
  const rotateX = useTransform(my, [-12, 12], [1.4, -1.4]);
  const rotateY = useTransform(mx, [-12, 12], [-2.2, 2.2]);
  const drift = useTransform(progress, [0, 1], ['scale(1.1) translate3d(0,0,0)', 'scale(1.18) translate3d(-1.5%,0,0)']);

  useVenueAudio(entered);

  const activeFilm = films[active];
  const embed = useMemo(() => {
    const params = new URLSearchParams({ autoplay: entered ? '1' : '0', mute: '1', controls: '0', loop: '1', playlist: activeFilm.id, playsinline: '1', modestbranding: '1', rel: '0', enablejsapi: '1' });
    return `https://www.youtube-nocookie.com/embed/${activeFilm.id}?${params}`;
  }, [activeFilm.id, entered]);

  useEffect(() => {
    const cards = gsap.utils.toArray<HTMLElement>('[data-film-card]');
    const observers = cards.map((card, index) => {
      const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setActive(Math.min(index, films.length - 1)), { rootMargin: '-30% 0px -45% 0px', threshold: 0.01 });
      io.observe(card);
      return io;
    });
    gsap.fromTo('[data-word]', { y: 24, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.055, ease: 'power3.out' });
    return () => observers.forEach((io) => io.disconnect());
  }, [films.length]);

  return (
    <main
      ref={root}
      className={`night ${entered ? 'isAwake' : 'isSleeping'}`}
      onPointerMove={(e) => { mx.set((e.clientX / window.innerWidth - 0.5) * 24); my.set((e.clientY / window.innerHeight - 0.5) * 24); }}
    >
      <motion.div className="aura" style={{ background: glow, x: mx, y: my }} />
      <div className="grain" />
      <section className="stage" aria-label="ZILLY cinematic venue experience">
        <motion.div className="videoShell" style={{ rotateX, rotateY, opacity: exposure }}>
          <motion.div className="camera" style={{ transform: drift }}>
            {!entered && <img src={thumb(activeFilm.id)} alt="Cinematic frame from ZILLY" className="poster" />}
            {entered && <iframe title={`${activeFilm.act} film`} src={embed} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />}
          </motion.div>
          <motion.div className="blackout" style={{ background: curtain }} />
          <div className="vignette" />
          <div className="lightSweep" />
        </motion.div>
        <div className="brand"><span>ZILLY</span><small>THE NIGHT NEVER ENDS</small></div>
        <button className="enter" onClick={() => setEntered(true)} aria-label="Start the cinematic experience">
          <span>{entered ? activeFilm.prompt : 'Touch to wake the venue'}</span>
        </button>
        <div className="counter">0{active + 1} / 04</div>
      </section>

      <section className="story">
        {films.map((film, index) => (
          <article className="chapter" data-film-card key={film.id}>
            <p className="act">{film.act}</p>
            <h1>{film.title.split(' ').map((w) => <span data-word key={`${film.id}-${w}`}>{w} </span>)}</h1>
            <p className="cue">{film.cue}</p>
            <div className="scrub"><span style={{ transform: `scaleX(${active === index ? 1 : 0.18})` }} /></div>
          </article>
        ))}
        <article className="reservation" data-film-card>
          <p className="act">Dawn is near</p>
          <h2>The room fades. One table remains.</h2>
          <form>
            <input aria-label="Name" placeholder="Name" />
            <input aria-label="Phone" placeholder="Phone" />
            <button type="submit">Request the night</button>
          </form>
        </article>
      </section>
    </main>
  );
}
