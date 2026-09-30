import { PlayerIds, PlayerInformation } from '../player-constants'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** `taxReturn.dob` is `YYYY/MM/DD`; parse by hand so no timezone can shift the day. */
export const formatHoroscopeDate = (dob: string) => {
  const [year, month, day] = dob.split('/').map(Number)
  return `${MONTHS[month - 1]} ${day}, ${year}`
}

// Each placement is hinted one step removed from its symbol (stinger, not scorpion).
// Ram and bull both have horns: the ram gets curled horns and fleece, the bull a red
// cape and nose ring. Flavor lines must not evoke any other sign's symbol.
export const HOROSCOPES: Record<PlayerIds, string[]> = {
  // Scorpio sun, Taurus moon, Sagittarius ascendant
  [PlayerIds.Biden]: [
    'Your sun keeps its stinger curled and ready, private and unblinking, slow to forgive a slight and slower still to forget who dealt it. Leave the old grudge where it is today. A reply sent in heat will follow you longer than the silence would. The moon wears a brass nose ring and will not be led anywhere it did not already mean to go; wave a red cape at it and it only plants its feet. Eat something warm and keep the evening small.',
    'Your ascendant comes through the door with an arrow already nocked, a blunt joke and a long stride, halfway to the next room before the rest of you has sat down. Let one plan stay unfinished. The day favors the errand you did not write down.',
  ],
  // Taurus sun, Capricorn moon, Libra ascendant
  [PlayerIds.TheRock]: [
    'Your sun lowers its head at every red cape the week waves at it: steady, stubborn, and impossible to rush once it has decided where it is going. Someone will try to hurry you before lunch. Let them try. The moon picks its way up a cliff ledge, sure-footed and bearded with patience, happiest when the view has been earned. Keep your worries on a list and the list in a drawer.',
    'Your ascendant greets the world as two pans hung from a beam, tipping gently until they level. You walk in weighing the room, smiling at both sides of every argument, hoping to leave everyone evenly pleased. A small kindness comes back to you by Thursday. Wear the good shoes.',
  ],
  // Scorpio sun, Sagittarius moon, Sagittarius ascendant
  [PlayerIds.Devito]: [
    'Your sun moves low and quiet with its tail curled overhead, saying little and noticing everything, the sting saved for anyone who mistakes you for small. Do not explain yourself today. The people who matter already know. The moon keeps a quiver on its back, restless and bright, aiming at somewhere far off and laughing on the way there. Answer the call from the number you do not recognize.',
    'Your ascendant takes up the bow again, this time drawn all the way back: you arrive loud, loose, and already mid-story, arrow in the air before anyone has asked where it is headed. Two good aims in one chart make for a long week of luck. Spend some of it on dessert.',
  ],
  // Aries sun, Aquarius moon, Virgo ascendant
  [PlayerIds.Conan]: [
    'Your sun leads with curled horns and a thick coat of fleece, head down, into whatever door looks locked. Today it may be better to knock. A late reply is not a no, and a quiet morning is not a wasted one. The moon carries a jug on its shoulder and tips it out over the whole crowd, while keeping one odd idea for itself. Write the strange thought down before it evaporates.',
    'Your ascendant enters with a sheaf of wheat tucked under one arm, tidy and careful, sorting the room into what is useful and what can wait. Straighten one small thing and the rest will follow. An old friend mentions your name, kindly, when you are not in the room.',
  ],
  // Sagittarius sun, Virgo moon. No ascendant: the birth time isn't reliable.
  [PlayerIds.Jackson]: [
    'Your sun keeps an arrow on the string, eyes on a horizon nobody else has spotted yet, bored by anything that stays put for long. Resist the urge to leave early. Something worth seeing arrives in the last hour. The moon gleans quietly at the edge of a wheat field, gathering small worries into neat bundles, soothed by a clean counter and a finished chore. Fold the laundry. It will help more than you think. Keep the evening free.',
  ],
  // Virgo sun, Aries moon, Scorpio ascendant
  [PlayerIds.Coolidge]: [
    'Your sun carries a sheaf of wheat and a clean ledger, with an eye that catches the crooked picture frame from across the room. Fix it, then leave the rest alone. Perfection is not on today’s schedule. The moon butts in with curled horns and a coat of fleece, quick to temper and quicker to forgive, feelings that come in hot and leave just as fast. Take the stairs and burn some of it off.',
    'Your ascendant is the first thing anyone meets: a level look and a stinger held very still, giving nothing away until you choose to. Keep the secret one more day. News is traveling toward you, not away.',
  ],
}

export const getHoroscope = (playerId: PlayerIds) => ({
  date: formatHoroscopeDate(PlayerInformation[playerId].taxReturn.dob),
  paragraphs: HOROSCOPES[playerId],
})
