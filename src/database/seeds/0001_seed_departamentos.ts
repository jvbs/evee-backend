import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("departamento").del();

  // Inserts seed entries
  await knex("departamento").insert([
    { nome_departamento: "Administrativo" },
    { nome_departamento: "Atendimento" },
    { nome_departamento: "Business Intelligence" }, 
    { nome_departamento: "Comercial" },
    { nome_departamento: "Design" }, 
    { nome_departamento: "Financeiro" },
    { nome_departamento: "Logística" },   
    { nome_departamento: "Marketing" },
    { nome_departamento: "Mídias Sociais" },  
    { nome_departamento: "Recursos Humanos" },    
    { nome_departamento: "TI - Desenvolvimento" },
    { nome_departamento: "TI - Gestão e Processos" },
    { nome_departamento: "TI - Infraestrutura" },
    { nome_departamento: "TI - Qualidade" },
    { nome_departamento: "TI - Segurança" },
    { nome_departamento: "TI - Suporte" },
    ]);
}
