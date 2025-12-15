#!/usr/bin/env node

/**
 * Script para executar Plop com configurações padrão
 * Uso: npm run generate
 */

import { Plop } from 'plop'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const plop = new Plop('plopfile.js', {
  destBasePath: path.join(__dirname, '..')
})

plop.getGenerator('CRUD Completo').runPrompts().then(async (answers) => {
  const result = await plop.runActions(answers)
  console.log(`\n✅ CRUD gerado com sucesso!`)
  console.log(`\nPróximos passos:`)
  console.log(`1. Adicione o modelo ao schema.prisma (se ainda não existe)`)
  console.log(`2. Customize os schemas em src/schemas/_${answers.lowercase}.schema.js`)
  console.log(`3. Customize o controller em src/controllers/${answers.lowercase}.controller.js`)
  console.log(`4. Registre as rotas no routes/index.js`)
  console.log(`5. Execute: npm run prisma:generate`)
})
