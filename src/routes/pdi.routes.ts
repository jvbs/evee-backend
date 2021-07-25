import { Router, Request, Response } from "express";
import { celebrate, Joi } from "celebrate";

import knex from "../database";
import isAuthenticated from "../middlewares/isAuthenticated";

const pdiRouter = Router();

// habilitando middlewares
pdiRouter.use(isAuthenticated);

// criar nova trilha
pdiRouter.post(
  "/create",
  celebrate(
    {
      body: Joi.object().keys({
        trilha_id: Joi.number().required(),
        nome_programa: Joi.string().valid("Aprendizagem", "Estágio").required(),
        competencias_tags: Joi.string(),
        mentor_responsavel_id: Joi.number().required(),
        mentorado_id: Joi.number().required(),
        nome_trilha: Joi.string().required(),
      }),
    },
    { abortEarly: false }
  ),
  async (request: Request, response: Response) => {
    const {
      trilha_id,
      nome_programa,
      competencias_tags,
      mentor_responsavel_id,
      nome_trilha,
      mentorado_id,
    } = request.body;

    // verificando se dados chaves existem
    const checkTrilha = await knex("trilha")
      .select("trilha.*", "tipo_trilha.nome_trilha")
      .leftJoin("tipo_trilha", "trilha.trilha_id", "=", "tipo_trilha.id")
      .where("trilha.id", trilha_id)
      .first();
    const checkMentor = await knex("colaborador")
      .select("colaborador.id", "colaborador.nome")
      .where({ id: mentor_responsavel_id, tipo_usuario: "Mentor" })
      .first();
    const checkMentorado = await knex("colaborador")
      .select("colaborador.id", "colaborador.nome")
      .where({ id: mentorado_id, tipo_usuario: "Mentorado" })
      .first();

    // caso algum deles exista
    if (!checkMentor || !checkTrilha || !checkMentorado) {
      return response.status(400).json({
        error: "Argumentos inválidos para a requisição.",
      });
    }

    const pdi = {
      trilha_id,
      tipo_trilha: checkTrilha.nome_trilha,
      nome_programa,
      nome_trilha,
      mentor_responsavel_id,
      mentor_responsavel_nome: checkMentor.nome,
      competencias_tags,
      mentorado_id,
      status: 1,
      avaliacao: "Não iniciado",
    };

    try {
      const transaction = await knex.transaction();
      const newPdi: Number[] = await transaction("pdi").insert(pdi);
      if (!newPdi) {
        await transaction.rollback();
      }
      await transaction.commit();
      return response.status(201).json({
        id: newPdi[0],
        ...pdi,
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

export default pdiRouter;
