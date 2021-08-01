import { Router, Request, Response } from "express";
import { celebrate, Joi } from "celebrate";

import knex from "../database";
import isAuthenticated from "../middlewares/isAuthenticated";

const metricaRouter = Router();

// habilitando middlewares
metricaRouter.use(isAuthenticated);

metricaRouter.get("/mentor", async (request: Request, response: Response) => {
  const { empresa_id, departamento_id, id } = request.query;

  if (!empresa_id || !departamento_id || !id) {
    return response.status(400).json({
      error: "Argumentos inválidos para completar a requisição.",
    });
  }

  const metricasDpto = await knex.raw(
    "SELECT 	sum(case when b.nome_cargo = 'Aprendiz' then 1 else 0 end) as aprendizes, \
		sum(case when b.nome_cargo = 'Estagiário' then 1 else 0 end) as estagiarios, \
    sum(case when a.tipo_usuario = 'Mentor' then 1 else 0 end) as mentores \
FROM colaborador a \
left join cargo b \
on a.cargo_id = b.id where a.empresa_id = ? and a.departamento_id = ?",
    [Number(empresa_id), Number(departamento_id)]
  );
  const metricasMeusMentorados = await knex.raw(
    "SELECT 	count(*) as meus_mentorados \
FROM pdi \
where mentor_responsavel_id = ?",
    [Number(id)]
  );

  response.json({ ...metricasDpto[0], ...metricasMeusMentorados[0] });
});

metricaRouter.get(
  "/visualizar-mentor",
  async (request: Request, response: Response) => {
    const { empresa_id, departamento_id, id } = request.query;

    if (!empresa_id || !departamento_id || !id) {
      return response.status(400).json({
        error: "Argumentos inválidos para completar a requisição.",
      });
    }

    const metricasDpto = await knex.raw(
      "SELECT 	sum(case when b.nome_cargo = 'Aprendiz' then 1 else 0 end) as aprendizes, \
		sum(case when b.nome_cargo = 'Estagiário' then 1 else 0 end) as estagiarios, \
    sum(case when a.tipo_usuario = 'Mentor' then 1 else 0 end) as mentores \
FROM colaborador a \
left join cargo b \
on a.cargo_id = b.id where a.empresa_id = ? and a.departamento_id = ?",
      [Number(empresa_id), Number(departamento_id)]
    );

    const metricasMeusMentorados = await knex.raw(
      "SELECT 	sum(case when nome_programa = 'Aprendizagem' then 1 else 0 end) as aprendizes, \
      sum(case when nome_programa = 'Estágio' then 1 else 0 end) as estagio \
FROM pdi \
where mentor_responsavel_id = ?",
      [Number(id)]
    );

    console.log(metricasMeusMentorados);

    response.json({
      metricasDpto: { ...metricasDpto[0] },
      metricasMentor: { ...metricasMeusMentorados[0] },
    });
  }
);

metricaRouter.get(
  "/admin-comum",
  async (request: Request, response: Response) => {
    const { empresa_id } = request.query;

    if (!empresa_id) {
      return response.status(400).json({
        error: "Argumentos inválidos para completar a requisição.",
      });
    }

    const query = await knex.raw(
      "SELECT 	sum(case when b.nome_cargo = 'Aprendiz' then 1 else 0 end) as aprendizes, \
		sum(case when b.nome_cargo = 'Estagiário' then 1 else 0 end) as estagiarios, \
        sum(case when a.tipo_usuario = 'Mentor' then 1 else 0 end) as mentores \
FROM colaborador a \
left join cargo b \
on a.cargo_id = b.id where a.empresa_id = ?",
      [Number(empresa_id)]
    );

    response.json(query);
  }
);

export default metricaRouter;
