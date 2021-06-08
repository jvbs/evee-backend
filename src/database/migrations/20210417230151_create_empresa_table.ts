import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("empresa", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.string("nome_razao_social", 50).notNullable();
    table.string("cnpj", 14).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("empresa");
}
