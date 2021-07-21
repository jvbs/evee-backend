import { Router, Request, Response } from "express";
import { celebrate, Joi } from "celebrate";

import knex from "../database";
import isAuthenticated from "../middlewares/isAuthenticated";

const trilhaRouter = Router();

// habilitando middlewares
trilhaRouter.use(isAuthenticated);

// criar nova trilha
trilhaRouter.post(
  "/create",
  celebrate(
    {
      body: Joi.object().keys({
        trilha_id: Joi.number().required(),
        programa: Joi.string().valid("Aprendizagem", "Estágio").required(),
        departamento_id: Joi.number().required(),
        empresa_id: Joi.number().required(),
        nome: Joi.string().required(),
        descricao: Joi.string().max(255),
        prazo_id: Joi.number().required(),
      }),
    },
    { abortEarly: false }
  ),
  async (request: Request, response: Response) => {
    const {
      trilha_id,
      programa,
      departamento_id,
      empresa_id,
      nome,
      descricao,
      prazo_id,
    } = request.body;

    // verificando se dados chaves existem
    const checkPrazo = await knex("prazo").where("id", prazo_id).first();
    const checkEmpresa = await knex("empresa").where("id", empresa_id).first();
    const checkDpto = await knex("departamento")
      .where("id", departamento_id)
      .first();

    // caso algum deles exista
    if (!checkDpto || !checkEmpresa || !checkPrazo) {
      return response.status(400).json({
        error: "Argumentos inválidos para a requisição.",
      });
    }

    // verificando se a trilha é válida
    const checkTrilha = await knex("trilha")
      .where({
        empresa_id: empresa_id,
        programa: programa,
        departamento_id: departamento_id,
        trilha_id: trilha_id,
      })
      .first();

    if (checkTrilha) {
      // trilha invalida
      return response.status(400).json({ error: "Trilha inválida." });
    }

    const trilha = {
      trilha_id,
      programa,
      departamento_id,
      empresa_id,
      nome,
      descricao,
      prazo_id,
      status: 1,
    };

    console.log('dispardo')

    try {
      const transaction = await knex.transaction();

      const newTrilha: Number[] = await transaction("trilha").insert(trilha);

      if (!newTrilha) {
        await transaction.rollback();
      }

      await transaction.commit();

      return response.status(201).json({
        id: newTrilha[0],
        ...trilha,
      });
    } catch (error) {
      if (error.errno === 1062) {
        return response
          .status(500)
          .json({ error: "Valor chave já cadastrado." });
      } else {
        console.log(error);
      }
    }
  }
);

trilhaRouter.get(
  "/aprendizagem/:id",
  async (request: Request, response: Response) => {
    const { id } = request.params;

    if (!id) {
      return response.status(400).json({
        error: "Argumentos inválidos para a requisição.",
      });
    }

    const trilha = await knex("trilha")
      .select("trilha.*", "tipo_trilha.nome_trilha", "prazo.nome_prazo")
      .leftJoin("tipo_trilha", "trilha.trilha_id", "=", "tipo_trilha.id")
      .leftJoin("prazo", "trilha.prazo_id", "=", "prazo.id")
      .where({
        empresa_id: id,
        programa: "Aprendizagem",
      });

    return response.json(trilha);
  }
);

trilhaRouter.get(
  "/estagio/:id",
  async (request: Request, response: Response) => {
    const { id } = request.params;

    if (!id) {
      return response.status(400).json({
        error: "Argumentos inválidos para a requisição.",
      });
    }

    const trilha = await knex("trilha")
      .select("trilha.*", "tipo_trilha.nome_trilha", "prazo.nome_prazo")
      .leftJoin("tipo_trilha", "trilha.trilha_id", "=", "tipo_trilha.id")
      .leftJoin("prazo", "trilha.prazo_id", "=", "prazo.id")
      .where({
        empresa_id: id,
        programa: "Estágio",
      });

    return response.json(trilha);
  }
);

export default trilhaRouter;
