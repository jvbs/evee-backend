import { Router, Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { cpf as cpfValidator } from "cpf-cnpj-validator";
import { v4 as uuid } from "uuid";
import fileUpload from "express-fileupload";
// @ts-ignore
import imgbbUploader from "imgbb-uploader";

import isAuthenticated from "../middlewares/isAuthenticated";
import knex from "../database";
import { compare, hash } from "bcryptjs";

const colaboradorRouter = Router();

function titleizeName(text: string) {
  let words = text.toLowerCase().split(" ");
  for (let a = 0; a < words.length; a++) {
    let w = words[a];
    words[a] = w[0].toUpperCase() + w.slice(1);
  }
  return words.join(" ");
}

// habilitando middleware
colaboradorRouter.use(isAuthenticated);
colaboradorRouter.use(fileUpload());

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

// Listando todos os colaboradores
colaboradorRouter.get("/", async (request: Request, response: Response) => {
  const { empresa_id } = request.query;

  if (!empresa_id) {
    return response.status(400).json({
      message: "Argumentos inválidos para a requisição.",
    });
  }

  const checkEmpresa = await knex("empresa")
    .where("id", Number(empresa_id))
    .first();

  if (!checkEmpresa) {
    return response.status(400).json({
      message: "Empresa inválida.",
    });
  }

  const colaborador = await knex("colaborador")
    .select(
      "colaborador.*",
      "empresa.nome_razao_social",
      "departamento.nome_departamento",
      "cargo.nome_cargo"
    )
    .leftJoin("empresa", "colaborador.empresa_id", "=", "empresa.id")
    .leftJoin(
      "departamento",
      "colaborador.departamento_id",
      "=",
      "departamento.id"
    )
    .leftJoin("cargo", "colaborador.cargo_id", "=", "cargo.id")
    .where("colaborador.empresa_id", Number(empresa_id));

  return response.json(colaborador);
});

// Listar todos os mentores
colaboradorRouter.get(
  "/mentores",
  async (request: Request, response: Response) => {
    const { empresa_id } = request.query;

    if (!empresa_id) {
      return response.status(400).json({
        message: "Argumentos inválidos para a requisição.",
      });
    }

    const checkEmpresa = await knex("empresa")
      .where("id", Number(empresa_id))
      .first();

    if (!checkEmpresa) {
      return response.status(400).json({
        message: "Empresa inválida.",
      });
    }

    const colaborador = await knex("colaborador")
      .select(
        "colaborador.*",
        "empresa.nome_razao_social",
        "departamento.nome_departamento",
        "cargo.nome_cargo"
      )
      .leftJoin("empresa", "colaborador.empresa_id", "=", "empresa.id")
      .leftJoin(
        "departamento",
        "colaborador.departamento_id",
        "=",
        "departamento.id"
      )
      .leftJoin("cargo", "colaborador.cargo_id", "=", "cargo.id")
      .where({ tipo_usuario: "Mentor", empresa_id: Number(empresa_id) });

    return response.json(colaborador);
  }
);

// Listar mentor especifico
colaboradorRouter.get(
  "/mentor",
  async (request: Request, response: Response) => {
    const { empresa_id, mentor_id } = request.query;

    if (!empresa_id || !mentor_id) {
      return response.status(400).json({
        message: "Argumentos inválidos para a requisição.",
      });
    }

    const checkEmpresa = await knex("empresa")
      .where("id", Number(empresa_id))
      .first();

    const checkMentor = await knex("colaborador")
      .where("id", Number(mentor_id))
      .first();

    if (!checkEmpresa || !checkMentor) {
      return response.status(400).json({
        message: "Empresa ou usuário inválidos.",
      });
    }

    const colaborador = await knex("colaborador")
      .select(
        "colaborador.*",
        "empresa.nome_razao_social",
        "departamento.nome_departamento",
        "cargo.nome_cargo"
      )
      .leftJoin("empresa", "colaborador.empresa_id", "=", "empresa.id")
      .leftJoin(
        "departamento",
        "colaborador.departamento_id",
        "=",
        "departamento.id"
      )
      .leftJoin("cargo", "colaborador.cargo_id", "=", "cargo.id")
      .where({
        tipo_usuario: "Mentor",
        empresa_id: Number(empresa_id),
        "colaborador.id": Number(mentor_id),
      })
      .first();

    return response.json({
      user: {
        id: colaborador.id,
        nome: colaborador.nome,
        cpf: colaborador.cpf,
        email: colaborador.email,
        foto: colaborador.foto,
        tipo_usuario: colaborador.tipo_usuario,
        status: colaborador.status,
      },
      cargo: {
        id: colaborador.cargo_id,
        nome_cargo: colaborador.nome_cargo,
      },
      empresa: {
        id: colaborador.empresa_id,
        nome_empresa: colaborador.nome_razao_social,
      },
      departamento: {
        id: colaborador.departamento_id,
        nome_departamento: colaborador.nome_departamento,
      },
    });
  }
);

// Listar colaborador comum especifico
colaboradorRouter.get(
  "/comum",
  async (request: Request, response: Response) => {
    const { empresa_id, comum_id } = request.query;

    if (!empresa_id || !comum_id) {
      return response.status(400).json({
        message: "Argumentos inválidos para a requisição.",
      });
    }

    const checkEmpresa = await knex("empresa")
      .where("id", Number(empresa_id))
      .first();

    const checkMentor = await knex("colaborador")
      .where("id", Number(comum_id))
      .first();

    if (!checkEmpresa || !checkMentor) {
      return response.status(400).json({
        message: "Empresa ou usuário inválidos.",
      });
    }

    const colaborador = await knex("colaborador")
      .select(
        "colaborador.*",
        "empresa.nome_razao_social",
        "departamento.nome_departamento",
        "cargo.nome_cargo"
      )
      .leftJoin("empresa", "colaborador.empresa_id", "=", "empresa.id")
      .leftJoin(
        "departamento",
        "colaborador.departamento_id",
        "=",
        "departamento.id"
      )
      .leftJoin("cargo", "colaborador.cargo_id", "=", "cargo.id")
      .where({
        tipo_usuario: "Comum",
        empresa_id: Number(empresa_id),
        "colaborador.id": Number(comum_id),
      })
      .first();

    return response.json({
      user: {
        id: colaborador.id,
        nome: colaborador.nome,
        cpf: colaborador.cpf,
        email: colaborador.email,
        foto: colaborador.foto,
        tipo_usuario: colaborador.tipo_usuario,
        status: colaborador.status,
      },
      cargo: {
        id: colaborador.cargo_id,
        nome_cargo: colaborador.nome_cargo,
      },
      empresa: {
        id: colaborador.empresa_id,
        nome_empresa: colaborador.nome_razao_social,
      },
      departamento: {
        id: colaborador.departamento_id,
        nome_departamento: colaborador.nome_departamento,
      },
    });
  }
);

// Listar todos os mentorados
colaboradorRouter.get(
  "/mentorados",
  async (request: Request, response: Response) => {
    const { empresa_id } = request.query;

    if (!empresa_id) {
      return response.status(400).json({
        message: "Argumentos inválidos para a requisição.",
      });
    }

    const checkEmpresa = await knex("empresa")
      .where("id", Number(empresa_id))
      .first();

    if (!checkEmpresa) {
      return response.status(400).json({
        message: "Empresa inválida.",
      });
    }

    const colaborador = await knex("colaborador")
      .select(
        "colaborador.*",
        "empresa.nome_razao_social",
        "departamento.nome_departamento",
        "cargo.nome_cargo"
      )
      .leftJoin("empresa", "colaborador.empresa_id", "=", "empresa.id")
      .leftJoin(
        "departamento",
        "colaborador.departamento_id",
        "=",
        "departamento.id"
      )
      .leftJoin("cargo", "colaborador.cargo_id", "=", "cargo.id")
      .where({
        tipo_usuario: "Mentorado",
        "colaborador.empresa_id": Number(empresa_id),
      });

    return response.json(colaborador);
  }
);

// Listar mentorado especifico
colaboradorRouter.get(
  "/mentorado",
  async (request: Request, response: Response) => {
    const { empresa_id, mentor_id } = request.query;

    if (!empresa_id || !mentor_id) {
      return response.status(400).json({
        message: "Argumentos inválidos para a requisição.",
      });
    }

    const checkEmpresa = await knex("empresa")
      .where("id", Number(empresa_id))
      .first();

    const checkMentor = await knex("colaborador")
      .where("id", Number(mentor_id))
      .first();

    if (!checkEmpresa || !checkMentor) {
      return response.status(400).json({
        message: "Empresa ou usuário inválidos.",
      });
    }

    const colaborador = await knex("colaborador")
      .select(
        "colaborador.*",
        "empresa.nome_razao_social",
        "departamento.nome_departamento",
        "cargo.nome_cargo"
      )
      .leftJoin("empresa", "colaborador.empresa_id", "=", "empresa.id")
      .leftJoin(
        "departamento",
        "colaborador.departamento_id",
        "=",
        "departamento.id"
      )
      .leftJoin("cargo", "colaborador.cargo_id", "=", "cargo.id")
      .where({
        tipo_usuario: "Mentorado",
        empresa_id: Number(empresa_id),
        "colaborador.id": Number(mentor_id),
      })
      .first();

    return response.json({
      user: {
        id: colaborador.id,
        nome: colaborador.nome,
        cpf: colaborador.cpf,
        email: colaborador.email,
        foto: colaborador.foto,
        tipo_usuario: colaborador.tipo_usuario,
        status: colaborador.status,
      },
      cargo: {
        id: colaborador.cargo_id,
        nome_cargo: colaborador.nome_cargo,
      },
      empresa: {
        id: colaborador.empresa_id,
        nome_empresa: colaborador.nome_razao_social,
      },
      departamento: {
        id: colaborador.departamento_id,
        nome_departamento: colaborador.nome_departamento,
      },
    });
  }
);

// Listar qualquer colaborador especifico
colaboradorRouter.get("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;

  const colaborador = await knex("colaborador")
    .select(
      "colaborador.*",
      "empresa.nome_razao_social",
      "departamento.nome_departamento",
      "cargo.nome_cargo"
    )
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

  return response.json({
    user: {
      id: colaborador.id,
      nome: colaborador.nome,
      cpf: colaborador.cpf,
      email: colaborador.email,
      foto: colaborador.foto,
      tipo_usuario: colaborador.tipo_usuario,
      status: colaborador.status,
      celular: colaborador.celular,
    },
    cargo: {
      id: colaborador.cargo_id,
      nome_cargo: colaborador.nome_cargo,
    },
    empresa: {
      id: colaborador.empresa_id,
      nome_empresa: colaborador.nome_razao_social,
    },
    departamento: {
      id: colaborador.departamento_id,
      nome_departamento: colaborador.nome_departamento,
    },
  });
});

// Listar mentorados do mentor
colaboradorRouter.get(
  "/mentorados_mentor/:id",
  async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;

    if (!id) {
      return response
        .status(400)
        .json({ error: "Argumentos inválidos para completar a requisição." });
    }

    const selectMentoredsMentor = await knex("colaborador")
      .select(
        "colaborador.id",
        "colaborador.nome",
        "colaborador.foto",
        "pdi.tipo_trilha",
        "pdi.nome_trilha",
        "cargo.nome_cargo"
      )
      .leftJoin("pdi", "colaborador.id", "=", "pdi.mentorado_id")
      .leftJoin("cargo", "colaborador.cargo_id", "=", "cargo.id")
      .where("pdi.mentor_responsavel_id", id);

    return response.json(selectMentoredsMentor);
  }
);

// Criar colaborador
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
    const emailColaborador = await knex("colaborador")
      .where("email", email)
      .first();
    const cpfIsValid: boolean = cpfValidator.isValid(cpf);

    if (!empresaId || !cargoId || !departamentoId) {
      return response
        .status(400)
        .json({ error: "Argumentos inválidos para a requisição." });
    }

    if (!cpfIsValid) {
      return response.status(400).json({ error: "CPF inválido." });
    }

    if (cpfColaborador) {
      return response.status(400).json({ error: "CPF já cadastrado." });
    }

    if (emailColaborador) {
      return response.status(400).json({ error: "E-mail já cadastrado." });
    }

    console.log(cargoId);

    if (
      (cargoId.nome_cargo === "Aprendiz" ||
        cargoId.nome_cargo === "Estagiário") &&
      tipo_usuario !== "Mentorado"
    ) {
      return response.status(400).json({
        error:
          "Ops! Aprendiz e Estágiarios podem apenas ser cadastrados como mentorados.",
      });
    }

    if (
      cargoId.nome_cargo !== "Aprendiz" &&
      cargoId.nome_cargo !== "Estagiário" &&
      tipo_usuario === "Mentorado"
    ) {
      return response.status(400).json({
        error: `Ops! O cargo "${cargoId.nome_cargo}" não pode ser cadastrado como mentorado.`,
      });
    }

    const hashedPassword = await hash(senha, 8);

    const colaborador: ColaboradorTypes = {
      cpf,
      nome, //: titleizeName(nome),
      email,
      celular: celular.replace(/\D/g, ""),
      tipo_usuario,
      departamento_id,
      empresa_id,
      data_nascimento: "1990-01-01",
      cargo_id,
      foto: "",
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

// Alterar colaborador quando colaborador logado
colaboradorRouter.put(
  "/",
  celebrate(
    {
      body: Joi.object().keys({
        id: Joi.number().required(),
        nome: Joi.string().required(),
        email: Joi.string().email().required(),
        celular: Joi.string().required(),
      }),
    },
    { abortEarly: false }
  ),
  async (request: Request, response: Response, next: NextFunction) => {
    const { id, nome, email, celular } = request.body;

    // Consultando se ID's são validos
    const checkColaborador = await knex("colaborador").where("id", id).first();

    if (!checkColaborador) {
      return response
        .status(400)
        .json({ error: "Colaborador não encontrado." });
    }

    const newDadosColaborador = {
      nome,
      email,
      celular,
    };

    const updatedUsuario = await knex("colaborador")
      .update(newDadosColaborador)
      .where("id", id);

    if (updatedUsuario) {
      return response.status(200).json({
        message: "Colaborador atualizado com sucesso!",
      });
    }
  }
);

// Alterar colaborador quando ADMIN logado
colaboradorRouter.put(
  "/admin",
  celebrate(
    {
      body: Joi.object().keys({
        id: Joi.number().required(),
        cpf: Joi.string().required().length(11),
        nome: Joi.string().required(),
        email: Joi.string().email().required(),
        celular: Joi.string().required(),
        tipo_usuario: Joi.string()
          .valid("Comum", "Mentor", "Mentorado")
          .required(),
        departamento_id: Joi.number().required(),
        cargo_id: Joi.number().required(),
        status: Joi.number().required(),
      }),
    },
    { abortEarly: false }
  ),
  async (request: Request, response: Response, next: NextFunction) => {
    const {
      id,
      nome,
      cpf,
      email,
      celular,
      departamento_id,
      cargo_id,
      tipo_usuario,
      status,
    } = request.body;

    // Consultando se ID's são validos
    const checkColaborador = await knex("colaborador").where("id", id).first();

    if (!checkColaborador) {
      return response
        .status(400)
        .json({ error: "Colaborador não encontrado." });
    }

    const newDadosColaborador = {
      nome,
      cpf,
      email,
      celular,
      departamento_id,
      cargo_id,
      tipo_usuario,
      status,
    };

    const updatedUsuario = await knex("colaborador")
      .update(newDadosColaborador)
      .where("id", id);

    if (updatedUsuario) {
      return response.status(200).json({
        message: "Colaborador atualizado com sucesso!",
      });
    }
  }
);

// Atualiza senha de usuario especifico
colaboradorRouter.put(
  "/update-password/:id",
  celebrate(
    {
      body: Joi.object().keys({
        senha: Joi.string().required(),
        confirmar_senha: Joi.string().required(),
      }),
    },
    { abortEarly: false }
  ),
  async (request: Request, response: Response) => {
    const { senha, confirmar_senha } = request.body;
    const { id } = request.params;

    if (senha !== confirmar_senha) {
      return response.status(400).json({
        error: "As senhas enviadas não condizem.",
      });
    }

    // verificando se dados chaves existem
    const checkColaborador = await knex("colaborador").where("id", id).first();

    // caso algum deles exista
    if (!checkColaborador) {
      return response.status(400).json({
        error: "Usuário não encontrado.",
      });
    }

    // validando senha com a tabela usuario
    const comparedPassword = await compare(
      String(senha),
      String(checkColaborador.senha)
    );

    if (comparedPassword) {
      return response.status(400).json({
        error: "Sua nova senha precisa ser diferente da anterior.",
      });
    }

    const hashedPassword = await hash(senha, 8);

    const newDadosUsuario = {
      senha: hashedPassword,
    };

    const updatedUsuario = await knex("colaborador")
      .update(newDadosUsuario)
      .where("id", id);

    if (updatedUsuario) {
      return response.status(200).json({
        message: "Senha atualizada com sucesso!",
      });
    }
  }
);

// Atualiza senha
colaboradorRouter.put(
  "/update-password",
  celebrate(
    {
      body: Joi.object().keys({
        id: Joi.number().required(),
        senha: Joi.string().required(),
        confirmar_senha: Joi.string().required(),
      }),
    },
    { abortEarly: false }
  ),
  async (request: Request, response: Response) => {
    const { id, senha, confirmar_senha } = request.body;

    if (senha !== confirmar_senha) {
      return response.status(400).json({
        error: "As senhas enviadas não condizem.",
      });
    }

    // verificando se dados chaves existem
    const checkColaborador = await knex("colaborador").where("id", id).first();

    // caso algum deles exista
    if (!checkColaborador) {
      return response.status(400).json({
        error: "Usuário não encontrado.",
      });
    }

    // validando senha com a tabela usuario
    const comparedPassword = await compare(
      String(senha),
      String(checkColaborador.senha)
    );

    if (comparedPassword) {
      return response.status(400).json({
        error: "Sua nova senha precisa ser diferente da anterior.",
      });
    }

    const hashedPassword = await hash(senha, 8);

    const newDadosUsuario = {
      senha: hashedPassword,
    };

    const updatedUsuario = await knex("colaborador")
      .update(newDadosUsuario)
      .where("id", id);

    if (updatedUsuario) {
      return response.status(200).json({
        message: "Senha atualizada com sucesso!",
      });
    }
  }
);

// Upload foto de perfil
colaboradorRouter.post(
  "/upload-profile-picture",
  async (request: Request, response: Response) => {
    const { id } = request.body;

    if (!id || request.files === null) {
      return response.status(400).json({
        error: "Argumentos insuficientes para completar a requisição.",
      });
    }

    const img: any = request.files!.img;
    const extension: string = img.mimetype.split("/")[1];

    const imgName: string = `evee-${uuid()}.${extension}`;
    const path = `${process.cwd()}/uploads/profile-pictures/${imgName}`;

    img.mv(path, (error: any) => {
      if (error) {
        console.error(error);
        return response.status(500).send(error);
      }
    });

    imgbbUploader(process.env.IMGBB_API_KEY, path)
      .then(async (response: any) => {
        const updateImg = await knex("colaborador")
          .update({
            foto: response.url,
          })
          .where("id", id);
      })
      .catch((error: any) => console.error("error", error));

    return response
      .status(200)
      .json({ message: "Imagem adicionada com sucesso! " });
  }
);

export default colaboradorRouter;
