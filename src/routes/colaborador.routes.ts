import { celebrate, Joi } from "celebrate";
import { Router, Request, Response, NextFunction } from "express";
import password from "secure-random-password";
import { cpf as cpfValidator } from "cpf-cnpj-validator";

import isAuthenticated from "../middlewares/isAuthenticated";
import knex from "../database";
import { hash } from "bcryptjs";

const colaboradorRouter = Router();

// habilitando middleware
colaboradorRouter.use(isAuthenticated);

type ColaboradorTypes = {
  cpf: string;
  nome: string;
  email: string;
  senha: string;
  celular: string;
  foto: string;
  data_nascimento: string;
  tipo_usuario: string;
  departamento_id: Number;
  empresa_id: Number;
  cargo_id: Number;
  status: boolean;
};

colaboradorRouter.get("/", async (request: Request, response: Response) => {
  const colaborador = await knex("colaborador")
    .select("*")
    .leftJoin("empresa", "colaborador.empresa_id", "=", "empresa.id")
    .leftJoin(
      "departamento",
      "colaborador.departamento_id",
      "=",
      "departamento.id"
    )
    .leftJoin("cargo", "colaborador.cargo_id", "=", "cargo.id");

  return response.json(colaborador);
});

colaboradorRouter.get("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;

  const colaborador = await knex("colaborador")
    .select("*")
    .leftJoin("empresa", "colaborador.empresa_id", "=", "empresa.id")
    .leftJoin(
      "departamento",
      "colaborador.departamento_id",
      "=",
      "departamento.id"
    )
    .leftJoin("cargo", "colaborador.cargo_id", "=", "cargo.id")
    .where("colaborador.id", id)
    .first();

  if (!colaborador) {
    return response
      .status(400)
      .json({ message: "Colaborador não encontrado." });
  }

  return response.json(colaborador);
});

colaboradorRouter.post(
  "/",
  celebrate(
    {
      body: Joi.object().keys({
        cpf: Joi.string().required().length(11),
        nome: Joi.string().required(),
        email: Joi.string().email().required(),
        celular: Joi.string().required(),
        tipo_usuario: Joi.string()
          .valid("Comum", "Mentor", "Mentorado")
          .required(),
        departamento_id: Joi.number().required(),
        empresa_id: Joi.number().required(),
        cargo_id: Joi.number().required(),
        status: Joi.number().required(),
        senha: Joi.string().required(),
        confirmar_senha: Joi.string().required(),
      }),
    },
    { abortEarly: false }
  ),
  async (request: Request, response: Response, next: NextFunction) => {
    const {
      cpf,
      nome,
      email,
      celular,
      status,
      tipo_usuario,
      departamento_id,
      empresa_id,
      cargo_id,
      senha,
    } = request.body;

    // Consultando se ID's são validos
    const empresaId = await knex("empresa").where("id", empresa_id).first();
    const cargoId = await knex("cargo").where("id", cargo_id).first();
    const departamentoId = await knex("departamento")
      .where("id", departamento_id)
      .first();
    const cpfColaborador = await knex("colaborador").where("cpf", cpf).first();
    const cpfIsValid: boolean = cpfValidator.isValid(cpf);

    if (
      !empresaId ||
      !cargoId ||
      !departamentoId ||
      !cpfIsValid ||
      cpfColaborador
    ) {
      return response
        .status(400)
        .json({ error: "Argumentos inválidos para a requisição." });
    }

    const hashedPassword = await hash(senha, 8);
    const colaborador: ColaboradorTypes = {
      cpf,
      nome,
      email,
      celular: celular.replace(/\D/g, ""),
      tipo_usuario,
      departamento_id,
      empresa_id,
      data_nascimento: "1990-01-01",
      cargo_id,
      foto: "usuarioSemFoto.png",
      status: Number(status) === 1 ? true : false,
      senha: hashedPassword,
    };

    try {
      const transaction = await knex.transaction();

      const newColaborador: Number[] = await transaction("colaborador").insert(
        colaborador
      );

      if (!newColaborador) {
        await transaction.rollback();
      }

      await transaction.commit();

      return response.status(201).json({
        id: newColaborador[0],
        ...colaborador,
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

export default colaboradorRouter;
