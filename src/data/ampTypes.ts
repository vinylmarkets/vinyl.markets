export interface AmpType {
  id: string;
  name: string;
  description: string;
  genre: string;
  vibe: string;
  bandName?: string;
  era?: string;
}

export const ampTypes: AmpType[] = [
  { 
    id: 'tubeamp-v1', 
    name: 'TubeAmp v1', 
    description: 'Momentum Scanner', 
    genre: 'rock', 
    vibe: 'energetic',
    bandName: 'The Momentum Makers',
    era: '1970s'
  },
  { 
    id: 'reverb', 
    name: 'Reverb', 
    description: 'Mean Reversion', 
    genre: 'psychedelic', 
    vibe: 'dreamy',
    bandName: 'The Return Traders',
    era: '1960s'
  },
  { 
    id: 'delay-pedal', 
    name: 'Delay Pedal', 
    description: 'Swing Trading', 
    genre: 'funk', 
    vibe: 'groovy',
    bandName: 'Swing Shift Orchestra',
    era: '1970s'
  },
  { 
    id: 'compressor', 
    name: 'Compressor', 
    description: 'Volatility Arbitrage', 
    genre: 'jazz', 
    vibe: 'smooth',
    bandName: 'The Volatility Players',
    era: '1960s'
  },
  { 
    id: 'overdrive', 
    name: 'Overdrive', 
    description: 'Breakout Strategy', 
    genre: 'hard-rock', 
    vibe: 'aggressive',
    bandName: 'The Breakout Kings',
    era: '1980s'
  },
  { 
    id: 'phaser', 
    name: 'Phaser', 
    description: 'Pairs Trading', 
    genre: 'prog-rock', 
    vibe: 'complex',
    bandName: 'The Correlation Collective',
    era: '1970s'
  },
  { 
    id: 'chorus', 
    name: 'Chorus', 
    description: 'Trend Following', 
    genre: 'pop', 
    vibe: 'catchy',
    bandName: 'The Trend Riders',
    era: '1980s'
  },
  { 
    id: 'wah-wah', 
    name: 'Wah-Wah', 
    description: 'Options Flow Analysis', 
    genre: 'blues', 
    vibe: 'soulful',
    bandName: 'The Flow Masters',
    era: '1960s'
  },
  { 
    id: 'tremolo', 
    name: 'Tremolo', 
    description: 'Range Trading', 
    genre: 'surf-rock', 
    vibe: 'retro',
    bandName: 'The Range Riders',
    era: '1960s'
  },
  { 
    id: 'fuzz-box', 
    name: 'Fuzz Box', 
    description: 'Gap Trading', 
    genre: 'garage-rock', 
    vibe: 'raw',
    bandName: 'The Gap Fillers',
    era: '1960s'
  },
  { 
    id: 'flanger', 
    name: 'Flanger', 
    description: 'Statistical Arbitrage', 
    genre: 'electronic', 
    vibe: 'futuristic',
    bandName: 'The Stat Arbiters',
    era: '1980s'
  },
  { 
    id: 'echo-chamber', 
    name: 'Echo Chamber', 
    description: 'Pattern Recognition', 
    genre: 'dub', 
    vibe: 'spacey',
    bandName: 'The Pattern Seekers',
    era: '1970s'
  },
  { 
    id: 'sustain', 
    name: 'Sustain', 
    description: 'Position Holding', 
    genre: 'folk', 
    vibe: 'steady',
    bandName: 'The Long Hold',
    era: '1970s'
  },
  { 
    id: 'distortion', 
    name: 'Distortion', 
    description: 'High Frequency Trading', 
    genre: 'metal', 
    vibe: 'intense',
    bandName: 'The Speed Demons',
    era: '1980s'
  },
  { 
    id: 'loop-station', 
    name: 'Loop Station', 
    description: 'Seasonal Trading', 
    genre: 'ambient', 
    vibe: 'repetitive',
    bandName: 'The Cycle Traders',
    era: '1990s'
  }
];

export const eras = ['1960s', '1970s', '1980s', '1990s'];
export const genres = [...new Set(ampTypes.map(a => a.genre))];
