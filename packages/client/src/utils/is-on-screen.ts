export const isOnScreen = (
  //
  element: Element | undefined | null,
  { x = 0, y = 0, width = window.screenX, height = window.screenY } = { x: 0, y: 0, width: window.screenX, height: window.screenY },
  margin = 0
) => {
  const boundingBox = element?.getBoundingClientRect()
  return (
    boundingBox && //
    boundingBox.x + boundingBox.width > x + margin &&
    boundingBox.x < x + width - margin &&
    boundingBox.y + boundingBox.height > y + margin &&
    boundingBox.y < y + height - margin
  )
}
