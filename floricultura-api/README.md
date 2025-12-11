# Floricultura API (Node.js + Supabase)

API REST simples para uma floricultura — listar flores, gerenciar carrinho e finalizar compra.

## Funcionalidades incluídas
- Listar / criar / atualizar / remover flores.
- Criar usuário.
- Gerenciar carrinho (adicionar item, listar, remover).
- Finalizar compra (checkout): gera pedido e limpa o carrinho.

## Estrutura de tabelas (Supabase / PostgreSQL)
Veja `sql/create_tables.sql` para as instruções de criação das tabelas:
- users
- flowers
- carts
- cart_items
- orders
- order_items

## Como usar (local)
1. Copie `.env.example` para `.env` e preencha:
   - SUPABASE_URL
   - SUPABASE_KEY

2. Instale dependências:
   ```
   npm install
   ```

3. Rode a API:
   ```
   npm run dev
   ```
   ou
   ```
   npm start
   ```

## Endpoints principais
- `GET /flowers` — lista flores
- `GET /flowers/:id` — busca flor
- `POST /flowers` — cria flor (ex: admin)
- `POST /users` — cria usuário
- `GET /cart/:user_id` — obtém carrinho do usuário
- `POST /cart/:user_id/items` — adiciona item ao carrinho `{ "flower_id": 1, "quantity": 2 }`
- `POST /cart/:user_id/checkout` — finaliza compra (cria order e limpa o carrinho)

## Observações
- Este projeto usa Supabase como banco (Postgres). Ajuste regras e políticas no painel Supabase conforme desejado.
- Autenticação não foi implementada (para simplificar). Em produção, use Supabase Auth e validação/headers.