import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    "solicitacao_cadastro",
    (table: Knex.TableBuilder) => {
      table.increments("id").primary();
      table
        .integer("usuario_id")
        .unsigned()
        .references("id")
        .inTable("usuario");
      table
        .integer("empresa_id")
        .unsigned()
        .references("id")
        .inTable("empresa");
      table.enum("status", [1, 0]);
    }
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("solicitacao_cadastro");
}
