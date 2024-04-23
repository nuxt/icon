import fs from 'node:fs/promises'
import { generateTypes, resolveSchema } from 'untyped'
import { schema } from '../src/schema'

for (const key in schema) {
  // @ts-expect-error - Remove tags from schema
  if (schema?.[key]?.$schema?.tags) {
    // @ts-expect-error - Remove tags from schema
    schema[key].$schema.tags = []
  }
}

const resolvedSchema = await resolveSchema(schema)
const types = generateTypes(resolvedSchema, {
  interfaceName: 'NuxtIconRuntimeOptions',
  addExport: true,
  indentation: 2,
})

await fs.writeFile(
  'src/schema-types.ts',
  '// This file is generated from scripts/schema.ts\n\n' + types,
  'utf-8',
)
