import request from 'supertest'
import { app } from '../../../../app'
import { v4 as uuidv4 } from 'uuid'

import createConnection from '../../../../database'
import { Connection } from 'typeorm'
import { hash } from 'bcryptjs'

let connection: Connection
let email: string
let password: string

let fakeUserToken: string

describe("Get Balance", () => {

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

  it('should be able to get a statement operation from a given user', async () => {
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

    const { id } = depositResponse.body

    const statementOperationResponse = await request(app).get(`/api/v1/statements/${id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(statementOperationResponse.statusCode).toBe(200)
  })

  it('should not be able to get the balance of an account if authentication token is missing', async () => {
    const fakeStatementId = uuidv4()

    const statementOperationResponse = await request(app).get(`/api/v1/statements/${fakeStatementId}`)

    expect(statementOperationResponse.statusCode).toBe(401)
  })

  it('should not be able to get the balance of an account if authentication token is invalid', async () => {
    const token = 'token_that_will_not_work'

    const fakeStatementId = uuidv4()

    const statementOperationResponse = await request(app).get(`/api/v1/statements/${fakeStatementId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(statementOperationResponse.statusCode).toBe(401)
  })

  it('should not be able to get the balance of an account if user does not exist', async () => {
    const balanceResponse = await request(app).get('/api/v1/statements/balance')
      .set('Authorization', `Bearer ${fakeUserToken}`)

    expect(balanceResponse.statusCode).toBe(404)
  })

  it('should not be able to get a statement operation if it does not exist', async () => {
    const authenticationResponse = await request(app).post('/api/v1/sessions')
      .send({
        email,
        password
      })

    const { token } = authenticationResponse.body

    await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 1,
        description: 'Won the lottery'
      })
      .set('Authorization', `Bearer ${token}`)

    const fakeStatementId = uuidv4()

    const statementOperationResponse = await request(app).get(`/api/v1/statements/${fakeStatementId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(statementOperationResponse.statusCode).toBe(404)
  })

})
