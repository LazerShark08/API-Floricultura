import express from 'express';
import { supabase } from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const SECRET = "segredo_super_secreto"; // mesmo segredo do cart.js

// ==========================
// REGISTRO COM NOME, EMAIL E SENHA
// ==========================
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });

  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password }])
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error });

  res.status(201).json({ message: 'Usuário criado!', user: data });
});

// ==========================
// LOGIN COM JWT REAL
// ==========================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .maybeSingle();

  if (error) return res.status(500).json({ error });
  if (!user) return res.status(404).json({ error: "Email ou senha inválidos" });

  // GERAR TOKEN JWT REAL
  const token = jwt.sign(
    { id: user.id, email: user.email },
    SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user });
});

// ==========================
// PEGAR USUÁRIO POR ID
// ==========================
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return res.status(500).json({ error });
  if (!data) return res.status(404).json({ error: 'Usuário não encontrado' });

  res.json(data);
});

export default router;