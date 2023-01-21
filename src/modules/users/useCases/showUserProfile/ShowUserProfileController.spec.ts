import request from 'supertest'
import { app } from '../../../../app'

import createConnection from '../../../../database'
import { Connection } from 'typeorm'
import { profile } from 'console'

let connection: Connection

describe("Create Category Controller", () => {

  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to create a new user', async () => {
    const name = 'Iron Man'
    const email = 'iron@man.com'
    const password = 'fridayjarvis'

    await request(app).post('/api/v1/users')
      .send({
        name,
        email,
        password
      })

    const authenticationResponse = await request(app).post('/api/v1/sessions')
      .send({
        email,
        password
      })

    const { token } = authenticationResponse.body

    const profileResponse = await request(app).get('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)

    const profile = profileResponse.body

    expect(profileResponse.statusCode).toBe(200)

    expect(profile).toMatchObject({
      name,
      email
    })
  })

})
