/* eslint-disable no-unused-vars */
const request = require('supertest')
const app = require('../service')

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' }
let testUserAuthToken
let userID

beforeAll(async () => {
	testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com'
	const registerRes = await request(app).post('/api/auth').send(testUser)
	testUserAuthToken = registerRes.body.token
	userID = registerRes.body.user.id
})

describe('Auth functions', () => {
	test('login', async () => {
		const loginRes = await request(app).put('/api/auth').send(testUser)
		expect(loginRes.status).toBe(200)
		expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/)

		const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] }
		expect(loginRes.body.user).toMatchObject(user)
	})
	test('update user', async () => {
		const loginRes = await request(app)
			.put(`/api/auth/${userID}`)
			.send({ email: Math.random().toString(36).substring(2, 12) + '@test.com', password: 'borkyneu' })
			.set('Authorization', `Bearer ${testUserAuthToken}`)
		expect(loginRes.status).toBe(200)
	})
	// test('logout', async () => {
	// 	const loginRes = await request(app).delete('/api/auth').set('Authorization', `Bearer ${testUserAuthToken}`)
	// 	expect(loginRes.status).toBe(200)
	// })
})
