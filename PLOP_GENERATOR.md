# 🛠️ Plop - Gerador de CRUDs Padronizados

## 📋 Visão Geral

Plop é um gerador de código que cria **CRUDs completos em módulos**, usando seu **baseRouter** e **baseController**, garantindo:

✅ **Modularização automática** (seguranca, vendas, etc)  
✅ **Integração com baseRouter/baseController**  
✅ **Index.js automáticamente atualizado**  
✅ **Nomenclatura padronizada** de permissões  
✅ **Schemas Zod** prontos para customização  

---

## 🚀 Uso Rápido

### **Gerar CRUD Completo**

```bash
npm run generate:crud
# ou
bun run generate
```

**Prompts interativos**:
```
? Nome do modelo Prisma (PascalCase): Post
? Nome do módulo/pasta (minúsculas): vendas
? Nome em português: postagens
? Adicionar permissões ao seed?: Yes
```

**Arquivos gerados**:
```
✅ src/controllers/vendas/post.controller.js
✅ src/routes/vendas/post.route.js
✅ src/schemas/post.schema.js
✅ prisma/permissions_post.js
✅ Atualizado: src/controllers/vendas/index.js
✅ Atualizado: src/routes/vendas/index.js
✅ Atualizado: prisma/seed_admin.js
```

---

## 📦 Opções de Geração

### **1. CRUD Completo** (Recomendado)
```bash
npm run generate:crud
```
Gera tudo em um módulo: controller, routes, schemas, permissões + atualiza index.js

### **2. Apenas Permissões**
```bash
npm run generate:permissions
```
Adiciona permissões ao seed sem criar CRUD

### **3. Apenas Controller**
```bash
npm run generate:controller
```
Cria somente o controller em um módulo existente

### **4. Plop Interativo**
```bash
npm run generate
```
Menu para escolher qual tipo gerar

---

## 📝 Padrão de Nomenclatura

### **Estrutura de Módulos**

```
src/controllers/
├── seguranca/          # Módulo existente
│   ├── _user.controller.js
│   ├── _role.controller.js
│   └── index.js        # Export de todos
│
└── vendas/             # Novo módulo (criado pelo Plop)
    ├── post.controller.js
    ├── invoice.controller.js
    └── index.js        # Criado/atualizado automaticamente

src/routes/
├── seguranca/
│   ├── _usuario.route.js
│   └── index.js
│
└── vendas/             # Novo módulo
    ├── post.route.js
    └── index.js        # Criado/atualizado automaticamente
```

### **Permissões - Padrão resource:action**

```javascript
{
  'posts:create'    // Criar posts
  'posts:read'      // Visualizar posts
  'posts:update'    // Atualizar posts
  'posts:delete'    // Deletar posts
  'posts:list'      // Listar posts
  'posts:export'    // Exportar posts
}
```

### **Nomenclaturas Automáticas**

```javascript
Modelo:       Post
camelCase:    post
PascalCase:   Post
lowercase:    post
pluralize:    posts
Recurso:      postagens
```

---

## 📝 Padrão de Nomenclatura

### **Permissões**

Formato: `resource:action`

**6 Ações Padrão**:
```javascript
{
  'posts:create'    // Criar postagens
  'posts:read'      // Visualizar postagens
  'posts:update'    // Atualizar postagens
  'posts:delete'    // Deletar postagens
  'posts:list'      // Listar postagens
  'posts:export'    // Exportar postagens
}
```

### **Recursos**

```javascript
Post      → posts:create, posts:read, ...
Category  → categories:create, categories:read, ...
User      → users:create, users:read, ...
Setting   → settings:create, settings:read, ...
```

### **Controllers & Routes**

```javascript
Model:       Post
Plural:      posts
camelCase:   post
PascalCase:  Post
lowercase:   post

Arquivo Controller:  src/controllers/{{moduleName}}/post.controller.js
Função Export:       export const postController = () => { ... }

Arquivo Route:       src/routes/{{moduleName}}/post.route.js
Função Export:       export const postRoutes = async (fastify) => { ... }

Arquivo Schema:      src/schemas/post.schema.js
Types:              Post, PostCreate, PostUpdate, PostFilter

Permissões:         posts:create, posts:read, posts:update, ...
```

---

## 🏗️ Estrutura Gerada

### **Controller**

```javascript
// src/controllers/post.controller.js
import { prisma, authorizationService } from 'src/services'
import { baseController } from 'src/controllers'

const select = {
  id: true,
  // TODO: Adicione campos do modelo
  createdAt: true,
  updatedAt: true
}

const base = baseController('Post', { select })

// Métodos customizados aqui
const post = async (request, reply) => { ... }
const put = async (request, reply) => { ... }

export const postController = () => ({
  ...base,    // all, fetch, one, post, put, del
  post,       // Override POST
  put         // Override PUT
})
```

**Métodos Herdados do baseController**:
- `all()` - Listar todos (sem paginação)
- `fetch()` - Listar com paginação
- `one()` - Obter por ID
- `post()` - Criar (pode ser overridden)
- `put()` - Atualizar (pode ser overridden)
- `del()` - Deletar

---

### **Routes**

```javascript
// src/routes/_post.route.js
import { authorize, authenticate } from 'src/middleware'
import { postController } from 'src/controllers'
import { z } from 'zod'

const controller = postController()

export const postRoutes = async (fastify) => {
  // GET  /posts              (listar paginado)
  // POST /posts              (criar)
  // GET  /posts/:id          (obter um)
  // PUT  /posts/:id          (atualizar)
  // DELETE /posts/:id        (deletar)
  // GET  /posts/all          (listar tudo)
}
```

**Autorização Padrão**:
```javascript
GET /posts         → authenticate (qualquer usuário)
POST /posts        → authorize('posts:create')
GET /posts/:id     → authenticate
PUT /posts/:id     → authorize('posts:update')
DELETE /posts/:id  → authorize('posts:delete')
GET /posts/all     → authenticate
```

---

### **Schemas**

```javascript
// src/schemas/_post.schema.js
import { z } from 'zod'

// Schema base (resposta)
export const PostSchema = z.object({
  id: z.string().uuid(),
  // TODO: campos do modelo
  createdAt: z.date(),
  updatedAt: z.date()
})

// Schema create (POST)
export const PostCreateSchema = z.object({
  // TODO: campos obrigatórios
})

// Schema update (PUT)
export const PostUpdateSchema = z.object({
  // TODO: campos opcionais
})

// Schema filter (queries avançadas)
export const PostFilterSchema = z.object({
  // TODO: campos filtráveis
})

// Bulk operations
export const PostBulkCreateSchema = z.array(PostCreateSchema)
export const PostBulkUpdateSchema = z.array(...)
export const PostBulkDeleteSchema = z.object({ ids: z.array(...) })

// Types TypeScript
export type Post = z.infer<typeof PostSchema>
export type PostCreate = z.infer<typeof PostCreateSchema>
export type PostUpdate = z.infer<typeof PostUpdateSchema>
```

---

### **Permissões**

```javascript
// prisma/permissions_post.js
export const POST_PERMISSIONS = [
  {
    identifier: 'posts:create',
    name: 'Criar postagens',
    category: 'posts'
  },
  {
    identifier: 'posts:read',
    name: 'Visualizar postagens',
    category: 'posts'
  },
  // ... mais 4 ações padrão
]
```

**Também atualiza `prisma/seed_admin.js`**:
```javascript
const PERMISSIONS = [
  // ... permissões existentes
  { identifier: 'posts:create', name: 'Criar postagens', category: 'posts' },
  { identifier: 'posts:read', name: 'Visualizar postagens', category: 'posts' },
  // ... mais permissões de posts
]
```

---

## 🔧 Customizando Templates

Templates estão em `plop-templates/`:

```
plop-templates/
├── controller.hbs      # Controller template
├── route.hbs           # Routes template
├── schema.hbs          # Schemas template
└── permissions.hbs     # Permissions template
```

### **Exemplo: Customizar Controller**

1. Abra `plop-templates/controller.hbs`
2. Modifique conforme necessário
3. Use Handlebars helpers:
   - `{{modelName}}` - "Post"
   - `{{lowercase modelName}}` - "post"
   - `{{camelCase modelName}}` - "post"
   - `{{pascalCase modelName}}` - "Post"
   - `{{pluralize modelName}}` - "posts"
   - `{{resourceName}}` - "postagens"

---

## 📋 Exemplo Completo: Gerar CRUD para "Article" no módulo "blog"

### **Passo 1: Executar Gerador**
```bash
npm run generate:crud
```

### **Passo 2: Responder Prompts**
```
? Nome do modelo Prisma (PascalCase): Article
? Nome do módulo/pasta (minúsculas): blog
? Nome em português: artigos
? Adicionar permissões ao seed?: Yes
```

### **Passo 3: Arquivos Gerados**

**src/controllers/blog/article.controller.js**:
```javascript
import { baseController } from 'src/controllers'

function articleController() {
	const select = {
		id: true,
		createdAt: true,
		updatedAt: true
	}
	const base = baseController('Article', { select })
	return { ...base }
}

export { articleController }
```

**src/routes/blog/article.route.js**:
```javascript
import { articleController } from './article.controller'
import { baseRouter } from 'src/routes'
import { authenticate, authorize } from 'src/middleware'
import { z } from 'zod'

const ArticleCreateSchema = z.object({
	// TODO: Defina campos obrigatórios
})

const ArticleUpdateSchema = z.object({
	// TODO: Defina campos opcionais
})

export function articleRoutes(fastify) {
	const controller = articleController()
	// ... baseRouter com auth
}
```

**src/controllers/blog/index.js** (atualizado):
```javascript
export { articleController } from './article.controller.js'
// ... outros controllers
```

**src/routes/blog/index.js** (atualizado):
```javascript
import { articleRoutes } from './article.route.js'

export function blogRoutes(fastify) {
	fastify.register(articleRoutes, { prefix: '/articles' })
	// ... outras rotas
}
```

**src/schemas/article.schema.js**:
```javascript
import { z } from 'zod'

export const ArticleSchema = z.object({...})
export const ArticleCreateSchema = z.object({...})
export const ArticleUpdateSchema = z.object({...})
export type Article = z.infer<typeof ArticleSchema>
// ...
```

**Permissões adicionadas ao seed**:
```javascript
{ identifier: 'articles:create', name: 'Criar artigos', category: 'articles' },
{ identifier: 'articles:read', name: 'Visualizar artigos', category: 'articles' },
{ identifier: 'articles:update', name: 'Atualizar artigos', category: 'articles' },
{ identifier: 'articles:delete', name: 'Deletar artigos', category: 'articles' },
{ identifier: 'articles:list', name: 'Listar artigos', category: 'articles' },
{ identifier: 'articles:export', name: 'Exportar artigos', category: 'articles' },
```

### **Passo 4: Customizar**

1. **Adicionar modelo ao Prisma**:
```prisma
model Article {
  id        String    @id @default(uuid())
  title     String
  content   String
  author    String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

2. **Atualizar schemas em `src/schemas/article.schema.js`**:
```javascript
export const ArticleCreateSchema = z.object({
	title: z.string().min(1).max(500),
	content: z.string().min(1),
	author: z.string().min(1).max(255)
})

export const ArticleUpdateSchema = z.object({
	title: z.string().min(1).max(500).optional(),
	content: z.string().min(1).optional(),
	author: z.string().min(1).max(255).optional()
})
```

3. **Registrar rotas em `src/routes/index.js`** (app.js):
```javascript
import { blogRoutes } from './blog/index.js'

export async function mainRoutes(fastify) {
	fastify.register(blogRoutes, { prefix: '/blog' })
	// ... outras rotas
}
```

4. **Executar seed**:
```bash
npm run seed:admin
```

5. **Testar API**:
```bash
curl -X GET http://localhost:3000/blog/articles \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 Exemplo Completo: Gerar CRUD para "Post"

### **Passo 1: Executar Gerador**
```bash
npm run generate:crud
```

### **Passo 2: Responder Prompts**
```
? Nome do modelo Prisma: Post
? Nome em português: postagens
? Caminho da rota: posts
? Adicionar permissões: Yes
```

### **Passo 3: Arquivos Gerados**

**src/controllers/post.controller.js**:
```javascript
import { postController } from 'src/controllers'

const controller = postController()
// CRUD base + métodos customizados
```

**src/routes/_post.route.js**:
```javascript
export const postRoutes = async (fastify) => {
  fastify.get('/posts', ...)
  fastify.post('/posts', ...)
  fastify.get('/posts/:id', ...)
  fastify.put('/posts/:id', ...)
  fastify.delete('/posts/:id', ...)
}
```

**src/schemas/_post.schema.js**:
```javascript
export const PostSchema = z.object({...})
export const PostCreateSchema = z.object({...})
export const PostUpdateSchema = z.object({...})
export type Post = z.infer<typeof PostSchema>
```

**Permissões adicionadas ao seed**:
```javascript
{ identifier: 'posts:create', name: 'Criar posts', category: 'posts' },
{ identifier: 'posts:read', name: 'Visualizar posts', category: 'posts' },
{ identifier: 'posts:update', name: 'Atualizar posts', category: 'posts' },
{ identifier: 'posts:delete', name: 'Deletar posts', category: 'posts' },
{ identifier: 'posts:list', name: 'Listar posts', category: 'posts' },
{ identifier: 'posts:export', name: 'Exportar posts', category: 'posts' },
```

### **Passo 4: Customizar**

1. **Adicionar modelo ao Prisma** (se novo):
```prisma
model Post {
  id        String    @id @default(uuid())
  title     String
  content   String
  author    String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

2. **Atualizar schema em `src/schemas/_post.schema.js`**:
```javascript
export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  author: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const PostCreateSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  author: z.string().min(1).max(255)
})

export const PostUpdateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  author: z.string().min(1).max(255).optional()
})
```

3. **Registrar rotas em `src/routes/index.js`**:
```javascript
import { postRoutes } from './_post.route'

export function mainRoutes(fastify) {
  fastify.register(postRoutes, { prefix: '/posts' })
  // ... outras rotas
}
```

4. **Executar seed**:
```bash
npm run seed:admin
```

5. **Testar API**:
```bash
curl -X GET http://localhost:3000/posts \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Checklist Pós-Geração

Depois de gerar um CRUD:
- [ ] **Criar módulo se novo**: Se o módulo não existe, crie manualmente:
  ```bash
  mkdir -p src/controllers/vendas
  mkdir -p src/routes/vendas
  
  # Criar index.js vazio no controller
  echo "" > src/controllers/vendas/index.js
  
  # Criar index.js vazio na route
  echo "" > src/routes/vendas/index.js
  ```
- [ ] Executar `npm run generate:crud` para criar os arquivos
- [ ] Adicionar modelo ao `schema.prisma` (se novo)
- [ ] Customizar schemas em `src/schemas/{{modelo}}.schema.js`
- [ ] Customizar controller se precisar de métodos especiais
- [ ] Registrar módulo em `src/routes/index.js` (app.js) - exemplo:
  ```javascript
  import { vendasRoutes } from './vendas/index.js'
  export async function mainRoutes(fastify) {
    fastify.register(vendasRoutes, { prefix: '/vendas' })
  }
  ```
- [ ] Executar `npm run seed:admin` para criar permissões no BD
- [ ] Testar endpoints com Postman/curl

---

## ✅ Checklist Pós-Geração

Depois de gerar um CRUD:
- [ ] Adicionar modelo ao `schema.prisma` (se novo)
- [ ] Customizar schemas em `src/schemas/_nome.schema.js`
- [ ] Customizar controller se precisar de métodos especiais
- [ ] Registrar rotas em `src/routes/index.js`
- [ ] Executar `npm run seed:admin` para criar permissões no BD
- [ ] Testar endpoints com Postman/curl
- [ ] Adicionar testes unitários (se necessário)

---

## 🎨 Helpers Disponíveis

Nos templates Handlebars:

```handlebars
{{lowercase "Post"}}              → "post"
{{uppercase "post"}}              → "POST"
{{camelCase "Post Article"}}      → "postArticle"
{{pascalCase "post article"}}     → "PostArticle"
{{pluralize "Post"}}              → "posts"
{{pluralize "Category"}}          → "categories"
{{pluralize "Person"}}            → "people"
```

---

## 🔍 Troubleshooting

### **Problema: "modelName must start with uppercase"**
✅ **Solução**: Use `Post`, `Article`, não `post`, `article`

### **Problema: Arquivo já existe**
✅ **Solução**: Plop perguntará se quer sobrescrever

### **Problema: Permissões não aparecem no seed**
✅ **Solução**: 
1. Verifique se respondeu "Yes" no prompt
2. Abra `prisma/seed_admin.js` e verifique se as permissões foram adicionadas
3. Execute `npm run seed:admin` manualmente

### **Problema: Routes não registradas**
✅ **Solução**: Você precisa registrar manualmente em `src/routes/index.js`

---

## 📚 Documentação Plop

- Docs: https://plopjs.com/
- Helpers: https://handlebarsjs.com/guide/helpers.html
- Prompts: https://github.com/enquirer/enquirer

---

## 🎯 Próximos Passos

1. **Criar novo modelo**: Defina em `schema.prisma`
2. **Executar gerador**: `npm run generate:crud`
3. **Customizar code**: Adicione lógica no controller/schema
4. **Registrar rotas**: Em `src/routes/index.js`
5. **Fazer seed**: `npm run seed:admin`
6. **Testar**: Use Scalar em http://localhost:3000/scalar

---

**Criado**: 14 de dezembro de 2025  
**Versão**: 1.0  
**Status**: ✅ Pronto para usar
