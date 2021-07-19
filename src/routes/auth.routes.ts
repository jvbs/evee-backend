import { Router } from "express";
import { compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

import knex from "../database";
import authConfig from "../config/auth";

const authRouter = Router();

authRouter.get("/check", async (request, response) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ message: "JWT Token não encontrado." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken: any = verify(token, authConfig.jwt.secret);

    const [userId, userType] = decodedToken.sub.split("_");

    if (Number(userType) === 1) {
      // usuario
      var dbUser = await knex("usuario")
        .select(
          "usuario.*",
          { empresaId: "empresa.id" },
          "empresa.nome_razao_social",
          "empresa.cnpj"
        )
        .leftJoin("empresa", "usuario.empresa_id", "=", "empresa.id")
        .where("usuario.id", userId)
        .first();
    } else {
      // colaborador
      var dbUser = await knex("colaborador")
        .select(
          "colaborador.*",
          { empresaId: "empresa.id" },
          "empresa.nome_razao_social",
          "empresa.cnpj",
          "cargo.nome_cargo",
          "departamento.nome_departamento"
        )
        .leftJoin("empresa", "colaborador.empresa_id", "=", "empresa.id")
        .leftJoin("cargo", "colaborador.cargo_id", "=", "cargo.id")
        .leftJoin(
          "departamento",
          "colaborador.departamento_id",
          "=",
          "departamento.id"
        )
        .where("colaborador.id", userId)
        .first();
    }

    const userReturn = {
      token,
      user: {
        id: dbUser.id,
        cpf: dbUser.cpf,
        nome: dbUser.nome,
        userType: Number(userType) === 1 ? "Admin" : dbUser.tipo_usuario,
        email: dbUser.email,
        celular: dbUser.celular,
        foto: dbUser.foto,
        cargo: Number(userType) === 1 ? dbUser.cargo : dbUser.nome_cargo,
        status: Number(userType) === 1 ? 1 : Number(dbUser.status),
        cargo_id: dbUser.cargo_id,
        departamento_id: dbUser.departamento_id,
        departamento:
          Number(userType) === 1 ? "Administrador" : dbUser.nome_departamento,
        empresa_id:
          Number(userType) === 1 ? dbUser.empresa_id : dbUser.empresa_id,
        nome_empresa:
          Number(userType) === 1
            ? dbUser.nome_razao_social
            : dbUser.nome_razao_social,
      },
    };
    // console.log(userReturn);
    return response.json(userReturn);
  } catch (error) {
    return response.status(401).json({ message: "JWT Token Inválido." });
  }
});

authRouter.post("/", async (request, response) => {
  const { email, senha } = request.body;

  const checkUsuario = await knex("usuario")
    .select(
      "usuario.id",
      "usuario.nome",
      "usuario.cargo",
      "usuario.email",
      "usuario.celular",
      "usuario.foto",
      "usuario.senha",
      { empresaId: "empresa.id" },
      "empresa.nome_razao_social",
      "empresa.cnpj"
    )
    .leftJoin("empresa", "usuario.empresa_id", "=", "empresa.id")
    .where("email", email)
    .first();

  const checkColaborador = await knex("colaborador")
    .select(
      "colaborador.*",
      { empresaId: "empresa.id" },
      "empresa.nome_razao_social",
      "empresa.cnpj",
      "cargo.nome_cargo",
      "departamento.nome_departamento"
    )
    .leftJoin("empresa", "colaborador.empresa_id", "=", "empresa.id")
    .leftJoin("cargo", "colaborador.cargo_id", "=", "cargo.id")
    .leftJoin(
      "departamento",
      "colaborador.departamento_id",
      "=",
      "departamento.id"
    )
    .where("email", email)
    .first();

  if (!checkUsuario && !checkColaborador) {
    return response
      .status(400)
      .json({ message: "Credenciais não encontradas. Você tem cadastro?" });
  }

  let userType = null; // usuario [1] / colaborador [2]
  let token = null;

  if (checkUsuario) {
    userType = 1;

    // validando senha com a tabela usuario
    const comparedPassword = await compare(
      String(senha),
      String(checkUsuario.senha)
    );

    if (!comparedPassword) {
      return response
        .status(400)
        .json({ message: "Usuário ou senha inválidos." });
    }

    // gerando token
    token = sign({}, authConfig.jwt.secret, {
      subject: String(`${checkUsuario.id}_${userType}`),
      expiresIn: String(authConfig.jwt.expiresIn),
    });
  } else if (checkColaborador) {
    userType = 2;

    // validando senha com a tabela colaborador
    const comparedPassword = await compare(
      String(senha),
      String(checkColaborador.senha)
    );

    if (!comparedPassword) {
      return response
        .status(400)
        .json({ message: "Usuário ou senha inválidos." });
    }

    // gerando token
    token = sign({}, authConfig.jwt.secret, {
      subject: String(`${checkColaborador.id}_${userType}`),
      expiresIn: String(authConfig.jwt.expiresIn),
    });
  } else {
    return response
      .status(400)
      .json({ message: "Usuário ou senha inválidos." });
  }

  const userReturn = {
    token,
    user: {
      id: userType === 1 ? checkUsuario.id : checkColaborador.id,
      cpf: userType === 1 ? "" : checkColaborador.cpf,
      nome: userType === 1 ? checkUsuario.nome : checkColaborador.nome,
      userType: userType === 1 ? "Admin" : checkColaborador.tipo_usuario,
      cargo: userType === 1 ? "Administrador" : checkColaborador.nome_cargo,
      foto: userType === 1 ? checkUsuario.foto : null,
      departamento:
        userType === 1 ? "Administrador" : checkColaborador.nome_departamento,
      cargo_id: userType === 1 ? "" : checkColaborador.cargo_id,
      status: userType === 1 ? 1 : checkColaborador.status,
      departamento_id: userType === 1 ? "" : checkColaborador.departamento_id,
      email,
      celular: userType === 1 ? checkUsuario.celular : checkColaborador.celular,
      nome_empresa:
        userType === 1
          ? checkUsuario.nome_razao_social
          : checkColaborador.nome_razao_social,
      empresa_id:
        userType === 1 ? checkUsuario.empresaId : checkColaborador.empresaId,
    },
  };

  return response.json(userReturn);
});

export default authRouter;
