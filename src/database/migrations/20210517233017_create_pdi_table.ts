import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("pdi", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.integer("trilha_id").unsigned().references("id").inTable("trilha");
    table
      .integer("mentorado_id")
      .unsigned()
      .references("id")
      .inTable("colaborador");
    table.string("tipo_trilha", 100).notNullable();
    table.string("nome_programa", 100).notNullable();
    table.string("nome_trilha", 100).notNullable();
    table
      .integer("mentor_responsavel_id")
      .unsigned()
      .references("id")
      .inTable("colaborador");
    table.string("mentor_responsavel_nome", 100).notNullable();
    table.string("competencias_tags", 255).notNullable();
    table.enum("status", [
      "Ativo",
      "Inativo",
      "Concluído",
      "Não concluído",
      "Bloqueado",
    ]);
    table
      .enum("avaliacao", [
        "Não iniciado",
        "Insatisfatório",
        "Parcialmente insatisfatório",
        "Satisfatório",
        "Excelente",
      ])
      .notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("pdi");
}
