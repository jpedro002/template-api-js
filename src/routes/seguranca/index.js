import { sessionRoutes } from './_session.route.js'
import { usuarioRoutes } from './_usuario.route.js'
import { setupPermissionRoutes } from './_permission.route.js'
import { setupRoleRoutes } from './_role.route.js'

export function segurancaRoutes(fastify) {
	fastify.register(usuarioRoutes, { prefix: '/usuarios' })
	fastify.register(sessionRoutes, { prefix: '/auth' })
	fastify.register(setupPermissionRoutes, { prefix: '/permissoes' })
	fastify.register(setupRoleRoutes, { prefix: '/roles' })
}
