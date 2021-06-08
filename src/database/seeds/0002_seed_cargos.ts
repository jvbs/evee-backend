import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("cargo").del();

  // Inserts seed entries
  await knex("cargo").insert([
    { nome_cargo: "Administrador" },
    { nome_cargo: "Gerente" },
    { nome_cargo: "Coordenador" },
    { nome_cargo: "Supervisor" },
    { nome_cargo: "Líder" },
    { nome_cargo: "Analista" },
    { nome_cargo: "Assistente" },
    { nome_cargo: "Aprendiz" },
    { nome_cargo: "Estagiário" },
  ]);
}
