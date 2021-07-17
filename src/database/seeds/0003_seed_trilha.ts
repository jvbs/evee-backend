import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("tipo_trilha").del();

  // Inserts seed entries
  await knex("tipo_trilha").insert([
    { nome_trilha: "Trilha - Básico I" },
    { nome_trilha: "Trilha - Básico II" },
    { nome_trilha: "Trilha - Intermediario I" },
    { nome_trilha: "Trilha - Intermediario II" },
    { nome_trilha: "Trilha - Avancado I" },
    { nome_trilha: "Trilha - Avancado II" },
  ]);
}
