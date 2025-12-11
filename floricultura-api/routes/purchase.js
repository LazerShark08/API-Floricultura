import express from "express";
import { supabase } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const userId = req.body.userId || 1; // ajuste conforme seu sistema
    // *** Você pode trocar para o userId salvo no token futuramente ***

    // 1 — Buscar itens do carrinho
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("id, flower_id, quantity, flowers(price)")
      .eq("user_id", userId);

    if (cartError) return res.status(500).json({ error: cartError });
    if (cartItems.length === 0)
      return res.status(400).json({ error: "Carrinho vazio" });

    // 2 — Calcular total
    const total = cartItems.reduce(
      (sum, item) => sum + item.flowers.price * item.quantity,
      0
    );

    // 3 — Criar o pedido (tabela orders)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId,
          total
        }
      ])
      .select()
      .maybeSingle();

    if (orderError) return res.status(500).json({ error: orderError });

    // 4 — Criar os itens do pedido (order_items)
    const itemsToInsert = cartItems.map((item) => ({
      order_id: order.id,
      flower_id: item.flower_id,
      quantity: item.quantity,
      price: item.flowers.price
    }));

    const { error: oiError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (oiError) return res.status(500).json({ error: oiError });

    // 5 — Limpar carrinho
    await supabase.from("cart_items").delete().eq("user_id", userId);

    res.json({
      message: "Compra finalizada com sucesso!",
      order_id: order.id,
      total
    });
  } catch (err) {
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

export default router;