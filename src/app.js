import express from "express";
import serverless from "serverless-http";
import cors from "cors";

import routes from "./routes";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", routes);

app.use((req, res, next) => {
  res.status(404).send();
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send();
});

export const handler = serverless(app);
