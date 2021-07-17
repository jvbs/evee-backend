import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("prazo", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.string("nome_prazo", 100).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("prazo");
}
