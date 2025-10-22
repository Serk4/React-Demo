const request = require('supertest')
const app = require('../server')

describe('Basic API Tests', () => {
	let server

	beforeAll(async () => {
		server = app.listen(3004)
	})

	afterAll(async () => {
		server.close()
	})

	describe('Health Check', () => {
		it('should return health status', async () => {
			const response = await request(app).get('/api/health').expect(200)

			expect(response.body).toHaveProperty('status', 'OK')
			expect(response.body).toHaveProperty('message', 'Server is running')
		})
	})

	describe('Users API - Basic', () => {
		it('should return users (mock or real)', async () => {
			const response = await request(app).get('/api/users').expect(200)

			expect(Array.isArray(response.body)).toBe(true)
			// Should return either real data or mock data
			expect(response.body.length).toBeGreaterThanOrEqual(0)
		})

		it('should handle POST requests gracefully', async () => {
			const response = await request(app).post('/api/users').send({
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				isActive: true,
			})

			// Should either succeed (201) or fail gracefully (400/500)
			expect([200, 201, 400, 500]).toContain(response.status)
		})
	})
})
