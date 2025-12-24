import bcrypt from 'bcrypt'
import { baseController } from 'src/controllers'
import { prisma } from 'src/services'

function usuarioController() {
	const select = null
	const SALT_ROUNDS = 10

	const base = baseController('User', {
		select,
		omit: {
			password_hash: true
		},
		include: {
			userRoles: {
				include: {
					role: {
						include: {
							rolePermissions: {
								include: {
									permission: true
								}
							}
						}
					}
				}
			}
		},
		allowedFields: ['id', 'email', 'login', 'name', 'active', 'createdAt', 'updatedAt'],
		sensitiveFields: ['password_hash', 'senha', 'password', 'token', 'hash']
	})

	const post = async (request, reply) => {
		const { body } = request
		const { password_hash: pwd, email, ...rest } = body

		const hashedPassword = await bcrypt.hash(pwd, SALT_ROUNDS)

		const usuarioData = {
			...rest,
			email: email.toLowerCase().trim(),
			password_hash: hashedPassword
		}

		const data = await prisma.User.create({
			data: { ...usuarioData },
			omit: {
				password_hash: true
			}
		})
		reply.code(201).send(data)
	}

	const updatePassword = async (request, reply) => {
		const { id } = request.user
		const { oldPassword, newPassword } = request.body
		if (!oldPassword || !newPassword) {
			return reply
				.code(400)
				.send({ error: 'oldPassword e newPassword são obrigatórios' })
		}
		const usuario = await prisma.User.findUnique({
			where: { id },
			select: { password_hash: true }
		})
		if (!usuario) {
			return reply.code(404).send({ error: 'Usuário não encontrado' })
		}
		const match = await bcrypt.compare(oldPassword, usuario.password_hash)
		if (!match) {
			return reply.code(401).send({ error: 'Senha antiga incorreta' })
		}

		const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
		await prisma.User.update({
			where: { id },
			data: { password_hash: hashedPassword }
		})
		reply.code(200).send({ success: true })
	}

	const assignRole = async (request, reply) => {
		const { userId, roleId } = request.params
		const { assignedBy, expiresAt } = request.body || {}

		// Verificar se usuário existe
		const user = await prisma.User.findUnique({ where: { id: userId } })
		if (!user) {
			return reply.code(404).send({ error: 'Usuário não encontrado' })
		}

		// Verificar se role existe
		const role = await prisma.Role.findUnique({ where: { id: roleId } })
		if (!role) {
			return reply.code(404).send({ error: 'Role não encontrada' })
		}

		// Criar ou atualizar UserRole
		const userRole = await prisma.UserRole.upsert({
			where: {
				userId_roleId: {
					userId,
					roleId
				}
			},
			create: {
				userId,
				roleId,
				assignedBy,
				expiresAt: expiresAt ? new Date(expiresAt) : null
			},
			update: {
				assignedBy,
				expiresAt: expiresAt ? new Date(expiresAt) : null,
				assignedAt: new Date()
			}
		})

		reply.code(200).send(userRole)
	}

	const removeRole = async (request, reply) => {
		const { userId, roleId } = request.params

		try {
			await prisma.UserRole.delete({
				where: {
					userId_roleId: {
						userId,
						roleId
					}
				}
			})
			reply.code(200).send({ success: true })
		} catch (error) {
			if (error.code === 'P2025') {
				return reply.code(404).send({ error: 'Associação não encontrada' })
			}
			throw error
		}
	}

	const grantPermission = async (request, reply) => {
		const { userId, permissionId } = request.params
		const { grantedBy, expiresAt } = request.body || {}

		// Verificar se usuário existe
		const user = await prisma.User.findUnique({ where: { id: userId } })
		if (!user) {
			return reply.code(404).send({ error: 'Usuário não encontrado' })
		}

		// Verificar se permissão existe
		const permission = await prisma.Permission.findUnique({ where: { id: permissionId } })
		if (!permission) {
			return reply.code(404).send({ error: 'Permissão não encontrada' })
		}

		// Criar ou atualizar UserPermission
		const userPermission = await prisma.UserPermission.upsert({
			where: {
				userId_permissionId: {
					userId,
					permissionId
				}
			},
			create: {
				userId,
				permissionId,
				grantedBy,
				expiresAt: expiresAt ? new Date(expiresAt) : null
			},
			update: {
				grantedBy,
				expiresAt: expiresAt ? new Date(expiresAt) : null,
				grantedAt: new Date()
			}
		})

		reply.code(200).send(userPermission)
	}

	const revokePermission = async (request, reply) => {
		const { userId, permissionId } = request.params

		try {
			await prisma.UserPermission.delete({
				where: {
					userId_permissionId: {
						userId,
						permissionId
					}
				}
			})
			reply.code(200).send({ success: true })
		} catch (error) {
			if (error.code === 'P2025') {
				return reply.code(404).send({ error: 'Permissão não encontrada' })
			}
			throw error
		}
	}

	return {
		...base,
		post,
		updatePassword,
		assignRole,
		removeRole,
		grantPermission,
		revokePermission
	}
}

export { usuarioController }
