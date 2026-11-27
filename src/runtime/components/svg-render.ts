import { buildIcon } from '@iconify/vue'
import type { IconifyIcon } from '@iconify/vue'
import { flipFromString } from '@iconify/utils/lib/customisations/flip'
import { rotateFromString } from '@iconify/utils/lib/customisations/rotate'
import { h, normalizeClass } from 'vue'
import type { VNode } from 'vue'

// Iconify's `<Icon>` props, and its boolean props in declaration order
const iconifyProps = new Set(['width', 'height', 'style', 'color', 'rotate', 'flip', 'id', 'title'])
const booleanProps = ['inline', 'hFlip', 'horizontalFlip', 'vFlip', 'verticalFlip', 'ariaHidden']
// Props that `<NuxtIconSvg>` and Iconify handle in ways a plain `<svg>` can't: the caller falls back.
// `onLoad` is an event Iconify emits.
const unsupported = new Set(['icon', 'mode', 'ssr', 'customise', 'onLoad'])
const flipAliases: Record<string, 'hFlip' | 'vFlip'> = { horizontalFlip: 'hFlip', verticalFlip: 'vFlip' }

// What each attribute name is to Iconify's `<Icon>`, by its camelized name, as Vue matches props
const ATTR = 0
const PROP = 1
const BOOLEAN = 2
const UNSUPPORTED = 3
type Kind = typeof ATTR | typeof PROP | typeof BOOLEAN | typeof UNSUPPORTED
const kinds = new Map<string, [Kind, string]>()
function kindOf(key: string): [Kind, string] {
  let kind = kinds.get(key)
  if (!kind) {
    const prop = key.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())
    kind = unsupported.has(prop)
      ? [UNSUPPORTED, prop]
      : iconifyProps.has(prop)
        ? [PROP, prop]
        : booleanProps.includes(prop)
          ? [BOOLEAN, prop]
          : [ATTR, key]
    kinds.set(key, kind)
  }
  return kind
}

// Vue casts a boolean prop to `true` from its hyphenated name too
const hyphenated: Record<string, string> = { inline: 'inline', hFlip: 'h-flip', horizontalFlip: 'horizontal-flip', vFlip: 'v-flip', verticalFlip: 'vertical-flip', ariaHidden: 'aria-hidden' }
const isTrue = (value: unknown) => value === true || value === 'true' || value === 1

type BuiltIcon = ReturnType<typeof buildIcon>
// What `buildIcon` returns without size or transformation, which only depends on the icon, by body.
// `replaceIDs` still runs on every render, which gives each icon its own ids.
const uncustomised = new Map<string, { icon: Required<IconifyIcon>, built: BuiltIcon }>()
function buildUncustomised(icon: Required<IconifyIcon>): BuiltIcon {
  const cached = uncustomised.get(icon.body)
  if (cached && cached.icon.width === icon.width && cached.icon.height === icon.height
    && cached.icon.left === icon.left && cached.icon.top === icon.top && cached.icon.rotate === icon.rotate
    && cached.icon.hFlip === icon.hFlip && cached.icon.vFlip === icon.vFlip)
    return cached.built
  const built = buildIcon(icon, {})
  uncustomised.set(icon.body, { icon, built })
  return built
}

interface Customisations {
  width: string | number | null
  height: string | number | null
  rotate: number
  hFlip: boolean
  vFlip: boolean
  inline: boolean
}

/**
 * Renders an icon to the `<svg>` that Iconify's `<Icon>` renders in svg mode with `attrs`, which
 * are what reaches `<Icon>` through `<NuxtIcon>` and `<NuxtIconSvg>`. Like Vue and Iconify, it
 * reads `width`, `rotate`, `flip`, `inline`, `color`, `aria-hidden` and the rest as customisations,
 * and lets the other attributes fall through onto the `<svg>`. Returns `null` for the attributes
 * it doesn't handle, for the caller to fall back to `<NuxtIconSvg>`.
 */
export function renderIconifySvg(icon: Required<IconifyIcon>, classes: string, attrs: Record<string, unknown>, idPrefix: string): VNode | null {
  // Split props from fallthrough attributes, as Vue does: non-boolean props keep their order,
  // boolean props come after them in declaration order, cast from `''` or their own name to `true`.
  const props: Record<string, unknown> = {}
  let booleans: Record<string, unknown> | undefined
  let rest: Record<string, unknown> | undefined
  for (const key in attrs) {
    const [kind, name] = kindOf(key)
    const value = attrs[key]
    if (kind === ATTR)
      (rest ||= {})[key] = value
    else if (kind === PROP)
      props[name] = value
    else if (kind === BOOLEAN)
      (booleans ||= {})[name] = value === '' || value === hyphenated[name] ? true : value
    else
      return null
  }
  if (booleans) {
    for (const prop of booleanProps) {
      if (prop in booleans)
        props[prop] = booleans[prop]
    }
  }

  // Same steps as Iconify's `render` in svg mode
  const customisations: Customisations = { width: null, height: null, rotate: 0, hFlip: false, vFlip: false, inline: false }
  for (const key in props) {
    const value = props[key]
    if (key === 'width' || key === 'height') {
      if (value === null || (value && (typeof value === 'string' || typeof value === 'number')))
        customisations[key] = value
    }
    else if (key in customisations && typeof value === typeof customisations[key as keyof Customisations]) {
      // @ts-expect-error the type was checked above
      customisations[key] = key === 'rotate' ? (value as number) % 4 : value
    }
  }

  const svgProps: Record<string, unknown> = {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'aria-hidden': true,
    'role': 'img',
  }
  const style: Record<string, unknown> = {}
  for (const key in props) {
    const value = props[key]
    if (value === undefined)
      continue
    switch (key) {
      case 'style':
      case 'flip':
        break
      case 'inline':
      case 'hFlip':
      case 'vFlip':
        customisations[key] = isTrue(value)
        break
      case 'color':
        style.color = value
        break
      case 'rotate':
        if (typeof value === 'string')
          customisations.rotate = rotateFromString(value)
        else if (typeof value === 'number')
          customisations.rotate = value
        break
      case 'ariaHidden':
        if (value !== true && value !== 'true')
          delete svgProps['aria-hidden']
        break
      default:
        if (flipAliases[key]) {
          if (isTrue(value))
            customisations[flipAliases[key]] = true
        }
        else if (!(key in customisations)) {
          svgProps[key] = value
        }
    }
  }
  if (typeof props.flip === 'string')
    flipFromString(customisations, props.flip)

  const { attributes, body } = customisations.width === null && customisations.height === null
    && customisations.rotate === 0 && !customisations.hFlip && !customisations.vFlip
    ? buildUncustomised(icon)
    : buildIcon(icon, customisations)
  if (customisations.inline)
    style.verticalAlign = '-0.125em'
  svgProps.class = classes
  svgProps.style = { ...style, ...(typeof props.style === 'object' && !Array.isArray(props.style) ? props.style : {}) }
  Object.assign(svgProps, attributes)
  svgProps.innerHTML = replaceIDs(body, idPrefix)
  // The other attributes fall through onto the `<svg>`, merged the way Vue's `mergeProps` merges
  // them: `class` is appended, and the rest replaces the value, since the `<svg>` has no listeners.
  for (const key in rest) {
    if (key === 'class') {
      if (rest.class !== classes)
        svgProps.class = normalizeClass([classes, rest.class])
    }
    else
      svgProps[key] = rest[key]
  }
  return h('svg', svgProps)
}

const idRE = /\sid="(\S+)"/g

/**
 * Renames the ids of an icon body to `prefix` + index, and updates their references.
 * The new ids are written with single quotes, so Iconify's own `replaceIDs`,
 * which only matches `id="…"`, leaves them alone.
 */
export function replaceIDs(body: string, prefix: string): string {
  const ids = new Set(Array.from(body.matchAll(idRE), m => m[1]!))
  let index = 0
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // the same references Iconify updates: `url(#id)`, `href="#id"`, `begin="id.end"`, and the id itself.
    // `\0` marks renamed ids, so a later id cannot match a new one.
    body = body.replace(new RegExp(`([#;"])(${escaped})([")]|\\.[a-z])`, 'g'), `$1${prefix}${index++}\0$3`)
  }
  return body
    .replace(/\sid="([^"]*)\0"/g, ` id='$1'`)
    .replaceAll('\0', '')
}
