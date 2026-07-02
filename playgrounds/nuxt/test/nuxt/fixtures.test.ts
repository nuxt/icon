// @vitest-environment nuxt
import { it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { format } from 'prettier'
import { ShowcaseFixture } from '#components'

it('mount fixtures', async () => {
  const component = await mountSuspended(ShowcaseFixture, {
    props: {
      mode: 'svg',
    },
  })
  const html = await format(
    '<html><body>' + component.html() + '</body></html>',
    { parser: 'html' },
  )
  await expect(html)
    .toMatchFileSnapshot('./output/fixtures.html')
})
