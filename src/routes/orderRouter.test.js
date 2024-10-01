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

describe('Order CRUD testing', () => {
	test('add menu item', async () => {
		const res = await request(app)
			.put('/api/order/menu')
			.send({ title: 'testeu', description: 'best tetsteu sauce ever', image: 'faker.png', price: 10 })
			.set('Authorization', `Bearer ${adminUserAuthToken}`)
		expect(res.status).toBe(200)
	})

	test('get menu items', async () => {
		const res = await request(app).get('/api/order/menu')
		expect(res.status).toBe(200)
	})

	test('get orders for user', async () => {
		const res = await request(app).get('/api/order').set('Authorization', `Bearer ${adminUserAuthToken}`)
		expect(res.status).toBe(200)
	})
})
