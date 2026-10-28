export function escapeCssSelector(selector: string) {
  return selector.replace(/([^\w-])/g, '\\$1')
}

function escapeRegExp(source: string) {
  return source.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
}

function scanStyleElements(doc: Document, prefix: string, selectors: Set<string>) {
  const selector = `\\.${escapeRegExp(escapeCssSelector(prefix))}(?:[\\w-]|\\\\.)*`
  const rule = new RegExp(`(?:^|[{};])\\s*(?::where\\((${selector})\\)|(${selector}))\\s*\\{`, 'g')
  for (const style of doc.querySelectorAll('style')) {
    const css = (style.textContent || '').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const match of css.matchAll(rule))
      selectors.add(match[1] || match[2]!)
  }
}

function scanStyleSheets(doc: Document, selectors: Set<string>) {
  const filter = (selector: string): string | undefined => {
    selector = selector
      .replace(/^:where\((.*)\)$/, '$1')
      .trim()
    if (selector.startsWith('.')) {
      return selector
    }
  }

  const scanCssRules = (rules: CSSRuleList) => {
    if (!rules?.length)
      return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const rule of (rules as any)) {
      // scan for nested rules
      if (rule?.cssRules) {
        scanCssRules(rule.cssRules)
      }
      // scan for selector
      const selectorRaw = rule?.selectorText
      if (typeof selectorRaw === 'string') {
        const selector = filter(selectorRaw)
        if (selector)
          selectors.add(selector)
      }
    }
  }

  for (const styleSheet of doc.styleSheets) {
    try {
      const rules = styleSheet.cssRules || styleSheet.rules
      scanCssRules(rules)
    }
    catch {
      // this typically means the stylesheet is from an inaccessible origin
    }
  }
}

/**
 * Icon selectors defined in the document, read from `<style>` text before falling back to the CSSOM.
 */
export function createIconSelectors(prefix: string, doc: Document | undefined = globalThis.document) {
  const known = new Set<string>()
  let all: Set<string> | undefined
  if (doc)
    scanStyleElements(doc, prefix, known)

  return {
    has(selector: string) {
      if (known.has(selector))
        return true
      if (!all) {
        all = new Set()
        if (doc)
          scanStyleSheets(doc, all)
      }
      return all.has(selector)
    },
    add(selector: string) {
      known.add(selector)
    },
  }
}
