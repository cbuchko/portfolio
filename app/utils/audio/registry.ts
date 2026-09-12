/**
 * Single catalog of every clip the game plays.
 *
 * - `sfx`   — short one-shot. Decoded into an AudioBuffer after the first user
 *             gesture and played through the shared AudioContext (zero-latency).
 * - `music` — long / looping. Streamed through a reusable HTMLAudioElement,
 *             never decoded into RAM.
 * - `track` — long clip that still needs a sample-accurate clock (rhythm game).
 *             Decoded into an AudioBuffer on demand and released on level exit.
 *
 * Consumers reference keys, never paths.
 */

const SOUNDS = '/thirty-factor-authentication/sounds'
const IDLE_AUDIO = '/idle_game/audio'

export type SoundKind = 'sfx' | 'music' | 'track'

export type SoundDef = {
  src: string
  kind: SoundKind
  /** Default gain, 0–1. */
  volume?: number
  /** Default loop behaviour (music / track only). */
  loop?: boolean
}

export const SOUND_REGISTRY = {
  // --- global UI ---
  success: { src: `${SOUNDS}/success.mp3`, kind: 'sfx', volume: 0.2 },
  error: { src: `${SOUNDS}/error.mp3`, kind: 'sfx', volume: 1 },
  message: { src: `${SOUNDS}/message.mp3`, kind: 'sfx', volume: 0.2 },
  notification: { src: `${SOUNDS}/notification.mp3`, kind: 'sfx', volume: 1 },

  // --- level one-shots ---
  place: { src: `${SOUNDS}/place.mp3`, kind: 'sfx', volume: 1 },
  osuClick: { src: `${SOUNDS}/osu-click.mp3`, kind: 'sfx', volume: 0.25 },
  dartThrow: { src: `${SOUNDS}/dart-throw.mp3`, kind: 'sfx', volume: 1 },
  niceThrow: { src: `${SOUNDS}/nice-throw.mp3`, kind: 'sfx', volume: 1 },
  miss: { src: `${SOUNDS}/miss.mp3`, kind: 'sfx', volume: 1 },
  undertaleDamage: { src: `${SOUNDS}/undertale-damage.mp3`, kind: 'sfx', volume: 0.5 },
  splatter: { src: `${SOUNDS}/splatter.mp3`, kind: 'sfx', volume: 0.3 },
  thud: { src: `${SOUNDS}/sfx_thud03.mp3`, kind: 'sfx', volume: 0.2 },
  explosion: { src: `${SOUNDS}/explosion.mp3`, kind: 'sfx', volume: 0.3 },

  // --- streamed music / loops ---
  nightManor: { src: `${SOUNDS}/night-manor-interior-128.mp3`, kind: 'music', volume: 0.15, loop: true },
  pizzaSong: { src: `${SOUNDS}/pizzasong-128.mp3`, kind: 'music', volume: 0.1, loop: true },
  stardew: { src: `${SOUNDS}/stardew-128.mp3`, kind: 'music', volume: 0.25, loop: true },
  aquariumTheme: { src: `${SOUNDS}/aquarium.wav`, kind: 'music', volume: 0.25, loop: true },
  reel: { src: `${SOUNDS}/reel.mp3`, kind: 'music', volume: 0.05, loop: false },
  heartbeat: { src: `${SOUNDS}/heartbeat.mp3`, kind: 'music', volume: 1, loop: true },
  bombTicking: { src: `${SOUNDS}/bomb-defusal.m4a`, kind: 'music', volume: 1, loop: true },
  deathByGlamour: { src: `${SOUNDS}/death-by-glamor.mp3`, kind: 'music', volume: 0.5, loop: false },
  siren: { src: `${SOUNDS}/siren.mp3`, kind: 'music', volume: 0.2, loop: true },
  jazz: { src: `${IDLE_AUDIO}/jazz.mp3`, kind: 'music', volume: 0.2, loop: true },

  // --- buffer-backed track (rhythm timing) ---
  openTheSky: { src: `${SOUNDS}/open-the-sky.mp3`, kind: 'track', volume: 0.3, loop: false },
} as const satisfies Record<string, SoundDef>

export type SoundKey = keyof typeof SOUND_REGISTRY

type KeysOfKind<K extends SoundKind> = {
  [P in SoundKey]: (typeof SOUND_REGISTRY)[P]['kind'] extends K ? P : never
}[SoundKey]

export type SfxKey = KeysOfKind<'sfx'>
export type MusicKey = KeysOfKind<'music'> | KeysOfKind<'track'>

export const getSoundDef = (key: SoundKey): SoundDef => SOUND_REGISTRY[key]

export const SFX_KEYS = (Object.keys(SOUND_REGISTRY) as SoundKey[]).filter(
  (key) => SOUND_REGISTRY[key].kind === 'sfx'
) as SfxKey[]

export const MUSIC_KEYS = (Object.keys(SOUND_REGISTRY) as SoundKey[]).filter(
  (key) => SOUND_REGISTRY[key].kind === 'music'
) as MusicKey[]
