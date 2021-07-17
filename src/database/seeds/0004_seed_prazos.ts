import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("prazo").del();

  // Inserts seed entries
  await knex("prazo").insert([
    { nome_prazo: "30 dias" },
    { nome_prazo: "01 - 03 meses" },
    { nome_prazo: "03 - 06 meses" },
    { nome_prazo: "06 - 12 meses" },
  ]);
}
