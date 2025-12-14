import { authorize, authenticate } from 'src/middleware'
import { permissionController } from 'src/controllers/seguranca'
import { z } from 'zod'

const controller = permissionController()

const PermissionSchema = z.object({
  id: z.string().uuid(),
  identifier: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  active: z.boolean()
})

const PermissionCreateSchema = z.object({
  identifier: z.string().describe('Identificador único (recurso:ação)'),
  name: z.string().describe('Nome da permissão'),
  description: z.string().optional().describe('Descrição da permissão'),
  category: z.string().describe('Categoria da permissão')
})

const PermissionUpdateSchema = z.object({
  identifier: z.string().optional().describe('Identificador único'),
  name: z.string().optional().describe('Nome da permissão'),
  description: z.string().optional().describe('Descrição da permissão'),
  category: z.string().optional().describe('Categoria da permissão'),
  active: z.boolean().optional().describe('Status ativo')
})

const errorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().optional()
})

export const setupPermissionRoutes = async (fastify) => {
  fastify.get(
    '/permissions',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Permissões'],
        summary: 'Listar permissões',
        description: 'Retorna lista paginada de permissões',
        querystring: z.object({
          page: z.coerce.number().optional().default(1),
          pageSize: z.coerce.number().optional().default(20)
        }),
        response: {
          200: z.object({
            data: z.array(PermissionSchema),
            pagination: z.object({
              page: z.number(),
              rowCount: z.number(),
              pageCount: z.number()
            })
          })
        }
      }
    },
    controller.fetch
  )

  fastify.post(
    '/permissions',
    {
      preHandler: [authenticate, authorize('permissions:create')],
      schema: {
        tags: ['Permissões'],
        summary: 'Criar permissão',
        description: 'Cria uma nova permissão no sistema',
        body: PermissionCreateSchema,
        response: {
          201: PermissionSchema,
          400: errorSchema
        }
      }
    },
    controller.post
  )

  fastify.get(
    '/permissions/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Permissões'],
        summary: 'Obter permissão por ID',
        description: 'Retorna os detalhes de uma permissão específica',
        params: z.object({
          id: z.string().uuid().describe('ID da permissão')
        }),
        response: {
          200: PermissionSchema,
          404: errorSchema
        }
      }
    },
    controller.one
  )

  fastify.put(
    '/permissions/:id',
    {
      preHandler: [authenticate, authorize('permissions:update')],
      schema: {
        tags: ['Permissões'],
        summary: 'Atualizar permissão',
        description: 'Atualiza uma permissão existente',
        params: z.object({
          id: z.string().uuid().describe('ID da permissão')
        }),
        body: PermissionUpdateSchema,
        response: {
          200: PermissionSchema,
          400: errorSchema,
          404: errorSchema
        }
      }
    },
    controller.put
  )

  fastify.delete(
    '/permissions/:id',
    {
      preHandler: [authenticate, authorize('permissions:delete')],
      schema: {
        tags: ['Permissões'],
        summary: 'Deletar permissão',
        description: 'Remove uma permissão do sistema',
        params: z.object({
          id: z.string().uuid().describe('ID da permissão')
        }),
        response: {
          204: z.null(),
          404: errorSchema
        }
      }
    },
    controller.del
  )

  fastify.get(
    '/permissions/category/:category',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Permissões'],
        summary: 'Listar por categoria',
        description: 'Retorna permissões de uma categoria específica',
        params: z.object({
          category: z.string().describe('Categoria da permissão')
        }),
        response: {
          200: z.array(PermissionSchema)
        }
      }
    },
    controller.listByCategory
  )
}
