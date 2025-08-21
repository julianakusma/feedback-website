import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFeedbackSchema } from "@shared/schema";
import { z } from "zod";
import express from "express";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Servir arquivos estáticos da pasta public
  const publicPath = path.resolve(process.cwd(), "public");
  app.use(express.static(publicPath));
  // API para buscar todos os feedbacks
  app.get("/api/feedbacks", async (req, res) => {
    try {
      const feedbacks = await storage.getFeedbacks();
      res.json(feedbacks);
    } catch (error) {
      console.error("Erro ao buscar feedbacks:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // API para criar um novo feedback
  app.post("/api/feedbacks", async (req, res) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      
      // Validar nota entre 1 e 5
      if (validatedData.nota < 1 || validatedData.nota > 5) {
        return res.status(400).json({ error: "Nota deve estar entre 1 e 5" });
      }

      const feedback = await storage.createFeedback(validatedData);
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      console.error("Erro ao criar feedback:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
