import { defineEventHandler } from 'h3'

export default defineEventHandler(() => ({
  prefix: 'remote',
  icons: {
    remote: {
      body: '<path d="M0 0h24v24H0z"/>',
    },
  },
  width: 24,
  height: 24,
}))
