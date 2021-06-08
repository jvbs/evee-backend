import { Router } from "express";

import cargoRouter from "./cargo.routes";
import colaboradorRouter from "./colaborador.routes";
import departamentoRouter from "./departamento.routes";
import empresaRouter from "./empresa.routes";
import usuarioRouter from "./usuario.routes";
import authRouter from "./auth.routes";

const routes = Router();

routes.use("/cargo", cargoRouter);
routes.use("/usuario", usuarioRouter);
routes.use("/colaborador", colaboradorRouter);
routes.use("/departamento", departamentoRouter);
routes.use("/empresa", empresaRouter);
// Authentication Router
routes.use("/auth", authRouter);

export default routes;
