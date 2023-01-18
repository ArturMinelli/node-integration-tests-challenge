import request from 'supertest'
import { app } from '../../../../app'

import createConnection from '../../../../database'
import { Connection } from 'typeorm'
import { hash } from 'bcryptjs'

let connection: Connection

describe("Create Category Controller", () => {

  beforeAll(async () => {
    connection = await createConnection('localhost')
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to create a new user', async () => {
    const userResponse = await request(app).post('/api/v1/users')
      .send({
        name: 'Artur Minelli',
        email: 'arturminelli@gmail.com',
        password: 'lufaardala'
      })

    expect(userResponse.statusCode).toBe(201)
  })

  it('should not be able to create a new user if email is already registered', async () => {
    await request(app).post('/api/v1/users')
      .send({
        name: 'Artur Minelli',
        email: 'arturminelli@gmail.com',
        password: 'lufaardala'
      })

    const userResponse = await request(app).post('/api/v1/users')
      .send({
        name: 'Artur Minelli',
        email: 'arturminelli@gmail.com',
        password: 'lufaardala'
      })

    expect(userResponse.statusCode).toBe(400)
  })

})
