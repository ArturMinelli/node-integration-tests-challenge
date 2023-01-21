import request from 'supertest'
import { app } from '../../../../app'

import createConnection from '../../../../database'
import { Connection } from 'typeorm'
import { hash } from 'bcryptjs'

let connection: Connection
let email: string
let password: string

let fakeUserToken: string

describe("Create Statement", () => {

  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    fakeUserToken = process.env.FAKE_USER_TOKEN as string

    email = 'arturminelli@gmail.com'
    password = 'lufaardala'

    const id = 'ff6668a7-21dd-4118-9ee2-5846756631db'
    const hashedPassword = await hash(password, 8)

    await connection.query(
      `INSERT INTO
      users(id, name, password, email, created_at)
      VALUES('${id}', 'Artur Peixoto', '${hashedPassword}', '${email}', 'now()')`
    )
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to create a new statement of type deposit', async () => {
    const authenticationResponse = await request(app).post('/api/v1/sessions')
      .send({
        email,
        password
      })

    const { token } = authenticationResponse.body

    const depositResponse = await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 1,
        description: 'Won the lottery'
      })
      .set('Authorization', `Bearer ${token}`)

    expect(depositResponse.statusCode).toBe(201)
  })

  it('should be able to create a new statement of type withdraw', async () => {
    const authenticationResponse = await request(app).post('/api/v1/sessions')
      .send({
        email,
        password
      })

    const { token } = authenticationResponse.body

    const withdrawResponse = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 1,
        description: 'Pay the electricity bill'
      })
      .set('Authorization', `Bearer ${token}`)

    expect(withdrawResponse.statusCode).toBe(201)
  })

  it('should not be able to create a new statement if authentication token is missing', async () => {
    const withdrawResponse = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 1,
        description: 'Pay the electricity bill'
      })

    expect(withdrawResponse.statusCode).toBe(401)
  })

  it('should not be able to create a new statement if authentication token is invalid', async () => {
    const token = 'token_that_will_not_work'

    const withdrawResponse = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 1,
        description: 'Pay the electricity bill'
      })
      .set('Authorization', `Bearer ${token}`)

    expect(withdrawResponse.statusCode).toBe(401)
  })

  it('should not be able to create a new statement if user does not exist', async () => {
    const withdrawResponse = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 1,
        description: 'Pay the electricity bill'
      })
      .set('Authorization', `Bearer ${fakeUserToken}`)

    expect(withdrawResponse.statusCode).toBe(404)
  })

  it('should not be able to create a new withdrawal statement if there are not enough funds in the account', async () => {
    const authenticationResponse = await request(app).post('/api/v1/sessions')
      .send({
        email,
        password
      })

    const { token } = authenticationResponse.body

    const withdrawResponse = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 10,
        description: 'Pay the electricity bill'
      })
      .set('Authorization', `Bearer ${token}`)

    expect(withdrawResponse.statusCode).toBe(400)
  })

})
