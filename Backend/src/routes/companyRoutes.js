import { Router } from "express";
import {
  getCompanies,
  getCompanyByWallet,
  getShoesByCompany,
  saveCompany,
} from "../controllers/shoeController.js";

export const companyRoutes = Router();

companyRoutes.get("/", getCompanies);
companyRoutes.post("/", saveCompany);
companyRoutes.get("/:walletAddress", getCompanyByWallet);
companyRoutes.get("/:walletAddress/shoes", getShoesByCompany);
