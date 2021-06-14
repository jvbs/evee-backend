import { Router, Request, Response } from "express";
import knex from "../database";
import isAuthenticated from "../middlewares/isAuthenticated";

const cargoRouter = Router();

// habilitando o middleware
// cargoRouter.use(isAuthenticated);

cargoRouter.get("/", async (request: Request, response: Response) => {
  const cargos = await knex("cargo").select("*");

  return response.json(cargos);
});

export default cargoRouter;
