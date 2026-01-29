import express from "express";
import auth from "./auth.route";

const router = express.Router();

router.use("/", auth);

export default router;
