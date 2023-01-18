import { Connection, createConnection, getConnectionOptions } from 'typeorm';

interface IOptions {
  host: string;
}

export default async function (host: string = 'database_finapi'): Promise<Connection> {
  const defaultOptions = await getConnectionOptions()

  return createConnection(
    Object.assign(defaultOptions, {
      host,
    })
  )
}
