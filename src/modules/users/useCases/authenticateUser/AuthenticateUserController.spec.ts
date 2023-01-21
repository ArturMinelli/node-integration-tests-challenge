import request from 'supertest'
import { app } from '../../../../app'

import createConnection from '../../../../database'
import { Connection } from 'typeorm'
import { verify } from 'jsonwebtoken'

let connection: Connection

interface IRequest {
  user: {
    id: string
    name: string
    email: string
  }
}

describe("Authenticate User", () => {

  beforeAll(async () => {
    connection = await createConnection('localhost')
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to authenticate an user', async () => {
    const email = 'arturminelli@gmail.com'
    const password = 'lufaardala'

    await request(app).post('/api/v1/users')
      .send({
        name: 'Artur Minelli',
        email,
        password
      })

    const authenticationResponse = await request(app).post('/api/v1/sessions')
      .send({
        email,
        password
      })

    const { token } = authenticationResponse.body
    const jwtSecret = process.env.JWT_SECRET as string

    const { user: tokenUser } = verify(token, jwtSecret) as IRequest

    expect(tokenUser.email).toEqual(email)
  })

  it('should not be abel to authenticate an user if email is not registered', async () => {
    const authenticationResponse = await request(app).post('/api/v1/sessions')
      .send({
        email: 'arturpeixoto@gmail.com',
        password: 'lufaardala'
      })

    expect(authenticationResponse.statusCode).toBe(401)
  })

  it('should not be able to authenticate an user if password is incorrect', async () => {
    const email = 'daviminelli@gmail.com'
    const password = 'lufaardala'

    await request(app).post('/api/v1/users')
      .send({
        name: 'Artur Minelli',
        email,
        password
      })

    const authenticationResponse = await request(app).post('/api/v1/sessions')
      .send({
        email,
        password: 'wrong_password'
      })

    expect(authenticationResponse.statusCode).toBe(401)
  })

})
