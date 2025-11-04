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
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
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
