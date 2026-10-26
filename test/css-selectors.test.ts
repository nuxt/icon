import { Window } from 'happy-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createIconSelectors } from '../src/runtime/components/css-selectors'

const rule = (selector: string) => `${selector}{display:inline-block;width:1em;height:1em;--svg:url("data:image/svg+xml,%3Csvg/%3E")}`

describe('createIconSelectors', () => {
  let window: Window

  function createDocument(...styles: string[]) {
    window = new Window()
    const document = window.document as unknown as Document
    for (const css of styles) {
      const style = document.createElement('style')
      style.textContent = css
      document.head.append(style)
    }
    const styleSheets = vi.spyOn(document, 'styleSheets', 'get')
    return { document, styleSheets }
  }

  afterEach(() => {
    window?.happyDOM.abort()
  })

  it('finds icon rules in inline styles without reading the CSSOM', () => {
    const { document, styleSheets } = createDocument(
      rule('.i-ph\\:acorn-bold') + rule(':where(.i-ph\\:air-traffic-control)'),
      `@layer icons {\n${rule('.i-ph\\:alarm')}\n${rule('.i-custom\\:a--customized-1x2y3z')}\n}`,
    )
    const selectors = createIconSelectors('i-', document)

    expect(selectors.has('.i-ph\\:acorn-bold')).toBe(true)
    expect(selectors.has('.i-ph\\:air-traffic-control')).toBe(true)
    expect(selectors.has('.i-ph\\:alarm')).toBe(true)
    expect(selectors.has('.i-custom\\:a--customized-1x2y3z')).toBe(true)
    expect(styleSheets).not.toHaveBeenCalled()
  })

  it('only matches whole rule selectors', () => {
    const { document } = createDocument(
      rule('.i-ph\\:acorn-bold:hover'),
      rule('.dark .i-ph\\:alarm'),
      rule('.i-ph\\:air-traffic-control,.other'),
      rule('.i-ph\\:acorn'),
    )
    const selectors = createIconSelectors('i-', document)

    expect(selectors.has('.i-ph\\:acorn-bold')).toBe(false)
    expect(selectors.has('.i-ph\\:alarm')).toBe(false)
    expect(selectors.has('.i-ph\\:air-traffic-control')).toBe(false)
    expect(selectors.has('.i-ph\\:acorn')).toBe(true)
  })

  it('falls back to the CSSOM for rules outside inline styles', () => {
    const { document, styleSheets } = createDocument()
    const sheet = new window.CSSStyleSheet()
    sheet.insertRule(rule('.i-ph\\:acorn-bold'))
    styleSheets.mockReturnValue([sheet] as unknown as StyleSheetList)
    const selectors = createIconSelectors('i-', document)

    expect(selectors.has('.i-ph\\:acorn-bold')).toBe(true)
    expect(selectors.has('.i-ph\\:alarm')).toBe(false)
    expect(styleSheets).toHaveBeenCalledTimes(1)
  })

  it('remembers added selectors', () => {
    const { document } = createDocument()
    const selectors = createIconSelectors('i-', document)

    expect(selectors.has('.i-ph\\:acorn-bold')).toBe(false)
    selectors.add('.i-ph\\:acorn-bold')
    expect(selectors.has('.i-ph\\:acorn-bold')).toBe(true)
  })

  it('supports custom selector prefixes', () => {
    const { document, styleSheets } = createDocument(rule('.icon\\.ph\\:acorn-bold'))
    const selectors = createIconSelectors('icon.', document)

    expect(selectors.has('.icon\\.ph\\:acorn-bold')).toBe(true)
    expect(styleSheets).not.toHaveBeenCalled()
  })
})
