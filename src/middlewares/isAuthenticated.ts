import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

import authConfig from "../config/auth";

const isAuthenticated = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ message: "JWT Token não encontrado." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = verify(token, authConfig.jwt.secret);
    // console.log(decodedToken);

    return next();
  } catch (error) {
    return response.status(401).json({ message: "JWT Token Inválido." });
  }
};

export default isAuthenticated;
