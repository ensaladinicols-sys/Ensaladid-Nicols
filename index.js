// --- ESTADO DEL CARRITO ---
let cart = [];
const NUMERO_WHATSAPP = "525530360593";

// --- INICIALIZACIÓN GENERAL ---
document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navMenu = document.getElementById("navMenu");

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navMenu.classList.toggle("active");
      navMenu.classList.toggle("show");
    });
  }

  // Mostrar sección inicial y actualizar carruseles
  showSection("home");
  Object.keys(carouselIndices).forEach(id => updateCarousel(id));

  // Inicializar Botón de PayPal
  initPayPalButton();
});

// --- CONFIGURACIÓN DE PAYPAL ---
function initPayPalButton() {
  const container = document.getElementById("paypal-button-container");
  if (!container || !window.paypal) return;

  container.innerHTML = "";

  paypal.Buttons({
    style: {
      layout: 'vertical',
      color:  'gold',
      shape:  'rect',
      label:  'paypal'
    },
    createOrder: function(data, actions) {
      const total = getCartTotal();
      if (total <= 0) {
        alert("Tu canasta está vacía. Agrega productos antes de pagar.");
        return;
      }
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: total.toFixed(2)
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert("¡Pago completado con éxito, " + (details.payer.name.given_name || "Cliente") + "!");
        cart = [];
        updateCartUI();
        closeCartModal();
      });
    },
    onError: function(err) {
      console.error("Error en el pago de PayPal:", err);
      alert("Ocurrió un error al procesar el pago con PayPal.");
    }
  }).render("#paypal-button-container");
}

// --- NAVEGACIÓN ENTRE SECCIONES ---
function showSection(sectionId) {
  const sections = document.querySelectorAll(".page-section");
  sections.forEach(sec => {
    sec.classList.remove("active-section");
    sec.style.display = "none";
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add("active-section");
    target.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const navMenu = document.getElementById("navMenu");
  if (navMenu) {
    navMenu.classList.remove("active", "show");
  }
}
window.showSection = showSection;

// --- CARRUSELES ---
const carouselIndices = {
  "carousel-ensaladas": 0,
  "carousel-cocteles": 0,
  "carousel-bebidas": 0
};

function updateCarousel(carouselId) {
  const container = document.getElementById(carouselId);
  if (!container) return;

  const slides = container.querySelectorAll(".carousel-slide");
  const dots = container.querySelectorAll(".dot");
  const currentIndex = carouselIndices[carouselId];

  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === currentIndex);
    slide.style.display = index === currentIndex ? "block" : "none";
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentIndex);
  });
}

function moveSlide(carouselId, step) {
  const container = document.getElementById(carouselId);
  if (!container) return;

  const totalSlides = container.querySelectorAll(".carousel-slide").length;
  carouselIndices[carouselId] = (carouselIndices[carouselId] + step + totalSlides) % totalSlides;
  updateCarousel(carouselId);
}
window.moveSlide = moveSlide;

function currentSlide(carouselId, index) {
  carouselIndices[carouselId] = index;
  updateCarousel(carouselId);
}
window.currentSlide = currentSlide;

// --- CARRITO DE COMPRAS ---
function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  updateCartUI();
  
  const badge = document.getElementById("cartBadge");
  if (badge) {
    badge.style.transform = "scale(1.3)";
    setTimeout(() => badge.style.transform = "scale(1)", 200);
  }
}
window.addToCart = addToCart;

function changeQuantity(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
}
window.changeQuantity = changeQuantity;

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}
window.removeFromCart = removeFromCart;

function clearCart() {
  if (cart.length === 0) return;
  if (confirm("¿Estás seguro de vaciar tu canasta?")) {
    cart = [];
    updateCartUI();
  }
}
window.clearCart = clearCart;

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCartUI() {
  const badge = document.getElementById("cartBadge");
  const list = document.getElementById("cartItemsList");
  const totalEl = document.getElementById("cartTotal");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (badge) badge.textContent = totalItems;

  if (!list || !totalEl) return;

  if (cart.length === 0) {
    list.innerHTML = `<p class="empty-cart-msg">Tu canasta está vacía</p>`;
    totalEl.textContent = `$0.00 MXN`;
    return;
  }

  list.innerHTML = cart.map((item, idx) => `
    <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee;">
      <div>
        <strong>${item.name}</strong><br>
        <small>$${item.price} c/u</small>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button onclick="changeQuantity(${idx}, -1)" style="padding:2px 8px; cursor:pointer;">-</button>
        <span>${item.quantity}</span>
        <button onclick="changeQuantity(${idx}, 1)" style="padding:2px 8px; cursor:pointer;">+</button>
        <button onclick="removeFromCart(${idx})" style="color:red; border:none; background:none; cursor:pointer;" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join("");

  totalEl.textContent = `$${getCartTotal().toFixed(2)} MXN`;
}

// --- MODALES (CARRITO Y VENTANAS LEGALES/INFORMATIVAS) ---
function openCartModal() {
  const cartModal = document.getElementById("cartModal");
  if (cartModal) cartModal.style.display = "flex";
}
window.openCartModal = openCartModal;

function closeCartModal() {
  const cartModal = document.getElementById("cartModal");
  if (cartModal) cartModal.style.display = "none";
}
window.closeCartModal = closeCartModal;

const openCartBtn = document.getElementById("openCartBtn");
if (openCartBtn) {
  openCartBtn.addEventListener("click", openCartModal);
}

function openLegalModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "flex";
}
window.openLegalModal = openLegalModal;

function closeLegalModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
}
window.closeLegalModal = closeLegalModal;

window.addEventListener("click", (e) => {
  const cartModal = document.getElementById("cartModal");
  const aboutModal = document.getElementById("aboutModal");
  const termsModal = document.getElementById("termsModal");
  const privacyModal = document.getElementById("privacyModal");
  const navMenu = document.getElementById("navMenu");
  const hamburgerBtn = document.getElementById("hamburgerBtn");

  if (e.target === cartModal) closeCartModal();
  if (e.target === aboutModal) closeLegalModal("aboutModal");
  if (e.target === termsModal) closeLegalModal("termsModal");
  if (e.target === privacyModal) closeLegalModal("privacyModal");

  if (navMenu && hamburgerBtn && navMenu.classList.contains("active")) {
    if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      navMenu.classList.remove("active", "show");
    }
  }

});

// --- PEDIDO POR WHATSAPP ---
function sendWhatsAppOrder() {
  if (cart.length === 0) {
    alert("Tu canasta está vacía. Agrega algún producto primero.");
    return;
  }

  let mensaje = "¡Hola Ensaladíd Nicol's! Quisiera hacer el siguiente pedido:\n\n";
  cart.forEach(item => {
    mensaje += `• ${item.quantity}x ${item.name} ($${item.price * item.quantity})\n`;
  });
  mensaje += `\n*Total a Pagar: $${getCartTotal().toFixed(2)} MXN*`;

  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}
window.sendWhatsAppOrder = sendWhatsAppOrder;