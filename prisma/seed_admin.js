import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const db = new PrismaClient()

// Definir permissões por categoria
const PERMISSIONS = [
  // Gerenciamento de Usuários
  { identifier: 'users:create', name: 'Criar Usuários', category: 'users' },
  { identifier: 'users:read', name: 'Visualizar Usuários', category: 'users' },
  { identifier: 'users:update', name: 'Atualizar Usuários', category: 'users' },
  { identifier: 'users:delete', name: 'Deletar Usuários', category: 'users' },
  { identifier: 'users:list', name: 'Listar Usuários', category: 'users' },
  { identifier: 'users:export', name: 'Exportar Usuários', category: 'users' },

  // Gerenciamento de Roles
  { identifier: 'roles:create', name: 'Criar Roles', category: 'roles' },
  { identifier: 'roles:read', name: 'Visualizar Roles', category: 'roles' },
  { identifier: 'roles:update', name: 'Atualizar Roles', category: 'roles' },
  { identifier: 'roles:delete', name: 'Deletar Roles', category: 'roles' },

  // Gerenciamento de Permissões
  { identifier: 'permissions:create', name: 'Criar Permissões', category: 'permissions' },
  { identifier: 'permissions:read', name: 'Visualizar Permissões', category: 'permissions' },
  { identifier: 'permissions:update', name: 'Atualizar Permissões', category: 'permissions' },
  { identifier: 'permissions:delete', name: 'Deletar Permissões', category: 'permissions' },

  // Administração
  { identifier: 'admin:manage-users', name: 'Gerenciar Usuários do Sistema', category: 'admin' },
  { identifier: 'admin:manage-roles', name: 'Gerenciar Roles do Sistema', category: 'admin' }
]

// Definir roles com suas permissões
const ROLES_CONFIG = [
  {
    name: 'SUPER_ADMIN',
    description: 'Super administrador com acesso total',
    permissionIdentifiers: ['*'] // Wildcard para todas as permissões
  },
  {
    name: 'ADMIN',
    description: 'Administrador com acesso a usuários, roles e permissões',
    permissionIdentifiers: [
      'users:create', 'users:read', 'users:update', 'users:delete', 'users:list', 'users:export',
      'roles:create', 'roles:read', 'roles:update', 'roles:delete',
      'permissions:read',
      'admin:manage-users', 'admin:manage-roles'
    ]
  },
  {
    name: 'MANAGER',
    description: 'Gerente com acesso de leitura e atualização de usuários',
    permissionIdentifiers: [
      'users:read', 'users:update', 'users:list'
    ]
  },
  {
    name: 'USER',
    description: 'Usuário padrão com acesso limitado',
    permissionIdentifiers: [
      'users:read'
    ]
  }
]

async function seedPermissions() {
  console.log('🔐 Criando permissões...')

  for (const perm of PERMISSIONS) {
    await db.permission.upsert({
      where: { identifier: perm.identifier },
      update: {},
      create: {
        identifier: perm.identifier,
        name: perm.name,
        category: perm.category,
        active: true
      }
    })
  }

  console.log(`✅ ${PERMISSIONS.length} permissões criadas/atualizadas`)
}

async function seedRoles() {
  console.log('👥 Criando roles...')

  for (const roleConfig of ROLES_CONFIG) {
    const role = await db.role.upsert({
      where: { name: roleConfig.name },
      update: { description: roleConfig.description },
      create: {
        name: roleConfig.name,
        description: roleConfig.description,
        active: true
      }
    })

    // Associar permissões
    await db.rolePermission.deleteMany({
      where: { roleId: role.id }
    })

    if (roleConfig.permissionIdentifiers.includes('*')) {
      // Se for wildcard, associar todas as permissões
      const allPermissions = await db.permission.findMany()
      for (const perm of allPermissions) {
        await db.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: perm.id
          }
        })
      }
    } else {
      // Associar permissões específicas
      for (const identifier of roleConfig.permissionIdentifiers) {
        const perm = await db.permission.findUnique({
          where: { identifier }
        })
        if (perm) {
          await db.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: perm.id
            }
          })
        }
      }
    }
  }

  console.log(`✅ ${ROLES_CONFIG.length} roles criadas/atualizadas`)
}

async function seedAdminUser() {
  console.log('👤 Criando usuário admin...')

  const email = 'admin@admin.com'
  const login = 'admin'
  const name = 'João Pedro'
  const password = '123456'

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      console.log('⚠️  Usuário já existe:', existing.email)
      return
    }

    const user = await db.user.create({
      data: {
        email,
        name,
        login,
        password_hash: hashedPassword,
        active: true
      }
    })

    // Atribuir role SUPER_ADMIN
    const superAdminRole = await db.role.findUnique({
      where: { name: 'SUPER_ADMIN' }
    })

    if (superAdminRole) {
      await db.userRole.create({
        data: {
          userId: user.id,
          roleId: superAdminRole.id
        }
      })
    }

    console.log('✅ Usuário admin criado com sucesso:', user.email)
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error.message)
  }
}

async function seed() {
  try {
    console.log('🌱 Iniciando seed...\n')

    await seedPermissions()
    await seedRoles()
    await seedAdminUser()

    console.log('\n✨ Seed concluído com sucesso!')
  } catch (error) {
    console.error('❌ Erro durante o seeding:', error)
    process.exit(1)
  }
}

seed()
  .finally(async () => {
    await db.$disconnect()
  })