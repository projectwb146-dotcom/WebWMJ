  // ---------- DATA ----------
  // Untuk memasang foto menu, isi properti "image" dengan path/URL gambarnya.
  // Contoh: image: 'images/pangsit-chili-oil.jpg'  atau  image: 'https://...jpg'
  // Biarkan image: '' jika foto belum ada — otomatis tampil placeholder "Slot Foto".
  // Pengunjung TIDAK bisa mengubah foto ini dari halaman; hanya bisa diedit lewat kode.
  const MENU = [
    {id:'pangsit', cat:'makanan', name:'Pangsit Chili Oil', price:10000, desc:'Pangsit garing disiram chili oil pedas gurih.', image:'pangsit.jpg'},
    {id:'jebew', cat:'makanan', name:'Mie Jebew', price:10000, desc:'Mie kenyal berbumbu pedas nampol.', image:'mi jebew.jpg'},
    {id:'basreng', cat:'makanan', name:'Basreng Chili Oil', price:5000, desc:'Basreng renyah berbalut chili oil, camilan pedas.', image:'basreng.jpg'},
    {id:'kopi', cat:'minuman', name:'Kopi', price:5000, desc:'Kopi hitam sederhana, teman pas buat nemenin jajan.', image:'kopi.jpg'},
    {id:'esjelly', cat:'minuman', name:'Es Jelly', price:5000, desc:'Es segar dengan jelly kenyal manis, adem di siang hari.', image:'esjelly.jpg'},
    {id:'escreamy', cat:'minuman', name:'Es Creamy', price:7000, desc:'Es creamy lembut dengan rasa manis yang pas.', image:'escream.jpg'},
    {id:'estehpoci', cat:'minuman', name:'Es Teh Poci', price:5000, desc:'Es teh manis poci, menyegarkan tanpa basa-basi.', image:'poci.jpg'},
    {id:'magicwater', cat:'minuman', name:'Magic Water', price:3000, desc:'Minuman seger dan bikin penasaran.', image:'magicwater.jpg'},
  ];

  const rupiah = n => 'Rp' + n.toLocaleString('id-ID');

  // ---------- STATE ----------
  let activeCat = 'makanan';
  let cart = {}; // {id: qty}

  // ---------- RENDER MENU ----------
  const grid = document.getElementById('menuGrid');

  function cameraIconSVG(){
    return `<svg class="ph-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
  }

  // Placeholder tersedia secara global agar bisa dipanggil dari atribut onerror gambar.
  function phPlaceholderHTML(){
    return `<div class="ph-placeholder">${cameraIconSVG()}<div class="ph-text">Slot Foto</div><div class="ph-sub">Menunggu foto menu</div></div>`;
  }

  function photoSlotMarkup(item){
    if(item.image){
      // Gambar diatur lewat kode (img src) — pengunjung tidak bisa mengubahnya dari halaman.
      // Jika file gambar tidak ditemukan, otomatis kembali ke tampilan placeholder.
      return `<img src="${item.image}" alt="${item.name}" class="ph-img" onerror="this.outerHTML = phPlaceholderHTML();">`;
    }
    return phPlaceholderHTML();
  }

  function renderMenu(){
    grid.innerHTML = '';
    MENU.filter(item => item.cat === activeCat).forEach(item => {
      const qty = cart[item.id] || 0;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="photo-slot ${item.image ? 'has-img' : ''}" data-id="${item.id}">
          ${photoSlotMarkup(item)}
        </div>
        <div class="card-body">
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
        </div>
        <div class="card-foot">
          <span class="price">${rupiah(item.price)}</span>
          <div class="qty-add">
            <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Kurangi jumlah">−</button>
            <span class="qty-num" id="qty-${item.id}">${qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Tambah jumlah">+</button>
          </div>
        </div>
        <button class="add-btn" data-id="${item.id}">+ Tambah ke keranjang</button>
      `;
      grid.appendChild(card);
    });
    bindCardEvents();
  }

  function bindCardEvents(){
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const current = cart[id] || 0;
        const next = btn.dataset.action === 'inc' ? current + 1 : Math.max(0, current - 1);
        cart[id] = next;
        document.getElementById(`qty-${id}`).textContent = next;
        if(next > 0 && current === 0) updateCartUI(true);
      });
    });

    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const q = cart[id] || 0;
        cart[id] = q === 0 ? 1 : q;
        document.getElementById(`qty-${id}`).textContent = cart[id];
        updateCartUI(true);
      });
    });
  }

  // ---------- TABS ----------
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCat = tab.dataset.cat;
      renderMenu();
    });
  });

  // ---------- CART LOGIC ----------
  const navCartBtn = document.getElementById('navCartBtn');
  const fabCart = document.getElementById('fabCart');
  const fabCount = document.getElementById('fabCount');
  const fabTotal = document.getElementById('fabTotal');
  const cartBadge = document.getElementById('cartBadge');
  const backdrop = document.getElementById('backdrop');
  const drawer = document.getElementById('drawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBody = document.getElementById('drawerBody');
  const summaryWrap = document.getElementById('summaryWrap');
  const sumSubtotal = document.getElementById('sumSubtotal');
  const sumTotal = document.getElementById('sumTotal');

  function cartItems(){
    return Object.entries(cart)
      .filter(([id, qty]) => qty > 0)
      .map(([id, qty]) => ({...MENU.find(m => m.id === id), qty}));
  }

  function updateCartUI(bump){
    const items = cartItems();
    const totalQty = items.reduce((s,i) => s + i.qty, 0);
    const totalPrice = items.reduce((s,i) => s + i.qty * i.price, 0);

    cartBadge.textContent = totalQty;
    cartBadge.classList.toggle('show', totalQty > 0);
    fabCart.classList.toggle('show', totalQty > 0);
    fabCount.textContent = `${totalQty} item`;
    fabTotal.textContent = rupiah(totalPrice);

    if(bump){
      navCartBtn.classList.remove('bump'); void navCartBtn.offsetWidth; navCartBtn.classList.add('bump');
    }

    // drawer content
    if(items.length === 0){
      drawerBody.innerHTML = `
        <div class="empty-cart">
          <svg class="em-icon" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <p>Keranjang masih kosong.<br>Yuk pilih jajanan favoritmu dulu!</p>
        </div>`;
      summaryWrap.style.display = 'none';
    } else {
      summaryWrap.style.display = 'block';
      drawerBody.innerHTML = items.map(i => `
        <div class="nota-item">
          <div class="ni-info">
            <div class="ni-name">${i.name}</div>
            <div class="ni-price">${i.qty} x ${rupiah(i.price)}</div>
          </div>
          <div class="ni-qty">
            <button class="qty-btn" data-action="dec" data-id="${i.id}" aria-label="Kurangi">−</button>
            <span class="qty-num">${i.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${i.id}" aria-label="Tambah">+</button>
          </div>
          <div class="ni-sub">${rupiah(i.qty * i.price)}</div>
        </div>
      `).join('');

      drawerBody.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const current = cart[id] || 0;
          cart[id] = btn.dataset.action === 'inc' ? current + 1 : Math.max(0, current - 1);
          const gridQty = document.getElementById(`qty-${id}`);
          if(gridQty) gridQty.textContent = cart[id];
          updateCartUI(false);
        });
      });

      sumSubtotal.textContent = rupiah(totalPrice);
      sumTotal.textContent = rupiah(totalPrice);
    }
  }

  function openDrawer(){
    backdrop.classList.add('show');
    drawer.classList.add('show');
  }
  function closeDrawer(){
    backdrop.classList.remove('show');
    drawer.classList.remove('show');
  }
  navCartBtn.addEventListener('click', openDrawer);
  fabCart.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  // ---------- WHATSAPP ORDER ----------
  document.getElementById('waOrderBtn').addEventListener('click', () => {
    const items = cartItems();
    if(items.length === 0) return;
    const totalPrice = items.reduce((s,i) => s + i.qty * i.price, 0);
    let msg = 'Halo Kedai Mama Jhuldan, saya mau pesan:\n\n';
    items.forEach(i => {
      msg += `- ${i.qty}x ${i.name} = ${rupiah(i.qty * i.price)}\n`;
    });
    msg += `\nTotal: ${rupiah(totalPrice)}\n\nMohon info untuk konfirmasi pesanan ini, terima kasih 🙏`;
    const phone = '6285960168210';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  });

  // ---------- INIT ----------
  renderMenu();
  updateCartUI(false);
