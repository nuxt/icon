// @vitest-environment nuxt
import { it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { Icon } from '#components'

it('reuses icon rules from inline styles without scanning stylesheets', async () => {
  const ssrStyle = document.createElement('style')
  ssrStyle.textContent = '.i-ph\\:acorn-bold{display:inline-block;width:1em;height:1em}'
  document.head.append(ssrStyle)
  const styleSheets = vi.spyOn(document, 'styleSheets', 'get')
  const styleCount = document.head.querySelectorAll('style').length

  const component = await mountSuspended(Icon, { props: { name: 'ph:acorn-bold', mode: 'css' } })
  await new Promise(resolve => setTimeout(resolve, 10))

  expect(component.html()).toContain('i-ph:acorn-bold')
  expect(styleSheets).not.toHaveBeenCalled()
  expect(document.head.querySelectorAll('style').length).toBe(styleCount)
})
