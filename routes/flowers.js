import express from 'express';
import { supabase } from '../db.js';
const router = express.Router();

// List all flowers
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('flowers').select('*').order('id', { ascending: true });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Get single flower
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabase.from('flowers').select('*').eq('id', id).maybeSingle();
  if (error) return res.status(500).json({ error });
  if (!data) return res.status(404).json({ error: 'Flor não encontrada' });
  res.json(data);
});

// Create flower (admin)
router.post('/', async (req, res) => {
  const { name, description, price, stock, image_url } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'name e price são obrigatórios' });
  const { data, error } = await supabase.from('flowers').insert([{ name, description, price, stock: stock || 0, image_url }]).select().single();
  if (error) return res.status(500).json({ error });
  res.status(201).json(data);
});

// Update flower
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabase.from('flowers').update(updates).eq('id', id).select().maybeSingle();
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Delete flower
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const { error } = await supabase.from('flowers').delete().eq('id', id);
  if (error) return res.status(500).json({ error });
  res.json({ success: true });
});

export default router;