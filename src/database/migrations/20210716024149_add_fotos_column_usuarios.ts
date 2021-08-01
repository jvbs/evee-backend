import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table("usuario", (table) => {
    table.string("foto", 50);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table("usuario", (table) => {
    table.dropColumn("foto");
  });
}
