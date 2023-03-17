import * as _nuxt_schema from '@nuxt/schema';
import { ModuleOptions } from './module';

declare module '@nuxt/schema' {
    interface AppConfig {
        nuxtIcon?: ModuleOptions
    }
}

export default _nuxt_schema.NuxtModule<ModuleOptions>;