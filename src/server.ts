import express, { Router } from "express";
import path from "path";
import cors from "cors";
import { errors as JoiErrors } from "celebrate";

import routes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(routes);

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.use(JoiErrors());

app.listen(3333, () => {
  console.log("Server running on port 3333! 🔥");
});
