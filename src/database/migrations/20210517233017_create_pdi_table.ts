import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("pdi", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.string("nome_trilha", 40).notNullable();
    table.enum("tipo_trilha", [1, 2, 3]).notNullable();
    table.integer("duracao", 2).notNullable();
    table.integer("empresa_id").unsigned().references("id").inTable("empresa");
    table.enum("status", [1, 0]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("pdi");
}
