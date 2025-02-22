import mariadb from 'mariadb';
import config from '../config.mjs';

const databaseConnectionPool = mariadb.createPool(config.database);

class DatabaseConnectionPoolWrapper {
  #databaseConnectionPool;

  constructor(connectionPool) {
    this.#databaseConnectionPool = connectionPool;
  }

  get databaseConnectionPool() {
    return this.#databaseConnectionPool;
  }

  async query(sql, rowsAsArray = false) {
    const result = await this.#databaseConnectionPool.query({
      bigIntAsNumber: true,
      rowsAsArray,
      sql,
    });

    return result;
  }

  async queryNamedPlaceholders(sql, bindings, rowsAsArray = false) {
    const result = await this.#databaseConnectionPool.query(
      {
        bigIntAsNumber: true,
        rowsAsArray,
        namedPlaceholders: true,
        sql,
      },
      bindings
    );

    return result;
  }

  async getConnection() {
    return await this.#databaseConnectionPool.getConnection();
  }
}

export default new DatabaseConnectionPoolWrapper(databaseConnectionPool);
