import { authorize, authenticate } from 'src/middleware'
import { roleController } from 'src/controllers/seguranca'
import { z } from 'zod'

const controller = roleController()

const RolePermissionSchema = z.object({
  permission: z.object({
    id: z.string().uuid(),
    identifier: z.string(),
    name: z.string()
  })
})

const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  rolePermissions: z.array(RolePermissionSchema)
})

const RoleCreateSchema = z.object({
  name: z.string().describe('Nome da role'),
  description: z.string().optional().describe('Descrição da role'),
  permissionIds: z.array(z.string().uuid()).optional().describe('IDs das permissões a associar')
})

const RoleUpdateSchema = z.object({
  name: z.string().optional().describe('Nome da role'),
  description: z.string().optional().describe('Descrição da role'),
  permissionIds: z.array(z.string().uuid()).optional().describe('IDs das permissões a associar'),
  active: z.boolean().optional().describe('Status ativo')
})

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  login: z.string(),
  name: z.string(),
  active: z.boolean()
})

const errorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().optional()
})

export const setupRoleRoutes = async (fastify) => {
  fastify.get(
    '/roles',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Roles'],
        summary: 'Listar roles',
        description: 'Retorna lista paginada de roles com suas permissões',
        querystring: z.object({
          page: z.coerce.number().optional().default(1),
          pageSize: z.coerce.number().optional().default(20)
        }),
        response: {
          200: z.object({
            data: z.array(RoleSchema),
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
    '/roles',
    {
      preHandler: [authenticate, authorize('roles:create')],
      schema: {
        tags: ['Roles'],
        summary: 'Criar role',
        description: 'Cria uma nova role e associa permissões',
        body: RoleCreateSchema,
        response: {
          201: RoleSchema,
          400: errorSchema
        }
      }
    },
    controller.post
  )

  fastify.get(
    '/roles/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Roles'],
        summary: 'Obter role por ID',
        description: 'Retorna os detalhes de uma role específica com suas permissões',
        params: z.object({
          id: z.string().uuid().describe('ID da role')
        }),
        response: {
          200: RoleSchema,
          404: errorSchema
        }
      }
    },
    controller.one
  )

  fastify.put(
    '/roles/:id',
    {
      preHandler: [authenticate, authorize('roles:update')],
      schema: {
        tags: ['Roles'],
        summary: 'Atualizar role',
        description: 'Atualiza uma role existente e suas permissões associadas',
        params: z.object({
          id: z.string().uuid().describe('ID da role')
        }),
        body: RoleUpdateSchema,
        response: {
          200: RoleSchema,
          400: errorSchema,
          404: errorSchema
        }
      }
    },
    controller.put
  )

  fastify.delete(
    '/roles/:id',
    {
      preHandler: [authenticate, authorize('roles:delete')],
      schema: {
        tags: ['Roles'],
        summary: 'Deletar role',
        description: 'Remove uma role do sistema',
        params: z.object({
          id: z.string().uuid().describe('ID da role')
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
    '/roles/:id/users',
    {
      preHandler: [authenticate, authorize('roles:read')],
      schema: {
        tags: ['Roles'],
        summary: 'Listar usuários de uma role',
        description: 'Retorna todos os usuários que possuem uma role específica',
        params: z.object({
          id: z.string().uuid().describe('ID da role')
        }),
        response: {
          200: z.array(UserSchema),
          404: errorSchema
        }
      }
    },
    controller.getUsersByRole
  )
}
