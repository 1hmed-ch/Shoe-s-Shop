/**
 * AURA LABS // KINETIC FOOTWEAR
 * Advanced Interactive Engine & Animation System
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  const state = {
    soundEnabled: false,
    activeColorway: 'cyber',
    wishlist: new Set(),
    cart: [
      {
        id: 'cart-init-1',
        shoeId: 'shoe-1',
        name: 'AURA Cyber-01 Vapor',
        price: 249,
        size: 9,
        color: 'Cyber Neon',
        img: 'images/hero_sneaker_cyber.jpg',
        quantity: 1
      }
    ],
    appliedPromo: null,
    discountAmount: 0,
    shippingThreshold: 150
  };

  // Product Database for Search & Modals
  const productsDB = [
    {
      id: 'shoe-1',
      name: 'AURA Cyber-01 Vapor',
      category: 'Kinetic Speed / Limited',
      price: 249,
      oldPrice: 310,
      img: 'images/hero_sneaker_cyber.jpg',
      badge: 'HOT DROP',
      desc: 'Dual nitrogen chamber midsole with hyper-reactive carbon plate. Engineered for boundary-breaking pace.',
      specs: { energy: '89%', weight: '235g', drop: '8mm' }
    },
    {
      id: 'shoe-2',
      name: 'AURA Solar Ember X',
      category: 'Marathon Sprint',
      price: 265,
      oldPrice: 330,
      img: 'images/sneaker_solar_fire.jpg',
      badge: 'EXPLOSIVE REBOUND',
      desc: 'Thermodynamic weave with volcanic ember traction grip. Designed for long-distance race days.',
      specs: { energy: '92%', weight: '242g', drop: '6mm' }
    },
    {
      id: 'shoe-3',
      name: 'Obsidian Nexus 77',
      category: 'Stealth Cyber Track',
      price: 279,
      oldPrice: 350,
      img: 'images/sneaker_obsidian_lime.jpg',
      badge: 'STEALTH RUNNER',
      desc: 'Matte carbon armor chassis with neon bio-glow accents. Uncompromising nocturnal street dominance.',
      specs: { energy: '86%', weight: '255g', drop: '10mm' }
    },
    {
      id: 'shoe-4',
      name: 'AURA Ghost Velocity',
      category: 'Track Precision',
      price: 220,
      oldPrice: 275,
      img: 'images/hero_sneaker_cyber.jpg',
      badge: 'FEATHERWEIGHT',
      desc: 'Sub-200g racing chassis with high-frequency shock absorber.',
      specs: { energy: '88%', weight: '198g', drop: '4mm' }
    },
    {
      id: 'shoe-5',
      name: 'Solar Drift Carbon',
      category: 'Aerospace Carbon',
      price: 285,
      oldPrice: 360,
      img: 'images/sneaker_solar_fire.jpg',
      badge: 'ULTRA RARE',
      desc: 'Gold-threaded thermal mesh infused with aero-kinetic dynamics.',
      specs: { energy: '94%', weight: '228g', drop: '8mm' }
    },
    {
      id: 'shoe-6',
      name: 'Obsidian Cyber High',
      category: 'Streetwear Tech',
      price: 259,
      oldPrice: 320,
      img: 'images/sneaker_obsidian_lime.jpg',
      badge: 'POPULAR',
      desc: 'Ankle-lock ergonomic support for high-impact urban environments.',
      specs: { energy: '84%', weight: '280g', drop: '10mm' }
    }
  ];

  // =========================================================================
  // AUDIO SYNTHESIZER (WEB AUDIO API)
  // =========================================================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  function playCyberChime() {
    if (!state.soundEnabled) return;
    playTone(523.25, 'triangle', 0.12, 0.04);
    setTimeout(() => playTone(659.25, 'triangle', 0.12, 0.04), 60);
    setTimeout(() => playTone(783.99, 'sine', 0.18, 0.05), 120);
  }

  function playCartAddSound() {
    if (!state.soundEnabled) return;
    playTone(330, 'sine', 0.08, 0.05);
    setTimeout(() => playTone(880, 'triangle', 0.15, 0.06), 70);
  }

  // Audio Toggle UI
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundOnIcon = soundToggleBtn ? soundToggleBtn.querySelector('.icon-sound-on') : null;
  const soundOffIcon = soundToggleBtn ? soundToggleBtn.querySelector('.icon-sound-off') : null;

  if (soundToggleBtn) {
    // Start with sound off icon visible
    if (soundOnIcon) soundOnIcon.classList.add('hide');
    if (soundOffIcon) soundOffIcon.classList.remove('hide');

    soundToggleBtn.addEventListener('click', () => {
      initAudio();
      state.soundEnabled = !state.soundEnabled;
      if (state.soundEnabled) {
        if (soundOnIcon) soundOnIcon.classList.remove('hide');
        if (soundOffIcon) soundOffIcon.classList.add('hide');
        playCyberChime();
        showToast('🔊 Audio FX enabled', 'info');
      } else {
        if (soundOnIcon) soundOnIcon.classList.add('hide');
        if (soundOffIcon) soundOffIcon.classList.remove('hide');
        showToast('🔇 Audio FX muted', 'info');
      }
    });
  }

  // =========================================================================
  // TOAST NOTIFICATION SYSTEM
  // =========================================================================
  const toastStack = document.getElementById('toast-stack');

  function showToast(message, type = 'success') {
    if (!toastStack) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    if (type === 'heart') {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="color: #ff007f;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastStack.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-remove');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // =========================================================================
  // SMOOTH CURSOR FOLLOWER & BACKGROUND CANVAS PARTICLES
  // =========================================================================
  const cursorGlow = document.getElementById('cursor-glow');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderCursorGlow() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    if (cursorGlow) {
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top = `${glowY}px`;
    }
    requestAnimationFrame(renderCursorGlow);
  }
  requestAnimationFrame(renderCursorGlow);

  // Canvas Ambient Floating Cyber Particles
  const canvas = document.getElementById('ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 42;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 254, ${p.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // =========================================================================
  // 3D INTERACTIVE SHOE TILT PERSPECTIVE
  // =========================================================================
  const tiltBox = document.getElementById('shoe-tilt-box');
  const heroStage = document.getElementById('hero-stage');
  const heroShoeImg = document.getElementById('hero-shoe-img');

  if (heroStage && tiltBox) {
    let bounds;

    const onMouseEnter = () => {
      bounds = heroStage.getBoundingClientRect();
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = heroStage.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const xPct = mouseX / bounds.width - 0.5;
      const yPct = mouseY / bounds.height - 0.5;

      const rotateY = xPct * 24; // tilt around Y axis
      const rotateX = -yPct * 24; // tilt around X axis

      tiltBox.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    };

    const onMouseLeave = () => {
      tiltBox.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    heroStage.addEventListener('mouseenter', onMouseEnter);
    heroStage.addEventListener('mousemove', onMouseMove);
    heroStage.addEventListener('mouseleave', onMouseLeave);
  }

  // =========================================================================
  // HERO COLORWAY SWITCHER
  // =========================================================================
  const colorwayButtons = document.querySelectorAll('.colorway-btn');
  const heroShoeTitle = document.getElementById('hero-shoe-title');
  const heroPrice = document.getElementById('hero-price');
  const shoeAuraRing = document.getElementById('shoe-aura-ring');

  const colorwayThemes = {
    cyber: {
      glow: '#00f2fe',
      alpha: 'rgba(0, 242, 254, 0.35)',
      title: 'AURA CYBER-01',
      price: '$249',
      img: 'images/hero_sneaker_cyber.jpg'
    },
    solar: {
      glow: '#ff5e62',
      alpha: 'rgba(255, 94, 98, 0.4)',
      title: 'SOLAR EMBER X',
      price: '$265',
      img: 'images/sneaker_solar_fire.jpg'
    },
    obsidian: {
      glow: '#a3e635',
      alpha: 'rgba(163, 230, 53, 0.35)',
      title: 'OBSIDIAN NEXUS',
      price: '$279',
      img: 'images/sneaker_obsidian_lime.jpg'
    }
  };

  colorwayButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      const theme = colorwayThemes[color];
      if (!theme) return;

      playTone(580, 'sine', 0.08);

      colorwayButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Update CSS Variables dynamically
      document.documentElement.style.setProperty('--active-glow', theme.glow);
      document.documentElement.style.setProperty('--active-glow-alpha', theme.alpha);

      // Smooth shoe crossfade
      if (heroShoeImg) {
        heroShoeImg.classList.add('fade-out');
        setTimeout(() => {
          heroShoeImg.src = theme.img;
          heroShoeImg.alt = theme.title;
          heroShoeImg.classList.remove('fade-out');
        }, 220);
      }

      // Update text
      if (heroShoeTitle) heroShoeTitle.textContent = theme.title;
      if (heroPrice) heroPrice.textContent = theme.price;

      state.activeColorway = color;
      showToast(`Selected Colorway: ${theme.title}`, 'info');
    });
  });

  // Hero Quick Buy Button
  const heroBuyBtn = document.getElementById('hero-buy-btn');
  if (heroBuyBtn) {
    heroBuyBtn.addEventListener('click', () => {
      const currentTheme = colorwayThemes[state.activeColorway];
      addToCart({
        shoeId: state.activeColorway === 'cyber' ? 'shoe-1' : state.activeColorway === 'solar' ? 'shoe-2' : 'shoe-3',
        name: currentTheme.title,
        price: parseInt(currentTheme.price.replace('$', '')),
        size: 9,
        color: currentTheme.title,
        img: currentTheme.img
      });
      openCartDrawer();
    });
  }

  // Hero Scroll to Tech Breakdown
  const heroExploreTech = document.getElementById('hero-explore-tech');
  if (heroExploreTech) {
    heroExploreTech.addEventListener('click', () => {
      const target = document.getElementById('innovation');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // =========================================================================
  // NAVBAR SCROLL & ACTIVE LINK STATE
  // =========================================================================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Menu Drawer
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('active');
    });
  }
  if (mobileDrawerClose && mobileDrawer) {
    mobileDrawerClose.addEventListener('click', () => {
      mobileDrawer.classList.remove('active');
    });
  }
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (mobileDrawer) mobileDrawer.classList.remove('active');
    });
  });

  // =========================================================================
  // CATALOG FILTER SYSTEM
  // =========================================================================
  const filterChips = document.querySelectorAll('.filter-chip');
  const productCards = document.querySelectorAll('.product-card');

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      playTone(480, 'sine', 0.05);
      filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      const filterVal = chip.getAttribute('data-filter');

      productCards.forEach((card) => {
        const categories = card.getAttribute('data-category') || '';
        if (filterVal === 'all' || categories.includes(filterVal)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.transition = 'all 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Card Size Chip Selection
  document.querySelectorAll('.size-chips').forEach((chipGroup) => {
    chipGroup.addEventListener('click', (e) => {
      const clicked = e.target.closest('.size-chip');
      if (!clicked) return;
      playTone(600, 'sine', 0.04);
      chipGroup.querySelectorAll('.size-chip').forEach((c) => c.classList.remove('active'));
      clicked.classList.add('active');
    });
  });

  // Wishlist Toggle
  const wishlistCountBadge = document.getElementById('wishlist-count');
  const wishlistTrigger = document.getElementById('wishlist-trigger');

  document.querySelectorAll('.card-wishlist-toggle').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const shoeId = btn.getAttribute('data-id');
      const card = btn.closest('.product-card');
      const shoeName = card ? card.querySelector('.card-title').textContent : 'Sneaker';

      if (state.wishlist.has(shoeId)) {
        state.wishlist.delete(shoeId);
        btn.classList.remove('active');
        showToast(`Removed ${shoeName} from Wishlist`, 'info');
      } else {
        state.wishlist.add(shoeId);
        btn.classList.add('active');
        playTone(720, 'triangle', 0.1, 0.05);
        showToast(`Saved ${shoeName} to Wishlist!`, 'heart');
      }

      if (wishlistCountBadge) {
        wishlistCountBadge.textContent = state.wishlist.size;
        wishlistCountBadge.style.transform = 'scale(1.3)';
        setTimeout(() => (wishlistCountBadge.style.transform = 'scale(1)'), 200);
      }
    });
  });

  if (wishlistTrigger) {
    wishlistTrigger.addEventListener('click', () => {
      if (state.wishlist.size === 0) {
        showToast('Your Wishlist is currently empty! Heart a pair to save.', 'info');
      } else {
        showToast(`You have ${state.wishlist.size} saved kinetic silhouette(s).`, 'info');
      }
    });
  }

  // Add To Cart from Card
  document.querySelectorAll('.btn-add-cart').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.product-card');
      if (!card) return;

      const shoeId = card.getAttribute('data-id');
      const name = card.getAttribute('data-name');
      const price = parseFloat(card.getAttribute('data-price'));
      const img = card.getAttribute('data-img');
      const activeSizeBtn = card.querySelector('.size-chip.active');
      const size = activeSizeBtn ? activeSizeBtn.getAttribute('data-size') : '9';

      addToCart({
        shoeId,
        name,
        price,
        size,
        color: 'Signature',
        img
      });

      // Quick visual feedback on button
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>Added ✓</span>';
      btn.style.background = 'var(--neon-lime)';
      btn.style.color = '#000';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 1200);

      openCartDrawer();
    });
  });

  // =========================================================================
  // SHOPPING CART DRAWER LOGIC
  // =========================================================================
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartTrigger = document.getElementById('cart-trigger');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartCountBadge = document.getElementById('cart-count');
  const cartItemsTotal = document.getElementById('cart-items-total');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTotalEl = document.getElementById('cart-total');
  const discountRow = document.getElementById('discount-row');
  const cartDiscountEl = document.getElementById('cart-discount');
  const shippingProgressBar = document.getElementById('shipping-progress-bar');
  const shippingRemainingEl = document.getElementById('shipping-remaining');
  const shippingStatusMsg = document.getElementById('shipping-status-msg');

  function openCartDrawer() {
    if (cartDrawer) cartDrawer.classList.add('active');
    if (cartBackdrop) cartBackdrop.classList.add('active');
  }

  function closeCartDrawer() {
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (cartBackdrop) cartBackdrop.classList.remove('active');
  }

  if (cartTrigger) cartTrigger.addEventListener('click', openCartDrawer);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);

  function addToCart(item) {
    playCartAddSound();
    const existing = state.cart.find(
      (c) => c.shoeId === item.shoeId && c.size === item.size && c.color === item.color
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({
        id: `cart-${Date.now()}`,
        shoeId: item.shoeId,
        name: item.name,
        price: item.price,
        size: item.size,
        color: item.color,
        img: item.img,
        quantity: 1
      });
    }

    renderCart();
    showToast(`Added ${item.name} (US ${item.size}) to Vault`, 'success');
  }

  function renderCart() {
    if (!cartItemsList) return;

    const totalCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartCountBadge) cartCountBadge.textContent = totalCount;
    if (cartItemsTotal) cartItemsTotal.textContent = `(${totalCount} ${totalCount === 1 ? 'item' : 'items'})`;

    if (state.cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 50px; height: 50px; color: var(--text-dim);">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <p>Your Kinetic Vault is empty.</p>
          <button class="btn btn-secondary" onclick="document.getElementById('cart-drawer').classList.remove('active'); document.getElementById('cart-backdrop').classList.remove('active');">
            Explore Releases
          </button>
        </div>
      `;
    } else {
      cartItemsList.innerHTML = state.cart
        .map(
          (item) => `
        <div class="cart-item" data-cart-id="${item.id}">
          <div class="cart-item-thumb">
            <img src="${item.img}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <span class="cart-item-title">${item.name}</span>
            <span class="cart-item-variant">Size: US ${item.size} • ${item.color}</span>
            <span class="cart-item-price">$${item.price}</span>
            <div class="cart-qty-controls">
              <button class="qty-btn btn-qty-dec" data-id="${item.id}">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn btn-qty-inc" data-id="${item.id}">+</button>
            </div>
          </div>
          <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">&times;</button>
        </div>
      `
        )
        .join('');
    }

    // Calculate totals
    const subtotal = state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let discount = 0;

    if (state.appliedPromo === 'AURA20') {
      discount = subtotal * 0.2;
    } else if (state.appliedPromo === 'VIP-DROP20') {
      discount = Math.min(20, subtotal);
    }

    const total = Math.max(0, subtotal - discount);

    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.textContent = `$${total.toFixed(2)}`;

    if (discount > 0 && discountRow && cartDiscountEl) {
      discountRow.style.display = 'flex';
      cartDiscountEl.textContent = `-$${discount.toFixed(2)}`;
    } else if (discountRow) {
      discountRow.style.display = 'none';
    }

    // Shipping progress
    if (shippingProgressBar && shippingRemainingEl && shippingStatusMsg) {
      const remaining = Math.max(0, state.shippingThreshold - subtotal);
      if (remaining <= 0) {
        shippingProgressBar.style.width = '100%';
        shippingStatusMsg.innerHTML = '🎉 You unlocked <strong>Free Express Worldwide Shipping!</strong>';
      } else {
        const pct = Math.min(100, (subtotal / state.shippingThreshold) * 100);
        shippingProgressBar.style.width = `${pct}%`;
        shippingStatusMsg.innerHTML = `You are <strong id="shipping-remaining">$${remaining.toFixed(2)}</strong> away from Free Express Shipping!`;
      }
    }
  }

  // Cart Qty & Removal delegation
  if (cartItemsList) {
    cartItemsList.addEventListener('click', (e) => {
      const incBtn = e.target.closest('.btn-qty-inc');
      const decBtn = e.target.closest('.btn-qty-dec');
      const removeBtn = e.target.closest('.cart-item-remove');

      if (incBtn) {
        const id = incBtn.getAttribute('data-id');
        const item = state.cart.find((c) => c.id === id);
        if (item) {
          item.quantity += 1;
          playTone(550, 'sine', 0.04);
          renderCart();
        }
      } else if (decBtn) {
        const id = decBtn.getAttribute('data-id');
        const item = state.cart.find((c) => c.id === id);
        if (item) {
          if (item.quantity > 1) {
            item.quantity -= 1;
            playTone(450, 'sine', 0.04);
          } else {
            state.cart = state.cart.filter((c) => c.id !== id);
          }
          renderCart();
        }
      } else if (removeBtn) {
        const id = removeBtn.getAttribute('data-id');
        state.cart = state.cart.filter((c) => c.id !== id);
        playTone(380, 'sawtooth', 0.06);
        renderCart();
        showToast('Item removed from Vault', 'info');
      }
    });
  }

  // Promo Code Handler
  const promoInput = document.getElementById('promo-input');
  const promoApplyBtn = document.getElementById('promo-apply-btn');
  const promoMsg = document.getElementById('promo-msg');

  if (promoApplyBtn && promoInput && promoMsg) {
    promoApplyBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'AURA20') {
        state.appliedPromo = 'AURA20';
        promoMsg.className = 'promo-msg success';
        promoMsg.textContent = '✓ 20% discount applied to your order!';
        playCyberChime();
        renderCart();
      } else if (code === 'VIP-DROP20') {
        state.appliedPromo = 'VIP-DROP20';
        promoMsg.className = 'promo-msg success';
        promoMsg.textContent = '✓ $20 VIP drop credit applied!';
        playCyberChime();
        renderCart();
      } else {
        promoMsg.className = 'promo-msg error';
        promoMsg.textContent = 'Invalid promo code. Try AURA20';
      }
    });
  }

  // Checkout Button & Order Simulation
  const btnCheckout = document.getElementById('btn-checkout');
  const orderSuccessModal = document.getElementById('order-success-modal');
  const btnCloseSuccess = document.getElementById('btn-close-success');

  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Your Vault is empty! Add a shoe first.', 'error');
        return;
      }
      playCyberChime();
      closeCartDrawer();
      if (orderSuccessModal) orderSuccessModal.classList.add('active');
    });
  }

  if (btnCloseSuccess && orderSuccessModal) {
    btnCloseSuccess.addEventListener('click', () => {
      orderSuccessModal.classList.remove('active');
      state.cart = [];
      renderCart();
      showToast('Thank you for choosing AURA LABS.', 'success');
    });
  }

  // Initial render of cart
  renderCart();

  // =========================================================================
  // CUSTOMIZER STUDIO LAB
  // =========================================================================
  const accentSwatches = document.querySelectorAll('.custom-swatch-btn');
  const customizerImg = document.getElementById('customizer-img');
  const customGlowHalo = document.getElementById('custom-glow-halo');
  const customStatusText = document.getElementById('custom-status-text');
  const soleChoices = document.querySelectorAll('.style-choice-btn');
  const engravingInput = document.getElementById('engraving-input');
  const engravingBadge = document.getElementById('engraving-badge');
  const btnAddCustom = document.getElementById('btn-add-custom');

  let currentCustomStyle = {
    colorName: 'Cyber Cyan',
    glowColor: '#00f2fe',
    filterVal: 'hue-rotate(0deg)',
    soleFinish: 'Translucent Glow',
    engraving: 'AURA-X',
    price: 289
  };

  accentSwatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      playTone(620, 'triangle', 0.08);
      accentSwatches.forEach((s) => s.classList.remove('active'));
      swatch.classList.add('active');

      const color = swatch.getAttribute('data-color');
      const filter = swatch.getAttribute('data-filter');
      const name = swatch.getAttribute('data-name');

      currentCustomStyle.colorName = name;
      currentCustomStyle.glowColor = color;
      currentCustomStyle.filterVal = filter;

      if (customizerImg) customizerImg.style.filter = filter;
      if (customGlowHalo) customGlowHalo.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
      if (customStatusText) customStatusText.textContent = `LIVE CONFIG // ACCENT: ${name.toUpperCase()}`;
    });
  });

  soleChoices.forEach((btn) => {
    btn.addEventListener('click', () => {
      playTone(500, 'sine', 0.05);
      soleChoices.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCustomStyle.soleFinish = btn.getAttribute('data-finish');
    });
  });

  if (engravingInput && engravingBadge) {
    engravingInput.addEventListener('input', (e) => {
      const val = e.target.value.toUpperCase().slice(0, 6) || 'AURA';
      engravingBadge.textContent = val;
      currentCustomStyle.engraving = val;
    });
  }

  if (btnAddCustom) {
    btnAddCustom.addEventListener('click', () => {
      addToCart({
        shoeId: `custom-${Date.now()}`,
        name: `AURA Custom (${currentCustomStyle.engraving})`,
        price: currentCustomStyle.price,
        size: 10,
        color: `${currentCustomStyle.colorName} • ${currentCustomStyle.soleFinish}`,
        img: 'images/hero_sneaker_cyber.jpg'
      });
      openCartDrawer();
      showToast('Custom Pair successfully transferred to Vault!', 'success');
    });
  }

  // =========================================================================
  // QUICK VIEW MODAL
  // =========================================================================
  const quickviewModal = document.getElementById('quickview-modal');
  const quickviewBackdrop = document.getElementById('quickview-backdrop');
  const quickviewCloseBtn = document.getElementById('quickview-close-btn');
  const quickviewContent = document.getElementById('quickview-content');

  function openQuickView(product) {
    if (!quickviewContent) return;
    playTone(500, 'sine', 0.08);

    quickviewContent.innerHTML = `
      <div class="quickview-layout">
        <div class="quickview-gallery">
          <img src="${product.img}" alt="${product.name}" id="qv-main-img">
        </div>
        <div class="quickview-details">
          <div class="badge-tag">${product.badge}</div>
          <h2 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;">${product.name}</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6;">${product.desc}</p>
          
          <div style="display: flex; gap: 1.5rem; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div><span style="font-size: 0.7rem; color: var(--text-dim); display: block;">ENERGY RETURN</span><strong>${product.specs.energy}</strong></div>
            <div><span style="font-size: 0.7rem; color: var(--text-dim); display: block;">WEIGHT</span><strong>${product.specs.weight}</strong></div>
            <div><span style="font-size: 0.7rem; color: var(--text-dim); display: block;">HEEL DROP</span><strong>${product.specs.drop}</strong></div>
          </div>

          <div style="font-size: 1.6rem; font-weight: 800; font-family: var(--font-display); color: var(--neon-cyan);">$${product.price}</div>

          <div class="size-chips" id="qv-sizes" style="margin-top: 0.5rem;">
            <button class="size-chip" data-size="8">8</button>
            <button class="size-chip active" data-size="9">9</button>
            <button class="size-chip" data-size="10">10</button>
            <button class="size-chip" data-size="11">11</button>
            <button class="size-chip" data-size="12">12</button>
          </div>

          <button class="btn btn-primary btn-glow" id="qv-add-cart-btn" style="margin-top: 1rem;">
            Add To Kinetic Vault ($${product.price})
          </button>
        </div>
      </div>
    `;

    // Size chip selection inside quickview
    const qvSizes = quickviewContent.querySelectorAll('#qv-sizes .size-chip');
    qvSizes.forEach((chip) => {
      chip.addEventListener('click', () => {
        qvSizes.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    // Add to cart inside quickview
    const qvAddBtn = quickviewContent.querySelector('#qv-add-cart-btn');
    if (qvAddBtn) {
      qvAddBtn.addEventListener('click', () => {
        const activeChip = quickviewContent.querySelector('#qv-sizes .size-chip.active');
        const size = activeChip ? activeChip.getAttribute('data-size') : 9;
        addToCart({
          shoeId: product.id,
          name: product.name,
          price: product.price,
          size,
          color: 'Signature',
          img: product.img
        });
        closeQuickView();
        openCartDrawer();
      });
    }

    if (quickviewModal) quickviewModal.classList.add('active');
    if (quickviewBackdrop) quickviewBackdrop.classList.add('active');
  }

  function closeQuickView() {
    if (quickviewModal) quickviewModal.classList.remove('active');
    if (quickviewBackdrop) quickviewBackdrop.classList.remove('active');
  }

  document.querySelectorAll('.btn-quick-view').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const product = productsDB.find((p) => p.id === id);
      if (product) openQuickView(product);
    });
  });

  if (quickviewCloseBtn) quickviewCloseBtn.addEventListener('click', closeQuickView);
  if (quickviewBackdrop) quickviewBackdrop.addEventListener('click', closeQuickView);

  // =========================================================================
  // INSTANT SEARCH MODAL (WITH CTRL+K SHORTCUT)
  // =========================================================================
  const searchOverlay = document.getElementById('search-overlay');
  const searchTrigger = document.getElementById('search-trigger');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  function openSearch() {
    if (searchOverlay) {
      searchOverlay.classList.add('active');
      setTimeout(() => {
        if (searchInput) searchInput.focus();
      }, 100);
    }
  }

  function closeSearch() {
    if (searchOverlay) {
      searchOverlay.classList.remove('active');
      if (searchInput) searchInput.value = '';
      if (searchResults) searchResults.innerHTML = '<div class="search-placeholder">Type to instantly filter through the AURA catalog...</div>';
    }
  }

  if (searchTrigger) searchTrigger.addEventListener('click', openSearch);
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);

  // Keyboard shortcut Ctrl+K or '/'
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') {
      closeSearch();
      closeQuickView();
      closeCartDrawer();
    }
  });

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        searchResults.innerHTML = '<div class="search-placeholder">Type to instantly filter through the AURA catalog...</div>';
        return;
      }

      const matches = productsDB.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.desc.toLowerCase().includes(query)
      );

      if (matches.length === 0) {
        searchResults.innerHTML = `<div class="search-placeholder">No kinetic prototypes found for "${query}".</div>`;
      } else {
        searchResults.innerHTML = matches
          .map(
            (p) => `
          <div class="search-item" data-id="${p.id}">
            <img src="${p.img}" alt="${p.name}">
            <div class="search-item-info">
              <div class="search-item-title">${p.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-dim);">${p.category}</div>
            </div>
            <div class="search-item-price">$${p.price}</div>
          </div>
        `
          )
          .join('');

        searchResults.querySelectorAll('.search-item').forEach((item) => {
          item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            const product = productsDB.find((p) => p.id === id);
            if (product) {
              closeSearch();
              openQuickView(product);
            }
          });
        });
      }
    });
  }

  // =========================================================================
  // NEWSLETTER VIP CLUB FORM
  // =========================================================================
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterReward = document.getElementById('newsletter-reward');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      if (emailInput && emailInput.value) {
        playCyberChime();
        if (newsletterReward) {
          newsletterReward.style.display = 'block';
        }
        showToast('VIP Club Access Granted! Code VIP-DROP20 unlocked.', 'success');
        emailInput.value = '';
      }
    });
  }

  // =========================================================================
  // SCROLL OBSERVER REVEALS
  // =========================================================================
  const observerOptions = { threshold: 0.15 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.tech-card, .review-card').forEach((el) => {
    observer.observe(el);
  });
});
