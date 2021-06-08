import { Router, Request, Response } from "express";
import { hash } from "bcryptjs";
import knex from "../database";

const usuarioRouter = Router();

usuarioRouter.get("/", async (request: Request, response: Response) => {
  const usuarios = await knex("usuario").select("*");

  return response.json(usuarios);
});

usuarioRouter.get("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;

  const usuario = await knex("usuario").where("id", id).first();

  if (!usuario) {
    return response.status(400).json({ message: "Usuário não encontrado." });
  }

  return response.json(usuario);
});

usuarioRouter.post("/", async (request: Request, response: Response) => {
  const { nome, email, celular, empresa: nomeEmpresa, cnpj } = request.body;

  // verificando se dados chaves existem
  const checkEmail = await knex("usuario").where("email", email).first();
  const checkCnpj = await knex("empresa").where("cnpj", cnpj).first();

  // caso algum deles exista
  if (checkEmail || checkCnpj) {
    return response.status(400).json({ error: "Demonstração já solicitada." });
  }

  const hashedPassword = await hash("12345", 8);

  const empresa = {
    nome_razao_social: nomeEmpresa,
    cnpj,
  };

  const newEmpresa = await knex("empresa").insert(empresa);

  const usuario = {
    nome,
    email,
    celular,
    cargo: "Administrador",
    senha: hashedPassword,
    empresa_id: newEmpresa[0],
  };

  const newUsuario = await knex("usuario").insert(usuario);

  const solicitacaoCadastro = {
    usuario_id: newUsuario[0],
    empresa_id: newEmpresa[0],
    status: "1",
  };

  await knex("solicitacao_cadastro").insert(solicitacaoCadastro);

  return response.status(201).json({
    id: newUsuario[0],
    ...usuario,
  });
});

export default usuarioRouter;
