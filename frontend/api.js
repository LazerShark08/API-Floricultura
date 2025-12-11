const API = location.origin; // serve via same origin when frontend is hosted by the API

function saveUser(u){ localStorage.setItem('user', JSON.stringify(u)); }
function getUser(){ return JSON.parse(localStorage.getItem('user')); }

async function loadFlowers(){
  try {
    const res = await fetch(API + '/flowers');
    if(!res.ok) throw new Error('Erro ao buscar flores');
    const flowers = await res.json();
    const div = document.getElementById('flowers');
    if(!div) return;
    div.innerHTML = flowers.map(f=>`
      <div class="card">
        <img src="${f.image_url || 'images/placeholder.png'}" alt="${f.name}" />
        <h3>${f.name}</h3>
        <p class="price">R$ ${Number(f.price).toFixed(2)}</p>
        <p>${(f.description || '').slice(0,80)}${(f.description||'').length>80? '...':''}</p>
        <a class="btn" href="flower.html?id=${f.id}">Ver</a>
      </div>
    `).join('');
  } catch(e){
    console.error(e);
  }
}

async function loadFlowerDetails(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id) return document.getElementById('flower-details').innerHTML = '<p>ID inválido</p>';
  const res = await fetch(API + '/flowers/' + id);
  const f = await res.json();
  const container = document.getElementById('flower-details');
  container.innerHTML = `
    <div class="detail-card">
      <img src="${f.image_url || 'images/placeholder.png'}" alt="${f.name}" />
      <h2>${f.name}</h2>
      <p>${f.description || ''}</p>
      <p class="price">R$ ${Number(f.price).toFixed(2)}</p>
      <div class="clear"></div>
      <button class="btn" onclick="addToCart(${f.id})">Adicionar ao carrinho</button>
    </div>
  `;
}

async function register(){
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  if(!name || !email) return alert('Preencha nome e email');
  const res = await fetch(API+'/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email})});
  const user = await res.json();
  saveUser(user);
  alert('Cadastro ok!');
  location.href = 'index.html';
}

async function login(){
  const email = document.getElementById('login-email').value;
  if(!email) return alert('Digite o email');
  const res = await fetch(API + '/users/login', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email})});
  if(res.status===404) return alert('Usuário não encontrado');
  const user = await res.json();
  saveUser(user);
  alert('Login ok!');
  location.href = 'index.html';
}

async function addToCart(flower_id){
  const user = getUser();
  if(!user) return alert('Faça login para adicionar ao carrinho');
  const res = await fetch(API + '/cart/' + user.id + '/items', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({flower_id, quantity:1})});
  if(!res.ok) return alert('Erro ao adicionar');
  alert('Adicionado!');
}

async function loadCart(){
  const user = getUser();
  const container = document.getElementById('cart');
  if(!user) return container.innerHTML = '<p>Faça login para ver o carrinho</p>';
  const res = await fetch(API + '/cart/' + user.id);
  const cart = await res.json();
  if(!cart.items || cart.items.length===0) return container.innerHTML = '<p>Carrinho vazio</p>';
  container.innerHTML = cart.items.map(i=>`
    <div class="cart-item">
      <img src="${i.flower.image_url || 'images/placeholder.png'}" alt="${i.flower.name}" />
      <div>
        <strong>${i.flower.name}</strong>
        <div>Quantidade: ${i.quantity}</div>
        <div>Preço un: R$ ${Number(i.flower.price).toFixed(2)}</div>
      </div>
    </div>
  `).join('');
}

async function checkout(){
  const user = getUser();
  if(!user) return alert('Faça login');
  const res = await fetch(API + '/cart/' + user.id + '/checkout', {method:'POST'});
  if(!res.ok) {
    const err = await res.json().catch(()=>({error:'Erro'}));
    return alert('Erro: ' + (err.error || JSON.stringify(err)));
  }
  alert('Compra finalizada!');
  location.href = 'index.html';
}