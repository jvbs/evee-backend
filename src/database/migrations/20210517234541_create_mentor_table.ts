import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("mentor", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table
      .integer("colaborador_id")
      .unsigned()
      .references("id")
      .inTable("colaborador");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("mentor");
}
