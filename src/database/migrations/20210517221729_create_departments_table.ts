import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("departamento", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.string("nome_departamento", 50).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("departamento");
}
