import { Window } from 'happy-dom'
import { describe, expect, it } from 'vitest'
import { insertIconStyle } from '../src/runtime/components/style-order'

describe('insertIconStyle', () => {
  it('appends layered icon styles after existing stylesheets', () => {
    const window = new Window()
    const { document } = window
    const appStyle = document.createElement('style')
    const appLink = document.createElement('link')
    appLink.rel = 'stylesheet'
    document.head.append(appStyle, appLink)

    const iconStyle = document.createElement('style')
    insertIconStyle(iconStyle as unknown as HTMLStyleElement, document.head as unknown as HTMLHeadElement, 'base')

    expect([...document.head.children]).toEqual([appStyle, appLink, iconStyle])
    window.happyDOM.abort()
  })

  it('keeps unlayered icon styles before existing stylesheets', () => {
    const window = new Window()
    const { document } = window
    const appStyle = document.createElement('style')
    const appLink = document.createElement('link')
    appLink.rel = 'stylesheet'
    document.head.append(appStyle, appLink)

    const iconStyle = document.createElement('style')
    insertIconStyle(iconStyle as unknown as HTMLStyleElement, document.head as unknown as HTMLHeadElement)

    expect([...document.head.children]).toEqual([iconStyle, appStyle, appLink])
    window.happyDOM.abort()
  })
})
