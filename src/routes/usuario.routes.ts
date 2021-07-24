import { Router, Request, Response } from "express";
import { celebrate, Joi } from "celebrate";
import { compare, hash } from "bcryptjs";
import { cnpj as cnpjValidator } from "cpf-cnpj-validator";
import { v4 as uuid } from "uuid";
import fileUpload from "express-fileupload";
// @ts-ignore
import imgbbUploader from "imgbb-uploader";

import knex from "../database";
import isAuthenticated from "../middlewares/isAuthenticated";

function titleizeName(text: string) {
  let words = text.toLowerCase().split(" ");
  for (let a = 0; a < words.length; a++) {
    let w = words[a];
    words[a] = w[0].toUpperCase() + w.slice(1);
  }
  return words.join(" ");
}

const usuarioRouter = Router();

// habilitando middlewares
// usuarioRouter.use(isAuthenticated);
usuarioRouter.use(fileUpload());

usuarioRouter.get(
  "/",
  isAuthenticated,
  async (request: Request, response: Response) => {
    const usuarios = await knex("usuario")
      .select(
        "usuario.id",
        "usuario.nome",
        "usuario.cargo",
        "usuario.email",
        "usuario.foto",
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
          foto: usuario.foto,
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
  }
);

usuarioRouter.get(
  "/:id",
  isAuthenticated,
  async (request: Request, response: Response) => {
    const { id } = request.params;

    const usuario = await knex("usuario")
      .select(
        "usuario.id",
        "usuario.nome",
        "usuario.cargo",
        "usuario.email",
        "usuario.foto",
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
        foto: usuario.foto,
      },
      empresa: {
        id: usuario.empresaId,
        nome_razao_social: usuario.nome_razao_social,
        cnpj: usuario.cnpj,
      },
    };

    return response.json(selectedUser);
  }
);

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
  isAuthenticated,
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
    const { id, nome, email, celular } = request.body;

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
      celular,
    };

    const updatedUsuario = await knex("usuario")
      .update(newDadosUsuario)
      .where("id", id);

    if (updatedUsuario) {
      return response.status(200).json({
        message: "Usuário atualizado com sucesso!",
      });
    }
  }
);

usuarioRouter.put(
  "/update-password",
  isAuthenticated,
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
    const checkUsuario = await knex("usuario").where("id", id).first();

    // caso algum deles exista
    if (!checkUsuario) {
      return response.status(400).json({
        error: "Usuário não encontrado.",
      });
    }

    // validando senha com a tabela usuario
    const comparedPassword = await compare(
      String(senha),
      String(checkUsuario.senha)
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

    const updatedUsuario = await knex("usuario")
      .update(newDadosUsuario)
      .where("id", id);

    if (updatedUsuario) {
      return response.status(200).json({
        message: "Senha atualizada com sucesso!",
      });
    }
  }
);

usuarioRouter.post(
  "/upload-profile-picture",
  isAuthenticated,
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
        const updateImg = await knex("usuario")
          .update({
            foto: response.url,
          })
          .where("id", id);
      })
      .catch((error: any) => console.error("error", error));

    return response
      .status(200)
      .json({ message: "Imagem adicionada com sucesso! " });

    // console.log(updateImg);
  }
);

export default usuarioRouter;
