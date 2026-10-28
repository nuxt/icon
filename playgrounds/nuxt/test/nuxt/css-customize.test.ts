// @vitest-environment nuxt
import { it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { fnv1a64Base36 } from 'fnv1a-64'
import { Icon } from '#components'

it('suffixes customized icon classes with an FNV-1a hash of the callback source', async () => {
  const thin = (content: string) => content.replace(/stroke-width="[^"]*"/g, 'stroke-width="1"')
  const bold = (content: string) => content.replace(/stroke-width="[^"]*"/g, 'stroke-width="3"')

  const first = await mountSuspended(Icon, { props: { name: 'ph:acorn-bold', mode: 'css', customize: thin } })
  const second = await mountSuspended(Icon, { props: { name: 'ph:acorn-bold', mode: 'css', customize: bold } })

  expect(first.classes()).toContain(`i-ph:acorn-bold--customized-${fnv1a64Base36(thin.toString())}`)
  expect(second.classes()).toContain(`i-ph:acorn-bold--customized-${fnv1a64Base36(bold.toString())}`)
})
