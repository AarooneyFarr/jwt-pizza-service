const request = require('supertest')
const app = require('../service')

let adminUserAuthToken

beforeAll(async () => {
	const registerRes = await request(app).put('/api/auth').send({ email: 'a@jwt.com', password: 'admin' })
	adminUserAuthToken = registerRes.body.token

	if (process.env.VSCODE_INSPECTOR_OPTIONS) {
		jest.setTimeout(60 * 1000 * 5) // 5 minutes
	}
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
	test('get user franchises', async () => {
		const res = await request(app).get('/api/franchise/1').set('Authorization', `Bearer ${adminUserAuthToken}`)
		expect(res.status).toBe(200)
		expect(res.body.length).toBe(1)
	})

	let storeID

	test('create a franchise store', async () => {
		const res = await request(app)
			.post(`/api/franchise/${franchiseID}/store`)
			.send({ franchiseID: franchiseID, name: 'borker testboi' })
			.set('Authorization', `Bearer ${adminUserAuthToken}`)
		expect(res.status).toBe(200)
		expect(res.body.name).toBe('borker testboi')
		storeID = res.body.id
	})

	test('delete a franchise store', async () => {
		const res = await request(app)
			.delete(`/api/franchise/${franchiseID}/store/${storeID}`)
			.set('Authorization', `Bearer ${adminUserAuthToken}`)
		expect(res.status).toBe(200)
	})

	test('delete franchise', async () => {
		const res = await request(app)
			.delete(`/api/franchise/${franchiseID}`)
			.set('Authorization', `Bearer ${adminUserAuthToken}`)
		expect(res.status).toBe(200)
	})
})
