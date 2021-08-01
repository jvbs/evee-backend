import express from "express";
import path from "path";
import * as dotenv from "dotenv";
import cors from "cors";
import { errors as JoiErrors } from "celebrate";

const port = process.env.PORT || 8080;

dotenv.config({ path: `${process.cwd()}/.env` });

import routes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(routes);

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.use(JoiErrors());

app.listen(port, () => {
  console.log(`Server running on port ${port}! 🔥`);
});
