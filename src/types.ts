export interface PlanetData {
  name: string;
  body: string; // astronomy-engine Body key  
  color: string;
  displaySize: number; // artistic radius for 3D
  orbitColor: string;
}

export interface PlanetPosition {
  name: string;
  x: number;  // heliocentric AU
  y: number;
  z: number;
  eclipticLongitude: number; // 0-360 degrees
  zodiacSign: ZodiacSign;
  degreeInSign: number; // 0-30
  formattedPosition: string; // e.g. "15°22' Aries"
}

export interface ZodiacSign {
  name: string;
  symbol: string;
  index: number; // 0-11
  startDegree: number;
  color: string;
}

export interface SimulationState {
  currentDate: Date;
  isPlaying: boolean;
  speedMultiplier: number;  // days per real second
  isReverse: boolean;
}

export type SpeedOption = {
  label: string;
  value: number;
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: 'Aries', symbol: '♈', index: 0, startDegree: 0, color: '#ff4444' },
  { name: 'Taurus', symbol: '♉', index: 1, startDegree: 30, color: '#44aa44' },
  { name: 'Gemini', symbol: '♊', index: 2, startDegree: 60, color: '#ffaa00' },
  { name: 'Cancer', symbol: '♋', index: 3, startDegree: 90, color: '#aaaaee' },
  { name: 'Leo', symbol: '♌', index: 4, startDegree: 120, color: '#ff8800' },
  { name: 'Virgo', symbol: '♍', index: 5, startDegree: 150, color: '#88aa44' },
  { name: 'Libra', symbol: '♎', index: 6, startDegree: 180, color: '#ee88aa' },
  { name: 'Scorpio', symbol: '♏', index: 7, startDegree: 210, color: '#aa2222' },
  { name: 'Sagittarius', symbol: '♐', index: 8, startDegree: 240, color: '#8844cc' },
  { name: 'Capricorn', symbol: '♑', index: 9, startDegree: 270, color: '#446688' },
  { name: 'Aquarius', symbol: '♒', index: 10, startDegree: 300, color: '#44aadd' },
  { name: 'Pisces', symbol: '♓', index: 11, startDegree: 330, color: '#8888cc' },
];

export const SPEED_OPTIONS: SpeedOption[] = [
  { label: '1x', value: 1 },
  { label: '10x', value: 10 },
  { label: '100x', value: 100 },
  { label: '1000x', value: 1000 },
  { label: '10000x', value: 10000 },
];

export const PLANETS: PlanetData[] = [
  { name: 'Mercury', body: 'Mercury', color: '#b5b5b5', displaySize: 0.15, orbitColor: '#b5b5b555' },
  { name: 'Venus', body: 'Venus', color: '#e8cda0', displaySize: 0.2, orbitColor: '#e8cda055' },
  { name: 'Earth', body: 'Earth', color: '#4da6ff', displaySize: 0.22, orbitColor: '#4da6ff55' },
  { name: 'Mars', body: 'Mars', color: '#c1440e', displaySize: 0.18, orbitColor: '#c1440e55' },
  { name: 'Jupiter', body: 'Jupiter', color: '#c88b3a', displaySize: 0.45, orbitColor: '#c88b3a55' },
  { name: 'Saturn', body: 'Saturn', color: '#e8d191', displaySize: 0.4, orbitColor: '#e8d19155' },
  { name: 'Uranus', body: 'Uranus', color: '#b3e4f7', displaySize: 0.3, orbitColor: '#b3e4f755' },
  { name: 'Neptune', body: 'Neptune', color: '#5b6eff', displaySize: 0.28, orbitColor: '#5b6eff55' },
  { name: 'Pluto', body: 'Pluto', color: '#d4a574', displaySize: 0.12, orbitColor: '#d4a57455' },
  { name: 'Ceres', body: 'Ceres', color: '#8faa7b', displaySize: 0.10, orbitColor: '#8faa7b55' },
  { name: 'Eris', body: 'Eris', color: '#c9c9d1', displaySize: 0.12, orbitColor: '#c9c9d155' },
  { name: 'Haumea', body: 'Haumea', color: '#e0d5d0', displaySize: 0.09, orbitColor: '#e0d5d055' },
  { name: 'Makemake', body: 'Makemake', color: '#d4956a', displaySize: 0.10, orbitColor: '#d4956a55' },
];

// Astrological interpretation data
export const PLANET_SIGN_MEANINGS: Record<string, Record<string, string>> = {
  Mercury: {
    Aries: 'Direct & assertive communication',
    Taurus: 'Slow, deliberate thinking',
    Gemini: 'Quick wit & versatile mind',
    Cancer: 'Intuitive & empathetic thoughts',
    Leo: 'Creative & dramatic expression',
    Virgo: 'Analytical & precise reasoning',
    Libra: 'Diplomatic communication',
    Scorpio: 'Penetrating & investigative mind',
    Sagittarius: 'Philosophical & expansive thinking',
    Capricorn: 'Structured & disciplined thought',
    Aquarius: 'Innovative & unconventional ideas',
    Pisces: 'Imaginative & dreamy thinking',
  },
  Venus: {
    Aries: 'Passionate & impulsive love',
    Taurus: 'Sensual & devoted affection',
    Gemini: 'Playful & curious romance',
    Cancer: 'Nurturing & protective love',
    Leo: 'Grand & generous affection',
    Virgo: 'Thoughtful & practical devotion',
    Libra: 'Harmonious & balanced love',
    Scorpio: 'Intense & transformative bonds',
    Sagittarius: 'Adventurous & free-spirited love',
    Capricorn: 'Committed & enduring affection',
    Aquarius: 'Unconventional & independent love',
    Pisces: 'Dreamy & compassionate romance',
  },
  Earth: {
    Aries: 'Grounded in action & initiative',
    Taurus: 'Rooted in comfort & stability',
    Gemini: 'Anchored in curiosity & learning',
    Cancer: 'Centered in home & family',
    Leo: 'Grounded in creativity & joy',
    Virgo: 'Rooted in service & health',
    Libra: 'Anchored in relationships & balance',
    Scorpio: 'Centered in transformation',
    Sagittarius: 'Grounded in exploration',
    Capricorn: 'Rooted in ambition & structure',
    Aquarius: 'Anchored in community & vision',
    Pisces: 'Centered in spirituality & dreams',
  },
  Mars: {
    Aries: 'Bold & fearless drive',
    Taurus: 'Steady & persistent energy',
    Gemini: 'Scattered but adaptable action',
    Cancer: 'Defensive & protective force',
    Leo: 'Confident & dramatic ambition',
    Virgo: 'Methodical & efficient drive',
    Libra: 'Diplomatic but indecisive action',
    Scorpio: 'Intense & strategic power',
    Sagittarius: 'Enthusiastic & restless energy',
    Capricorn: 'Disciplined & relentless ambition',
    Aquarius: 'Revolutionary & rebellious drive',
    Pisces: 'Subtle & compassionate action',
  },
  Jupiter: {
    Aries: 'Expansion through bold beginnings',
    Taurus: 'Growth through material abundance',
    Gemini: 'Wisdom through diverse knowledge',
    Cancer: 'Expansion through nurturing',
    Leo: 'Growth through creative expression',
    Virgo: 'Wisdom through practical service',
    Libra: 'Expansion through partnerships',
    Scorpio: 'Growth through deep transformation',
    Sagittarius: 'Boundless optimism & adventure',
    Capricorn: 'Disciplined expansion & mastery',
    Aquarius: 'Growth through innovation',
    Pisces: 'Spiritual wisdom & compassion',
  },
  Saturn: {
    Aries: 'Lessons in patience & leadership',
    Taurus: 'Discipline around resources',
    Gemini: 'Structure in communication',
    Cancer: 'Boundaries in emotional security',
    Leo: 'Discipline in self-expression',
    Virgo: 'Mastery through perfection',
    Libra: 'Lessons in commitment & fairness',
    Scorpio: 'Mastery through transformation',
    Sagittarius: 'Structure in beliefs & philosophy',
    Capricorn: 'Peak discipline & authority',
    Aquarius: 'Reform through innovation',
    Pisces: 'Spiritual discipline & surrender',
  },
  Uranus: {
    Aries: 'Revolutionary self-expression',
    Taurus: 'Disrupting material values',
    Gemini: 'Radical new ideas & tech',
    Cancer: 'Reinventing home & security',
    Leo: 'Creative revolution & breakthroughs',
    Virgo: 'Innovating health & systems',
    Libra: 'Transforming relationships',
    Scorpio: 'Deep collective awakening',
    Sagittarius: 'Freedom of belief & culture',
    Capricorn: 'Restructuring institutions',
    Aquarius: 'Peak innovation & liberation',
    Pisces: 'Spiritual & artistic awakening',
  },
  Neptune: {
    Aries: 'Visionary leadership & idealism',
    Taurus: 'Dreams of beauty & nature',
    Gemini: 'Mystical communication',
    Cancer: 'Deep emotional & psychic currents',
    Leo: 'Glamour & creative illusion',
    Virgo: 'Service through healing & faith',
    Libra: 'Idealistic love & artistry',
    Scorpio: 'Mystical transformations',
    Sagittarius: 'Spiritual seeking & visions',
    Capricorn: 'Dissolving old structures',
    Aquarius: 'Collective dreams & digital age',
    Pisces: 'Peak spiritual transcendence',
  },
  Pluto: {
    Aries: 'Transformation through raw courage',
    Taurus: 'Deep shifts in values & resources',
    Gemini: 'Radical change in communication',
    Cancer: 'Profound emotional transformation',
    Leo: 'Revolutionary creative power',
    Virgo: 'Transformation of daily systems',
    Libra: 'Deep shifts in relationships',
    Scorpio: 'Ultimate regenerative power',
    Sagittarius: 'Transforming beliefs & truth',
    Capricorn: 'Restructuring power & authority',
    Aquarius: 'Revolutionizing collective systems',
    Pisces: 'Dissolving boundaries of consciousness',
  },
  Ceres: {
    Aries: 'Nurturing through independence',
    Taurus: 'Abundant earth-based nourishment',
    Gemini: 'Care through communication',
    Cancer: 'Deep maternal nurturing energy',
    Leo: 'Nurturing through creative joy',
    Virgo: 'Healing through practical care',
    Libra: 'Nurturing through harmony',
    Scorpio: 'Transformative nurturing cycles',
    Sagittarius: 'Growth through expansive care',
    Capricorn: 'Structured & responsible nurturing',
    Aquarius: 'Nurturing community & humanity',
    Pisces: 'Spiritual & compassionate care',
  },
  Eris: {
    Aries: 'Fierce disruption & awakening',
    Taurus: 'Challenging material complacency',
    Gemini: 'Provocative truth-telling',
    Cancer: 'Disrupting emotional comfort zones',
    Leo: 'Radical authentic self-expression',
    Virgo: 'Exposing systemic flaws',
    Libra: 'Challenging unjust balances',
    Scorpio: 'Uncovering hidden power dynamics',
    Sagittarius: 'Shattering dogmatic beliefs',
    Capricorn: 'Toppling corrupt structures',
    Aquarius: 'Revolutionary social awakening',
    Pisces: 'Piercing through collective illusions',
  },
  Haumea: {
    Aries: 'Rebirth through bold action',
    Taurus: 'Creative fertility & abundance',
    Gemini: 'Birthing new ideas & connections',
    Cancer: 'Primal creative nurturing',
    Leo: 'Joyful creation & renewal',
    Virgo: 'Renewal through purification',
    Libra: 'Rebirth of partnerships',
    Scorpio: 'Deep regeneration & renewal',
    Sagittarius: 'Expanding creative horizons',
    Capricorn: 'Structured creative rebirth',
    Aquarius: 'Innovative creation & renewal',
    Pisces: 'Mystical rebirth & creation',
  },
  Makemake: {
    Aries: 'Environmental warrior energy',
    Taurus: 'Deep connection to earth wisdom',
    Gemini: 'Communicating nature\'s intelligence',
    Cancer: 'Protecting sacred environments',
    Leo: 'Celebrating primal creative force',
    Virgo: 'Devotion to natural systems',
    Libra: 'Balancing humanity & nature',
    Scorpio: 'Transforming relationship with earth',
    Sagittarius: 'Seeking primal truth & wisdom',
    Capricorn: 'Stewardship of natural resources',
    Aquarius: 'Innovating sustainable futures',
    Pisces: 'Mystical bond with nature',
  },
};
