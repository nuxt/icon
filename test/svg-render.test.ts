import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import type { VNode } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Icon as Iconify, addIcon, getIcon } from '@iconify/vue'
import { renderIconifySvg } from '../src/runtime/components/svg-render'

addIcon('test:wide', { body: '<path fill="currentColor" d="M0 0h24v12H0z"/>', width: 24, height: 12 })

// What reaches Iconify's `<Icon>` from `<Icon name="test:wide" …>`, with the default `attrs` and a size
const base = { 'aria-hidden': true, 'class': 'user', 'style': { fontSize: '24px' } }

const cases: Record<string, Record<string, unknown>> = {
  'no attributes': {},
  'defaults': base,
  'width': { ...base, width: 48 },
  'width and height': { ...base, width: '2em', height: 10 },
  'height: auto': { ...base, height: 'auto' },
  'width: 0': { ...base, width: 0 },
  'rotate in deg': { ...base, rotate: '90deg' },
  'rotate as a number': { ...base, rotate: 1 },
  'rotate as a large number': { ...base, rotate: 5 },
  'rotate in %': { ...base, rotate: '50%' },
  'flip': { ...base, flip: 'horizontal' },
  'flip both': { ...base, flip: 'horizontal,vertical' },
  'h-flip': { ...base, 'h-flip': '' },
  'hFlip true': { ...base, hFlip: true },
  'v-flip string': { ...base, 'v-flip': 'true' },
  'horizontal-flip': { ...base, 'horizontal-flip': '' },
  'vertical-flip and h-flip=false': { ...base, 'vertical-flip': true, 'h-flip': 'false' },
  'inline': { ...base, inline: '' },
  'inline=inline': { ...base, inline: 'inline' },
  'inline false': { ...base, inline: false },
  'color': { ...base, color: 'red' },
  'aria-hidden false': { ...base, 'aria-hidden': false },
  'aria-hidden "false"': { ...base, 'aria-hidden': 'false' },
  'aria-hidden ""': { ...base, 'aria-hidden': '' },
  'ariaHidden false': { ...base, ariaHidden: false },
  'title and id': { ...base, title: 'Wide', id: 'wide' },
  'other attributes': { ...base, 'role': 'presentation', 'data-test': 'x', 'aria-label': 'Wide', 'tabindex': 0 },
  'string style': { ...base, style: 'color: blue' },
  'array class': { ...base, class: ['a', { b: true, c: false }] },
  'everything': { ...base, 'width': 32, 'rotate': '180deg', 'flip': 'vertical', 'inline': true, 'color': 'green', 'aria-hidden': false, 'title': 'All', 'data-x': 1 },
}

describe('renderIconifySvg', () => {
  for (const [label, attrs] of Object.entries(cases)) {
    it(`renders the same <svg> as Iconify's <Icon>: ${label}`, async () => {
      const iconify = await renderToString(h(Iconify, { icon: 'test:wide', ssr: true, ...attrs }))
      const direct = renderIconifySvg(getIcon('test:wide')!, 'iconify iconify--test', attrs, 'v_0ID')
      expect(direct).not.toBeNull()
      expect(await renderToString(direct as VNode)).toBe(iconify)
    })
  }

  it('keeps icons with the same body apart', async () => {
    addIcon('test:square', { body: '<path fill="currentColor" d="M0 0h24v12H0z"/>', width: 24, height: 24 })
    for (const name of ['test:wide', 'test:square', 'test:wide']) {
      const iconify = await renderToString(h(Iconify, { icon: name, ssr: true }))
      expect(await renderToString(renderIconifySvg(getIcon(name)!, 'iconify iconify--test', {}, 'v_0ID') as VNode)).toBe(iconify)
    }
  })

  for (const key of ['icon', 'mode', 'ssr', 'customise', 'onLoad']) {
    it(`falls back for \`${key}\``, () => {
      expect(renderIconifySvg(getIcon('test:wide')!, 'iconify iconify--test', { [key]: 'x' }, 'v_0ID')).toBeNull()
    })
  }
})
