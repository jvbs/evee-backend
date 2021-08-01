import { Router, Request, Response } from "express";
import knex from "../database";
import isAuthenticated from "../middlewares/isAuthenticated";

const prazoRouter = Router();

// habilitando o middleware
prazoRouter.use(isAuthenticated);

prazoRouter.get("/", async (request: Request, response: Response) => {
  const prazos = await knex("prazo").select("*");

  return response.json(prazos);
});

export default prazoRouter;
