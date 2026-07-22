'use client';

import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { useEffect, useMemo, useRef, useState } from 'react';

type Film = { id: string; act: string; title: string; cue: string; prompt: string };

function thumb(id: string) { return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`; }

export default function NightJourney({ films }: { films: Film[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.25 });
  const glow = useTransform(progress, [0, 0.45, 1], ['rgba(197,164,105,.10)', 'rgba(255,255,255,.16)', 'rgba(197,164,105,.28)']);
  const rotateX = useTransform(my, [-12, 12], [2, -2]);
  const rotateY = useTransform(mx, [-12, 12], [-3, 3]);

  const activeFilm = films[active];
  const embed = useMemo(() => {
    const params = new URLSearchParams({ autoplay: entered ? '1' : '0', mute: '1', controls: '0', loop: '1', playlist: activeFilm.id, playsinline: '1', modestbranding: '1', rel: '0' });
    return `https://www.youtube-nocookie.com/embed/${activeFilm.id}?${params}`;
  }, [activeFilm.id, entered]);

  useEffect(() => {
    if (!root.current) return;
    const cards = gsap.utils.toArray<HTMLElement>('[data-film-card]');
    const observers = cards.map((card, index) => {
      const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setActive(index), { threshold: 0.58 });
      io.observe(card);
      return io;
    });
    gsap.fromTo('[data-word]', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: 'power3.out' });
    return () => observers.forEach((io) => io.disconnect());
  }, []);

  return (
    <main ref={root} className="night" onPointerMove={(e) => { mx.set((e.clientX / innerWidth - .5) * 24); my.set((e.clientY / innerHeight - .5) * 24); }}>
      <motion.div className="aura" style={{ background: glow, x: mx, y: my }} />
      <div className="grain" />
      <section className="stage" aria-label="ZILLY cinematic venue experience">
        <motion.div className="videoShell" style={{ rotateX, rotateY }}>
          {!entered && <img src={thumb(activeFilm.id)} alt="Cinematic frame from ZILLY" className="poster" />}
          {entered && <iframe title={`${activeFilm.act} film`} src={embed} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />}
          <div className="vignette" />
        </motion.div>
        <div className="brand"><span>ZILLY</span><small>THE NIGHT NEVER ENDS</small></div>
        <button className="enter" onClick={() => setEntered(true)} aria-label="Start the cinematic experience">{entered ? activeFilm.prompt : 'Touch to wake the venue'}</button>
        <div className="counter">0{active + 1} / 04</div>
      </section>

      <section className="story">
        {films.map((film, index) => (
          <article className="chapter" data-film-card key={film.id}>
            <p className="act">{film.act}</p>
            <h1>{film.title.split(' ').map((w) => <span data-word key={w}>{w} </span>)}</h1>
            <p className="cue">{film.cue}</p>
            <div className="scrub"><span style={{ transform: `scaleX(${active === index ? 1 : .18})` }} /></div>
          </article>
        ))}
        <article className="reservation" data-film-card>
          <p className="act">Reservation</p>
          <h2>Your table is not a booking. It is the final scene.</h2>
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
