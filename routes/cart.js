import express from 'express';
import { supabase } from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const SECRET = "segredo_super_secreto"; // o mesmo usado no users.js

// -----------------------------------------------
// Middleware para pegar user_id a partir do token
// -----------------------------------------------
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token ausente" });

  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, SECRET);
    req.user_id = user.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// ------------------------------
// Função: retorna ou cria carrinho
// ------------------------------
async function ensureCart(user_id) {
  const { data: existing } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle();

  if (existing) return existing;

  const { data: created } = await supabase
    .from('carts')
    .insert([{ user_id }])
    .select()
    .maybeSingle();

  return created;
}

// ------------------------------
// GET /cart (buscar carrinho)
// ------------------------------
router.get('/', auth, async (req, res) => {
  const user_id = req.user_id;

  const cart = await ensureCart(user_id);
  if (!cart) return res.status(500).json({ error: 'Erro ao obter carrinho' });

  const { data: items, error } = await supabase
    .from('cart_items')
    .select(`id, quantity, flower:flowers(id, name, price, image_url)`)
    .eq('cart_id', cart.id);

  if (error) return res.status(500).json({ error });

  res.json(items);
});

// ------------------------------
// POST /cart (adicionar item)
// body: { flower_id }
// ------------------------------
router.post('/', auth, async (req, res) => {
  const user_id = req.user_id;
  const { flower_id } = req.body;

  if (!flower_id) return res.status(400).json({ error: "flower_id obrigatorio" });

  const cart = await ensureCart(user_id);

  // verificar se item já existe
  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cart.id)
    .eq('flower_id', flower_id)
    .maybeSingle();

  if (existing) {
    // atualizar quantidade
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + 1 })
      .eq('id', existing.id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error });

    return res.json(data);
  }

  // caso seja novo item
  const { data, error } = await supabase
    .from('cart_items')
    .insert([{ cart_id: cart.id, flower_id, quantity: 1 }])
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error });

  res.status(201).json(data);
});

// ------------------------------
// DELETE /cart/:item_id
// Remove item do carrinho
// ------------------------------
router.delete('/:item_id', auth, async (req, res) => {
  const item_id = req.params.item_id;

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', item_id);

  if (error) return res.status(500).json({ error });

  res.json({ success: true });
});

// ------------------------------
// POST /purchase
// Finaliza compra
// ------------------------------
router.post('/purchase', auth, async (req, res) => {
  const user_id = req.user_id;

  const cart = await ensureCart(user_id);

  const { data: items, error } = await supabase
    .from('cart_items')
    .select('id, quantity, flower:flowers(id, price, stock)')
    .eq('cart_id', cart.id);

  if (error) return res.status(500).json({ error });

  if (items.length === 0)
    return res.status(400).json({ error: "Carrinho vazio" });

  let total = 0;

  // verificar estoque e calcular total
  for (const it of items) {
    if (it.quantity > it.flower.stock) {
      return res.status(400).json({
        error: `Estoque insuficiente para o produto ID ${it.flower.id}`
      });
    }
    total += it.quantity * it.flower.price;
  }

  // criar pedido
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert([{ user_id, total }])
    .select()
    .maybeSingle();

  if (orderErr) return res.status(500).json({ error: orderErr });

  // gravar order_items + atualizar estoque
  for (const it of items) {
    await supabase.from('order_items').insert([{
      order_id: order.id,
      flower_id: it.flower.id,
      quantity: it.quantity,
      price: it.flower.price
    }]);

    await supabase
      .from('flowers')
      .update({ stock: it.flower.stock - it.quantity })
      .eq('id', it.flower.id);
  }

  // limpar carrinho
  await supabase.from('cart_items').delete().eq('cart_id', cart.id);

  res.json({ order });
});

export default router;