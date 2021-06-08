"use strict";
// Update with your config settings.
module.exports = {
  development: {
    useNullAsDefault: true,
    // client: "mysql",
    // connection: {
    //   host: "localhost",
    //   user: "root",
    //   password: "root",
    //   database: "evee",
    // },
    client: "sqlite3",
    connection: {
      filename: dirname + "/dist/database/database.sqlite",
    },
    migrations: {
      tableName: "knex_migrations",
      directory: dirname + "/dist/database/migrations",
    },
    seeds: {
      directory: dirname + "/dist/database/seeds",
    },
  },
  production: {
    useNullAsDefault: true,
    // client: "mysql",
    // connection: {
    //   host: "localhost",
    //   user: "root",
    //   password: "root",
    //   database: "evee",
    // },
    client: "sqlite3",
    connection: {
      filename: dirname + "/dist/database/database.sqlite",
    },
    migrations: {
      tableName: "knex_migrations",
      directory: dirname + "/dist/database/migrations",
    },
    seeds: {
      directory: dirname + "/dist/database/seeds",
    },
  },
  // staging: {
  //   client: "postgresql",
  //   connection: {
  //     database: "my_db",
  //     user: "username",
  //     password: "password"
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: "knex_migrations"
  //   }
  // },
  // production: {
  //   client: "postgresql",
  //   connection: {
  //     database: "my_db",
  //     user: "username",
  //     password: "password"
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: "knex_migrations"
  //   }
  // }
};
