import { Router, Request, Response } from "express";
import knex from "../database";
import isAuthenticated from "../middlewares/isAuthenticated";

const departamentoRouter = Router();

// habilitando o middleware
// departamentoRouter.use(isAuthenticated);

departamentoRouter.get("/", async (request: Request, response: Response) => {
  const departamentos = await knex("departamento").select("*");

  if (!departamentos) {
    return response.status(400).json({
      message: "Ocorreu um erro em sua requisição. Tente novamente mais tarde",
    });
  }

  return response.json(departamentos);
});

departamentoRouter.get("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;

  const departamento = await knex("departamento")
    .select("*")
    .where({ id })
    .first();

  if (!departamento) {
    return response.status(400).json({ error: "Departamento não encontrado." });
  }

  return response.status(200).json(departamento);
});

departamentoRouter.post("/", async (request: Request, response: Response) => {
  const { nome_departamento } = request.body;

  if (!nome_departamento) {
    return response.status(500).json({});
  }

  const checkDepartamento = await knex("departamento")
    .select("nome_departamento")
    .where("nome_departamento", nome_departamento.toLowerCase())
    .first();

  if (checkDepartamento) {
    return response.status(403).json({ message: "Departamento já existente." });
  }

  const newDepartamento = await knex("departamento").insert({
    nome_departamento,
  });

  return response.status(201).json({
    id: newDepartamento[0],
    nome_departamento,
  });
});

departamentoRouter.delete(
  "/:id",
  async (request: Request, response: Response) => {
    const { id } = request.params;

    if (!id) {
      return response.status(400).send();
    }
    await knex("departamento").del().where({ id });
    return response.status(200).send();
  }
);

departamentoRouter.put("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;
  const { nome_departamento } = request.body;

  const departamento = await knex("departamento").where({ id }).first();

  if (!departamento || !nome_departamento) {
    return response
      .status(400)
      .json({ message: "Departamento não encontrado." });
  }

  await knex("departamento").update({ nome_departamento }).where({ id });

  return response.send();
});

export default departamentoRouter;
