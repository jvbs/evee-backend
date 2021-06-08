import { Router, Request, Response } from "express";
import { cnpj as cnpjValidator } from "cpf-cnpj-validator";
import { celebrate, Joi } from "celebrate";

import knex from "../database";

const empresaRouter = Router();

empresaRouter.get("/", async (request: Request, response: Response) => {
  const empresas = await knex("empresa").select("*");

  return response.json(empresas);
});

empresaRouter.post(
  "/",
  celebrate(
    {
      body: Joi.object().keys({
        nome_razao_social: Joi.string().required(),
        cnpj: Joi.string().required().length(14),
      }),
    },
    { abortEarly: false }
  ),
  async (request: Request, response: Response) => {
    const { nome_razao_social, cnpj } = request.body;

    const cnpjIsValid: boolean = cnpjValidator.isValid(cnpj);

    if (!nome_razao_social || !cnpj /*|| cnpjIsValid === false*/) {
      return response.status(500).json({ error: "Dados inválidos." });
    }

    const newEmpresa = await knex("empresa").insert({
      nome_razao_social,
      cnpj,
    });

    return response.json({
      id: newEmpresa[0],
      nome_razao_social,
      cnpj,
    });
  }
);

empresaRouter.delete("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;

  if (!id) {
    return response.status(400).send();
  }

  await knex("empresa").del().where({ id });
  return response.status(200).send();
});

empresaRouter.put(
  "/:id",
  celebrate(
    {
      body: Joi.object().keys({
        nome_razao_social: Joi.string(),
        cnpj: Joi.string().length(14),
      }),
    },
    { abortEarly: false }
  ),
  async (request: Request, response: Response) => {
    const { id } = request.params;
    const { nome_razao_social, cnpj } = request.body;

    // const cnpjIsValid: boolean = cnpjValidator.isValid(cnpj);

    if (!id || !nome_razao_social || !cnpj /*|| cnpjIsValid === false*/) {
      return response
        .status(400)
        .json({ error: "Argumentos inválidos para a requisição." });
    }

    const empresa = await knex("empresa").where({ id }).first();

    if (!empresa) {
      return response.status(400).json({ error: "Empresa não encontrada." });
    }

    const updatedEmpresa = await knex("empresa")
      .update({ nome_razao_social, cnpj })
      .where({ id });

    console.log(updatedEmpresa);

    return response.send();
  }
);

export default empresaRouter;
