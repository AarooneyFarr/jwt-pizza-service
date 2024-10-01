const request = require('supertest')
const app = require('../service')

let adminUserAuthToken

beforeAll(async () => {
	const registerRes = await request(app).put('/api/auth').send({ email: 'a@jwt.com', password: 'admin' })
	adminUserAuthToken = registerRes.body.token
})

describe('Franchise CRUD testing', () => {
	let franchiseID

	test('create franchise', async () => {
		const res = await request(app)
			.post('/api/franchise')
			.send({ name: 'test franchise 4dfs', admins: [{ email: 'a@jwt.com' }] })
			.set('Authorization', `Bearer ${adminUserAuthToken}`)
		expect(res.status).toBe(200)
		franchiseID = res.body.id
	})

	test('get franchises', async () => {
		const res = await request(app).get('/api/franchise').set('Authorization', `Bearer ${adminUserAuthToken}`)
		expect(res.status).toBe(200)
		expect(res.body[0].name).toBe('test franchise 4dfs')
	})

	test('delete franchise', async () => {
		const res = await request(app)
			.delete(`/api/franchise/${franchiseID}`)
			.set('Authorization', `Bearer ${adminUserAuthToken}`)
		expect(res.status).toBe(200)
	})
})
