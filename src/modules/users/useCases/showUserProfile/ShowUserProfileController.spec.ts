import request from 'supertest'
import { app } from '../../../../app'

import createConnection from '../../../../database'
import { Connection } from 'typeorm'

let connection: Connection

let fakeUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1N2QzODc0NC02ZTQzLTQ1ZmMtODMxNS05ZGY5ODE4ODc3Y2YiLCJ1c2VyIjp7ImlkIjoiNTdkMzg3NDQtNmU0My00NWZjLTgzMTUtOWRmOTgxODg3N2NmIiwibmFtZSI6Ik5vbiBFeGlzdGluZyBVc2VyIiwiZW1haWwiOiJub24uZXhpc3RpbmcudXNlckBnbWFpbC5jb20ifSwiaWF0IjoiIn0.uCUcL26yWiyc0RMiwpWEuyfoMz6pwS6i7gbCWYP7i2Q"

describe("Create Category Controller", () => {

  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to authenticate an user', async () => {
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

  it("should not be able to get an user's profile if authentication toke is invalid", async () => {
    const name = 'Iron Man'
    const email = 'iron@man.com'
    const password = 'fridayjarvis'

    await request(app).post('/api/v1/users')
      .send({
        name,
        email,
        password
      })

    const token = 'token_that_will_not_work'

    const profileResponse = await request(app).get('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)

    expect(profileResponse.statusCode).toBe(401)
  })

  it("should not be able to get an user's profile if authentication toke is missing", async () => {
    const name = 'Iron Man'
    const email = 'iron@man.com'
    const password = 'fridayjarvis'

    await request(app).post('/api/v1/users')
      .send({
        name,
        email,
        password
      })

    const profileResponse = await request(app).get('/api/v1/profile')

    expect(profileResponse.statusCode).toBe(401)
  })

  it("should not be able to get an user's profile if user does not exist", async () => {
    const profileResponse = await request(app).get('/api/v1/profile')
      .set('Authorization', `Bearer ${fakeUserToken}`)

    expect(profileResponse.statusCode).toBe(404)
  })

})
