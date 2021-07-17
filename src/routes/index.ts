import { Router } from "express";

import cargoRouter from "./cargo.routes";
import colaboradorRouter from "./colaborador.routes";
import departamentoRouter from "./departamento.routes";
import empresaRouter from "./empresa.routes";
import usuarioRouter from "./usuario.routes";
import authRouter from "./auth.routes";
import tipoTrilhaRouter from "./tipo_trilha.routes";
import prazoRouter from "./prazo.routes";

const routes = Router();

routes.use("/cargo", cargoRouter);
routes.use("/prazo", prazoRouter);
routes.use("/tipo-trilha", tipoTrilhaRouter);
routes.use("/usuario", usuarioRouter);
routes.use("/colaborador", colaboradorRouter);
routes.use("/departamento", departamentoRouter);
routes.use("/empresa", empresaRouter);
// Authentication Router
routes.use("/auth", authRouter);

export default routes;
