describe('Create User', () => {

  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    const id = 'ff6668a7-21dd-4118-9ee2-5846756631db'
    const hashedPassword = await hash('lufaardala', 8)

    await connection.query(
      `INSERT INTO
      users(id, name, password, email, driver_license, "isAdmin", created_at)
      VALUES('${id}', 'Artur Peixoto', '${hashedPassword}', 'arturminelli@gmail.com', '12345678', true, 'now()')`
    )
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await con

})
