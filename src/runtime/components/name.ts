import { computed } from 'vue'
import type { NuxtIconRuntimeOptions } from '../../types'
import { useAppConfig } from '#imports'
import { resolveName } from './resolve-name'

export type IconifyIconCustomizeCallback = (
  content: string,
  name?: string,
  prefix?: string,
  provider?: string,
) => string

export function useResolvedName(getName: () => string) {
  const options = useAppConfig().icon as NuxtIconRuntimeOptions

  return computed(() => resolveName(getName(), options))
}

export function resolveCustomizeFn(
  customize: IconifyIconCustomizeCallback | boolean | null | undefined,
  globalCustomize: IconifyIconCustomizeCallback | undefined,
):
    IconifyIconCustomizeCallback | undefined {
  if (customize === false) return undefined
  if (customize === true || customize === null) return globalCustomize
  return customize
}
