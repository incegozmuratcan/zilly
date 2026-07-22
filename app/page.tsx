import NightJourney from '@/components/NightJourney';

const films = [
  {
    id: 'fxa-rXTGWbk',
    act: 'Arrival',
    title: 'Sea level entry',
    cue: 'A quiet threshold: architecture, salt air, the first pull of the night.',
    prompt: 'Hold to enter',
  },
  {
    id: 'XSOmL0BTRPk',
    act: 'Curiosity',
    title: 'The room breathes',
    cue: 'Details reveal themselves in fragments — stone, glass, silhouettes, water.',
    prompt: 'Drag the lens',
  },
  {
    id: 'tFhgNLyTQ_c',
    act: 'Energy',
    title: 'Pulse after dark',
    cue: 'The venue stops being a place and becomes a living signal.',
    prompt: 'Release the night',
  },
  {
    id: 'fGda0SW1J0o',
    act: 'Desire',
    title: 'The last table',
    cue: 'The journey narrows to one decision: be inside before the night disappears.',
    prompt: 'Reserve the ending',
  },
];

export default function Home() {
  return <NightJourney films={films} />;
}
