import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("colaborador", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.string("cpf", 11).notNullable().unique();
    table.string("nome", 100).notNullable();
    table.date("data_nascimento").notNullable();
    table.string("email", 100).notNullable();
    table.string("senha", 100).notNullable();
    table.string("celular", 14).notNullable();
    table.string("foto", 50).notNullable();
    table.enum("tipo_usuario", ["Comum", "Mentor", "Mentorado"]).notNullable();
    table
      .integer("departamento_id")
      .unsigned()
      .references("id")
      .inTable("departamento");
    table.integer("empresa_id").unsigned().references("id").inTable("empresa");
    table.integer("cargo_id").unsigned().references("id").inTable("cargo");
    table.enum("status", [1, 0]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("colaborador");
}
