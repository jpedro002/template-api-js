const PORT = process.env.PORT || 3000
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256'
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
const CORS_ORIGIN =
	process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001'
const NODE_ENV = process.env.NODE_ENV || 'development'

const settings = {
	PORT,
	JWT_ALGORITHM,
	JWT_SECRET,
	JWT_EXPIRES_IN,
	JWT_REFRESH_EXPIRES_IN,
	CORS_ORIGIN,

	NODE_ENV
}

export { settings }
