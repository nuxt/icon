export function insertIconStyle(style: HTMLStyleElement, head: HTMLHeadElement, cssLayer?: string) {
  if (cssLayer) {
    head.appendChild(style)
    return
  }

  const firstStyle = head.querySelector('style, link[rel="stylesheet"]')
  if (firstStyle)
    head.insertBefore(style, firstStyle)
  else
    head.appendChild(style)
}
