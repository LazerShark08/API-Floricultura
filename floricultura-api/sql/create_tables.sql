-- SQL para criar as tabelas necessárias no Supabase (Postgres)

-- users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- flowers (produtos)
CREATE TABLE IF NOT EXISTS flowers (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  stock integer DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- carts (um carrinho por usuário)
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- cart_items
CREATE TABLE IF NOT EXISTS cart_items (
  id serial PRIMARY KEY,
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE,
  flower_id integer REFERENCES flowers(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  added_at timestamptz DEFAULT now()
);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  total numeric(12,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- order_items
CREATE TABLE IF NOT EXISTS order_items (
  id serial PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  flower_id integer REFERENCES flowers(id),
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL
);
