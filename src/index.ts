import express from "express";
import { Request, Response } from "express";

const app = express();
const PORT = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

app.use("/api/v1");

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
