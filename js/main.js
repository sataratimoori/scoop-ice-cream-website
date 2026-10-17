/* SCOOP — shared script (loaded on every page) */
(function () {
  "use strict";

  const root = document.documentElement;
  const nav = document.getElementById("mainNav");
  const heroArt = document.getElementById("heroArt");
  const cartBtn = document.querySelector(".cart-btn");

  /* ---------- Theme (flavor color) shared by all pages ---------- */
  const DARK_TEXT_ON = ["#ffd93d"]; // light theme colors need dark text on top
  function applyTheme(color, soft) {
    root.style.setProperty("--primary", color);
    root.style.setProperty("--soft", soft);
    root.style.setProperty(
      "--on-primary",
      DARK_TEXT_ON.includes(color.toLowerCase()) ? "#3b2926" : "#ffffff",
    );
  }
  function loadTheme() {
    try {
      return JSON.parse(localStorage.getItem("scoopTheme"));
    } catch (e) {
      return null;
    }
  }
  const savedTheme = loadTheme();
  if (savedTheme && savedTheme.color && savedTheme.soft)
    applyTheme(savedTheme.color, savedTheme.soft);

  /* ---------- Cart storage ---------- */
  function readCart() {
    try {
      const data = JSON.parse(localStorage.getItem("scoopCart"));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(cart) {
    try {
      localStorage.setItem("scoopCart", JSON.stringify(cart));
    } catch (e) {}
  }

  function escapeHTML(text) {
    return String(text).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(message) {
    const toast = document.getElementById("toastMessage");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  /* ---------- Cart drawer (injected, so no HTML changes needed) ---------- */
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="offcanvas offcanvas-end cart-drawer" tabindex="-1" id="cartDrawer" aria-labelledby="cartDrawerTitle">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="cartDrawerTitle">Your happy cart 🍦</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <div id="cartItems"></div>
      </div>
      <div class="cart-footer">
        <div class="cart-total"><span>Total</span><strong id="cartTotal">$0.00</strong></div>
        <button type="button" class="cart-clear" id="clearCart">Clear cart</button>
      </div>
    </div>`,
  );

  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");

  function renderCart() {
    const cart = readCart();
    document
      .querySelectorAll("#cartCount")
      .forEach((el) => (el.textContent = cart.length));

    if (!cart.length) {
      cartItemsEl.innerHTML = `<div class="cart-empty"><div>🍨</div><p>Your cart is empty.<br>Add something sweet!</p></div>`;
      cartTotalEl.textContent = "$0.00";
      return;
    }

    cartItemsEl.innerHTML = cart
      .map((item, i) => {
        const d = item.details
          ? `<small>${escapeHTML(item.details.base === "Cone" ? "Waffle cone" : "Happy cup")}${item.details.toppings && item.details.toppings.length ? " · " + escapeHTML(item.details.toppings.join(", ")) : ""}</small>`
          : "";
        return `<div class="cart-item"><div><b>${escapeHTML(item.name)}</b>${d}</div><span>$${Number(item.price).toFixed(2)}</span><button type="button" class="cart-remove" data-index="${i}" aria-label="Remove ${escapeHTML(item.name)}">×</button></div>`;
      })
      .join("");

    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    cartTotalEl.textContent = `$${total.toFixed(2)}`;
  }

  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".cart-remove");
    if (!btn) return;
    const cart = readCart();
    cart.splice(Number(btn.dataset.index), 1);
    writeCart(cart);
    renderCart();
  });

  document.getElementById("clearCart").addEventListener("click", () => {
    writeCart([]);
    renderCart();
  });

  if (cartBtn) {
    cartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      renderCart();
      if (window.bootstrap)
        bootstrap.Offcanvas.getOrCreateInstance(
          document.getElementById("cartDrawer"),
        ).show();
    });
  }

  /* Public helper used by the other scripts */
  window.addToCart = function (item, message) {
    const cart = readCart();
    cart.push(item);
    writeCart(cart);
    renderCart();
    showToast(message || `${item.name} added to your happy cart! 🍦`);
  };
  window.showToast = showToast;

  /* ---------- Flavor switcher (home page) ---------- */
  document.querySelectorAll(".flavor").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".flavor")
        .forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      applyTheme(button.dataset.color, button.dataset.soft);
      try {
        localStorage.setItem(
          "scoopTheme",
          JSON.stringify({
            color: button.dataset.color,
            soft: button.dataset.soft,
          }),
        );
      } catch (e) {}
    });
  });
  /* Home page: mark the saved flavor as active */
  if (savedTheme) {
    document
      .querySelectorAll(".flavor")
      .forEach((b) =>
        b.classList.toggle(
          "active",
          b.dataset.color.toLowerCase() === savedTheme.color.toLowerCase(),
        ),
      );
  }

  /* ---------- Featured "+" buttons (home page) ---------- */
  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", () => {
      window.addToCart({
        name: button.dataset.name,
        price: Number(button.dataset.price),
      });
    });
  });

  /* ---------- Navbar shadow on scroll ---------- */
  if (nav) {
    const onScroll = () =>
      nav.classList.toggle("scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Hero tilt (home page only) ---------- */
  if (heroArt && window.matchMedia("(hover: hover)").matches) {
    heroArt.addEventListener("mousemove", (event) => {
      const rect = heroArt.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroArt.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${y * -8}deg)`;
    });
    heroArt.addEventListener("mouseleave", () => {
      heroArt.style.transform = "none";
    });
  }

  renderCart();
})();
