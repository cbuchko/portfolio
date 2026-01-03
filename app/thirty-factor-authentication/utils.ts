export const clampPositionsToScreen = (
  newX: number,
  newY: number,
  width: number,
  height: number
) => {
  if (newX < 0) newX = 0
  if (newX > window.innerWidth - width) newX = window.innerWidth - width
  if (newY < 0) newY = 0
  if (newY > window.innerHeight - height) newY = window.innerHeight - height

  return { newX, newY }
}

export function makeCode(length: number) {
  let result = ''
  const characters = 'ABCDEFGHJKMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export function makeAuthCode(length: number) {
  let result = ''
  const characters = '0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export function shuffle<T>(array: T[]) {
  let currentIndex = array.length

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
  return array
}

export function getFormattedDate(d: Date | number | string): string {
  let date: Date
  if (typeof d === 'number') date = new Date(d)
  else if (typeof d === 'string') date = new Date(parseInt(d))
  else date = d

  const month = date.toLocaleString('en-US', { month: 'long' })
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'

  const hour12 = hours % 12 || 12

  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th'

  return `${month} ${day}${suffix} ${hour12}:${minutes} ${ampm}`
}

export function addMinutesToDate(date: Date | number, minutes: number) {
  let dateToAdd: Date
  if (typeof date === 'number') dateToAdd = new Date(date)
  else dateToAdd = date
  return dateToAdd.setMinutes(dateToAdd.getMinutes() + minutes)
}

export function addMinutesToDateAndFormat(date: Date | number, minutes: number) {
  return getFormattedDate(new Date(addMinutesToDate(date, minutes)))
}

export function formatElapsedTime(timestamp: number): string {
  const now = Date.now()
  const diff = Math.max(0, now - timestamp) // milliseconds

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const remainingHours = hours % 24
  const remainingMinutes = minutes % 60
  const remainingSeconds = seconds % 60

  const parts: string[] = []

  if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`)
  if (remainingHours > 0) parts.push(`${remainingHours} hour${remainingHours === 1 ? '' : 's'}`)
  if (remainingMinutes > 0)
    parts.push(`${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`)
  if (remainingSeconds > 0 || parts.length === 0)
    parts.push(`${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'}`)

  return parts.join(' ')
}

type RGB = { r: number; g: number; b: number }

const hexToRgb = (hex: string): RGB => {
  const sanitized = hex.replace('#', '')
  const bigint = parseInt(sanitized, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

const rgbToHex = (r: number, g: number, b: number): string =>
  '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Interpolate between start → middle → end based on percentage (0–1)
 */
export const interpolateThreeColors = (
  startHex: string,
  midHex: string,
  endHex: string,
  percentage: number
): string => {
  const p = Math.min(1, Math.max(0, percentage))

  const start = hexToRgb(startHex)
  const mid = hexToRgb(midHex)
  const end = hexToRgb(endHex)

  // First half: 0 → 0.5
  if (p < 0.5) {
    const t = p / 0.5 // Normalize 0–0.5 to 0–1
    return rgbToHex(
      Math.round(lerp(start.r, mid.r, t)),
      Math.round(lerp(start.g, mid.g, t)),
      Math.round(lerp(start.b, mid.b, t))
    )
  }

  // Second half: 0.5 → 1
  const t = (p - 0.5) / 0.5 // Normalize 0.5–1 to 0–1
  return rgbToHex(
    Math.round(lerp(mid.r, end.r, t)),
    Math.round(lerp(mid.g, end.g, t)),
    Math.round(lerp(mid.b, end.b, t))
  )
}

export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false

  return a.every((value, index) => value === b[index])
}
