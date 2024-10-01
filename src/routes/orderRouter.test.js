const request = require('supertest')
const app = require('../service')
const { Role, DB } = require('../database/database.js')

let adminUserAuthToken

function randomName() {
	return Math.random().toString(36).substring(2, 12)
}

async function createAdminUser() {
	let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] }
	user.name = randomName()
	user.email = user.name + '@admin.com'

	await DB.addUser(user)

	user.password = 'toomanysecrets'
	return user
}

beforeAll(async () => {
	const ad = await createAdminUser()
	const registerRes = await request(app).put('/api/auth').send({ email: ad.email, password: ad.password })
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
