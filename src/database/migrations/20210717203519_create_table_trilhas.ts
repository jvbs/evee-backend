import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("trilha", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.string("nome", 100).notNullable();
    table.string("descricao", 255).notNullable();
    table.enum("programa", ["Aprendizagem", "Estágio"]).notNullable();
    table
      .integer("departamento_id")
      .unsigned()
      .references("id")
      .inTable("departamento");
    table
      .integer("trilha_id")
      .unsigned()
      .references("id")
      .inTable("tipo_trilha");
    table.integer("prazo_id").unsigned().references("id").inTable("prazo");
    table.enum("status", [1, 0]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("trilha");
}
