import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("usuario", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.string("nome", 100).notNullable();
    table.string("cargo", 50).notNullable();
    table.string("email", 100).notNullable();
    table.string("senha", 100).notNullable();
    table.string("celular", 11).notNullable();
    table.integer("empresa_id").unsigned().references("id").inTable("empresa");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("usuario");
}
