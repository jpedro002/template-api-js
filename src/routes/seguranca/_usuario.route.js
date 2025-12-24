import { usuarioController } from 'src/controllers/seguranca'
import { baseRouter } from 'src/routes'
import { authenticate, authorize } from 'src/middleware'
import { z } from 'zod'

const UsuarioCreateSchema = z.object({
	login: z
		.string()
		.min(1, 'Login é obrigatório')
		.max(90, 'Login deve ter no máximo 90 caracteres'),
	email: z
		.email('Email inválido')
		.max(200, 'Email deve ter no máximo 200 caracteres'),
	password_hash: z
		.string()
		.min(1, 'Hash da senha é obrigatório'),
	name: z
		.string()
		.min(1, 'Nome é obrigatório')
		.max(90, 'Nome deve ter no máximo 90 caracteres'),
	
	active: z.boolean().optional().default(true)
})

const UsuarioUpdateSchema = z.object({
	login: z
		.string()
		.min(1, 'Login é obrigatório')
		.max(90, 'Login deve ter no máximo 90 caracteres')
		.optional(),
	email: z
		.email('Email inválido')
		.max(200, 'Email deve ter no máximo 200 caracteres')
		.optional(),
	name: z
		.string()
		.min(1, 'Nome é obrigatório')
		.max(90, 'Nome deve ter no máximo 90 caracteres')
		.optional(),
	
	active: z.boolean().optional()
})



export function usuarioRoutes(fastify) {
	const controller = usuarioController()

	const listMiddleware = [authenticate, authorize('users:read')]
	const createMiddleware = [authenticate, authorize('users:create')]
	const updateMiddleware = [authenticate, authorize('users:update')]
	const deleteMiddleware = [authenticate, authorize('users:delete')]

	baseRouter(fastify, controller, {
		tag: 'segurança - Usuários',
		summary: 'Gerenciamento de Usuários',
		entityName: 'usuário',
		listMiddleware: listMiddleware,
		getMiddleware: listMiddleware,
		postMiddleware: createMiddleware,
		putMiddleware: updateMiddleware,
		deleteMiddleware: deleteMiddleware,
		schemas: {
			createSchema: UsuarioCreateSchema,
			updateSchema: UsuarioUpdateSchema,
			entitySchema: z.any()
		}
	})

	// Rota para atualização de senha
	fastify.route({
		method: 'POST',
		url: '/update-password',
		preHandler: listMiddleware,
		schema: {
			tags: ['segurança - Usuários'],
			summary: 'Atualizar senha do usuário',
			description:
				'Permite ao usuário trocar sua senha informando a senha antiga e a nova senha.',
			body: z.object({
				oldPassword: z.string().min(1, 'Senha antiga obrigatória'),
				newPassword: z
					.string()
					.min(6, 'Nova senha deve ter ao menos 6 caracteres')
			}),
			response: {
				200: z.object({ success: z.boolean() }),
				400: z.object({ error: z.string() }),
				401: z.object({ error: z.string() }),
				404: z.object({ error: z.string() })
			}
		},
		handler: controller.updatePassword
	})

	// Rota para atribuir role a usuário
	fastify.route({
		method: 'POST',
		url: '/:userId/roles/:roleId',
		preHandler: updateMiddleware,
		schema: {
			tags: ['segurança - Usuários'],
			summary: 'Atribuir role a usuário',
			description: 'Atribui uma role (perfil) a um usuário',
			params: z.object({
				userId: z.string(),
				roleId: z.string()
			}),
			body: z.object({
				assignedBy: z.string().optional(),
				expiresAt: z.string().datetime().optional()
			}).optional(),
			response: {
				200: z.any(),
				404: z.object({ error: z.string() })
			}
		},
		handler: controller.assignRole
	})

	// Rota para remover role de usuário
	fastify.route({
		method: 'DELETE',
		url: '/:userId/roles/:roleId',
		preHandler: updateMiddleware,
		schema: {
			tags: ['segurança - Usuários'],
			summary: 'Remover role de usuário',
			description: 'Remove uma role (perfil) de um usuário',
			params: z.object({
				userId: z.string(),
				roleId: z.string()
			}),
			response: {
				200: z.object({ success: z.boolean() }),
				404: z.object({ error: z.string() })
			}
		},
		handler: controller.removeRole
	})

	// Rota para atribuir permissão a usuário
	fastify.route({
		method: 'POST',
		url: '/:userId/permissions/:permissionId',
		preHandler: updateMiddleware,
		schema: {
			tags: ['segurança - Usuários'],
			summary: 'Atribuir permissão a usuário',
			description: 'Atribui uma permissão específica a um usuário',
			params: z.object({
				userId: z.string(),
				permissionId: z.string()
			}),
			body: z.object({
				grantedBy: z.string().optional(),
				expiresAt: z.string().datetime().optional()
			}).optional(),
			response: {
				200: z.any(),
				404: z.object({ error: z.string() })
			}
		},
		handler: controller.grantPermission
	})

	// Rota para remover permissão de usuário
	fastify.route({
		method: 'DELETE',
		url: '/:userId/permissions/:permissionId',
		preHandler: updateMiddleware,
		schema: {
			tags: ['segurança - Usuários'],
			summary: 'Remover permissão de usuário',
			description: 'Remove uma permissão específica de um usuário',
			params: z.object({
				userId: z.string(),
				permissionId: z.string()
			}),
			response: {
				200: z.object({ success: z.boolean() }),
				404: z.object({ error: z.string() })
			}
		},
		handler: controller.revokePermission
	})
}
