import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import flowersRouter from './routes/flowers.js';
import usersRouter from './routes/users.js';
import cartRouter from './routes/cart.js';
import purchaseRouter from "./routes/purchase.js";

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// ================================
// ROTAS DA API SEM "/api"
// ================================
app.use('/flowers', flowersRouter);
app.use('/users', usersRouter);
app.use('/cart', cartRouter);
app.use("/purchase", purchaseRouter);

// ================================
// SERVE O FRONTEND
// ================================
app.use(express.static(path.join(__dirname, 'frontend')));

// fallback para QUALQUER rota desconhecida
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Floricultura API rodando na porta ${PORT}`)
);