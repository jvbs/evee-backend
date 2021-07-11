import { Router, Request, Response } from "express";
import { celebrate, Joi } from "celebrate";
import { hash } from "bcryptjs";
import { cnpj as cnpjValidator } from "cpf-cnpj-validator";
import knex from "../database";

function titleizeName(text: string) {
  let words = text.toLowerCase().split(" ");
  for (let a = 0; a < words.length; a++) {
    let w = words[a];
    words[a] = w[0].toUpperCase() + w.slice(1);
  }
  return words.join(" ");
}

const usuarioRouter = Router();

usuarioRouter.get("/", async (request: Request, response: Response) => {
  const usuarios = await knex("usuario")
    .select(
      "usuario.id",
      "usuario.nome",
      "usuario.cargo",
      "usuario.email",
      "usuario.celular",
      { empresaId: "empresa.id" },
      "empresa.nome_razao_social",
      "empresa.cnpj"
    )
    .leftJoin("empresa", "usuario.empresa_id", "=", "empresa.id");

  const selectedUsers: [{}] = [{}];
  usuarios.map((usuario) => {
    let structure = {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        cargo: usuario.cargo,
        email: usuario.email,
        celular: usuario.celular,
      },
      empresa: {
        id: usuario.empresaId,
        nome_razao_social: usuario.nome_razao_social,
        cnpj: usuario.cnpj,
      },
    };

    selectedUsers.push(structure);
  });

  return response.json(selectedUsers);
});

usuarioRouter.get("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;

  const usuario = await knex("usuario")
    .select(
      "usuario.id",
      "usuario.nome",
      "usuario.cargo",
      "usuario.email",
      "usuario.celular",
      { empresaId: "empresa.id" },
      "empresa.nome_razao_social",
      "empresa.cnpj"
    )
    .leftJoin("empresa", "usuario.empresa_id", "=", "empresa.id")
    .where("usuario.id", id)
    .first();

  if (!usuario) {
    return response.status(400).json({ message: "Usuário não encontrado." });
  }

  const selectedUser = {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      cargo: usuario.cargo,
      email: usuario.email,
      celular: usuario.celular,
    },
    empresa: {
      id: usuario.empresaId,
      nome_razao_social: usuario.nome_razao_social,
      cnpj: usuario.cnpj,
    },
  };

  return response.json(selectedUser);
});

usuarioRouter.post(
  "/",
  celebrate(
    {
      body: Joi.object().keys({
        nome: Joi.string().required(),
        email: Joi.string().email().required(),
        celular: Joi.string().required(),
        empresa: Joi.string().required(),
        cnpj: Joi.string().length(14),
        senha: Joi.string().required(),
      }),
    },
    { abortEarly: false }
  ),
  async (request: Request, response: Response) => {
    const {
      nome,
      email,
      celular,
      empresa: nomeEmpresa,
      cnpj,
      senha,
    } = request.body;

    // verificando se dados chaves existem
    const checkEmail = await knex("usuario").where("email", email).first();
    const checkCnpj = await knex("empresa").where("cnpj", cnpj).first();
    const cnpjIsValid: boolean = cnpjValidator.isValid(cnpj);

    // caso algum deles exista
    if (!cnpjIsValid) {
      return response.status(400).json({
        error: "CNPJ inválido, verifique e tente novamente.",
      });
    }

    if (checkEmail || checkCnpj) {
      return response.status(400).json({
        error: "Demonstração já solicitada, empresa ou usuário já cadastrados.",
      });
    }

    const hashedPassword = await hash(senha, 8);

    const empresa = {
      nome_razao_social: nomeEmpresa,
      cnpj,
    };

    const newEmpresa = await knex("empresa").insert(empresa);

    const usuario = {
      nome: titleizeName(nome),
      email,
      celular,
      cargo: "Administrador",
      senha: hashedPassword,
      empresa_id: newEmpresa[0],
    };

    const newUsuario = await knex("usuario").insert(usuario);

    const solicitacaoCadastro = {
      usuario_id: newUsuario[0],
      empresa_id: newEmpresa[0],
      status: "1",
    };

    await knex("solicitacao_cadastro").insert(solicitacaoCadastro);

    return response.status(201).json({
      usuario: {
        id: newUsuario[0],
        nome: usuario.nome,
        email: usuario.email,
        celular: usuario.celular,
        cargo: usuario.cargo,
      },
      empresa: {
        id: newEmpresa[0],
        nome_razao_social: titleizeName(empresa.nome_razao_social),
        cnpj: empresa.cnpj,
      },
    });
  }
);


usuarioRouter.put(
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
  async (request: Request, response: Response) => {
    const {
      id,
      nome,
      email,
      celular,
    } = request.body;


    // verificando se dados chaves existem
    const checkUser = await knex("usuario").where("id", id).first();

    // caso algum deles exista
    if (!checkUser) {
      return response.status(400).json({
        error: "Usuário não encontrado.",
      });
    }

    const newDadosUsuario = {
      nome,
      email,
      celular
    }

    const updatedUsuario = await knex("usuario").update(newDadosUsuario).where("id", id);

    if(updatedUsuario){
      return response.status(200).json({
        message: "Usuário atualizado com sucesso!"
      })
    }

    // const solicitacaoCadastro = {
    //   usuario_id: newUsuario[0],
    //   empresa_id: newEmpresa[0],
    //   status: "1",
    // };

    // await knex("solicitacao_cadastro").insert(solicitacaoCadastro);

    // return response.status(201).json({
    //   usuario: {
    //     id: newUsuario[0],
    //     nome: usuario.nome,
    //     email: usuario.email,
    //     celular: usuario.celular,
    //     cargo: usuario.cargo,
    //   },
    //   empresa: {
    //     id: newEmpresa[0],
    //     nome_razao_social: titleizeName(empresa.nome_razao_social),
    //     cnpj: empresa.cnpj,
    //   },
    // });
  }
);


export default usuarioRouter;
