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
