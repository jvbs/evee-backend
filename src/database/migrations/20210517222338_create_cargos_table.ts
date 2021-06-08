import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("cargo", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.string("nome_cargo", 40).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("cargo");
}
