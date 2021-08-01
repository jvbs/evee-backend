import { Router, Request, Response } from "express";
import knex from "../database";
import isAuthenticated from "../middlewares/isAuthenticated";

const tipoTrilhaRouter = Router();

// habilitando o middleware
tipoTrilhaRouter.use(isAuthenticated);

tipoTrilhaRouter.get("/", async (request: Request, response: Response) => {
  const tipo_trilha = await knex("tipo_trilha").select("*");

  return response.json(tipo_trilha);
});

export default tipoTrilhaRouter;
