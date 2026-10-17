/* SCOOP — menu page (search, filter, sort). Cart/toast/nav come from main.js */
(function () {
  "use strict";

  const products = [
    {
      id: 1,
      name: "Strawberry Dream",
      category: "Ice Cream",
      price: 3.5,
      emoji: "🍓",
      color: "pink",
      label: "BEST SELLER",
      description: "Strawberry cream with real berry pieces.",
    },
    {
      id: 2,
      name: "Lemon Sunshine",
      category: "Ice Cream",
      price: 3.25,
      emoji: "🍋",
      color: "yellow",
      label: "FRESH",
      description: "Bright, creamy and refreshingly citrusy.",
    },
    {
      id: 3,
      name: "Blueberry Cloud",
      category: "Ice Cream",
      price: 3.75,
      emoji: "🫐",
      color: "purple",
      label: "NEW",
      description: "A silky blueberry scoop with a dreamy finish.",
    },
    {
      id: 4,
      name: "Minty Magic",
      category: "Ice Cream",
      price: 3.6,
      emoji: "🍃",
      color: "mint",
      label: "FRESH",
      description: "Cool mint cream with a little chocolate crunch.",
    },
    {
      id: 5,
      name: "Rainbow Pop",
      category: "Popsicles",
      price: 2.5,
      emoji: "🍭",
      color: "blue",
      label: "KID FAVORITE",
      description: "A fruity rainbow pop for sunny afternoons.",
    },
    {
      id: 6,
      name: "Peachy Popsicle",
      category: "Popsicles",
      price: 2.25,
      emoji: "🍑",
      color: "peach",
      label: "FRESH",
      description: "Juicy peach flavor in an icy little treat.",
    },
    {
      id: 7,
      name: "Choco Crunch Pop",
      category: "Popsicles",
      price: 2.75,
      emoji: "🍫",
      color: "purple",
      label: "BEST SELLER",
      description: "Chocolate-coated popsicle with crunchy bits.",
    },
    {
      id: 8,
      name: "Berry Milkshake",
      category: "Milkshakes",
      price: 4.25,
      emoji: "🥤",
      color: "pink",
      label: "BEST SELLER",
      description: "A thick berry shake topped with whipped cream.",
    },
    {
      id: 9,
      name: "Choco Cloud Shake",
      category: "Milkshakes",
      price: 4.5,
      emoji: "🍫",
      color: "peach",
      label: "NEW",
      description: "Chocolate, cream and a whole lot of joy.",
    },
    {
      id: 10,
      name: "Mint Dream Shake",
      category: "Milkshakes",
      price: 4.35,
      emoji: "🥛",
      color: "mint",
      label: "FRESH",
      description: "A cool mint shake blended until silky smooth.",
    },
    {
      id: 11,
      name: "Confetti Cupcake",
      category: "Desserts",
      price: 3.95,
      emoji: "🧁",
      color: "yellow",
      label: "NEW",
      description: "Soft vanilla cake with colorful sprinkles.",
    },
    {
      id: 12,
      name: "Berry Waffle",
      category: "Desserts",
      price: 5.25,
      emoji: "🧇",
      color: "blue",
      label: "SCOOP SPECIAL",
      description: "Golden waffle with berries and ice cream.",
    },
  ];

  const grid = document.getElementById("productGrid");
  const search = document.getElementById("searchInput");
  const clear = document.getElementById("clearSearch");
  const sort = document.getElementById("sortSelect");
  const result = document.getElementById("resultCount");
  const empty = document.getElementById("emptyState");
  const filters = document.getElementById("categoryFilters");
  let category = "All";

  function labelClass(label) {
    if (label === "NEW") return "new";
    if (label === "FRESH") return "fresh";
    return "";
  }

  function renderProducts() {
    const term = search.value.trim().toLowerCase();
    const shown = products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(term),
    );

    if (sort.value === "low") shown.sort((a, b) => a.price - b.price);
    if (sort.value === "high") shown.sort((a, b) => b.price - a.price);
    if (sort.value === "az") shown.sort((a, b) => a.name.localeCompare(b.name));

    grid.innerHTML = shown
      .map(
        (p, i) => `
      <article class="menu-product" style="animation-delay:${i * 35}ms">
        <div class="product-visual visual-${p.color}"><span class="product-emoji" aria-hidden="true">${p.emoji}</span></div>
        <span class="product-label ${labelClass(p.label)}">${p.label}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-meta">
          <div class="product-price"><small>$</small>${p.price.toFixed(2)}</div>
          <button type="button" class="product-add" data-id="${p.id}" aria-label="Add ${p.name} to cart">+</button>
        </div>
      </article>`,
      )
      .join("");

    result.textContent = `${shown.length} delicious ${shown.length === 1 ? "treat" : "treats"}`;
    empty.classList.toggle("d-none", shown.length !== 0);
    grid.classList.toggle("d-none", shown.length === 0);
    clear.style.display = term ? "block" : "none";
  }

  /* One delegated listener instead of one per button on every render */
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".product-add");
    if (!btn) return;
    const p = products.find((item) => item.id === Number(btn.dataset.id));
    window.addToCart({ name: p.name, price: p.price });
    btn.textContent = "✓";
    setTimeout(() => {
      btn.textContent = "+";
    }, 800);
  });

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;
    category = btn.dataset.category;
    filters
      .querySelectorAll(".category-chip")
      .forEach((chip) => chip.classList.toggle("active", chip === btn));
    renderProducts();
  });

  search.addEventListener("input", renderProducts);
  sort.addEventListener("change", renderProducts);

  clear.addEventListener("click", () => {
    search.value = "";
    renderProducts();
    search.focus();
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    category = "All";
    search.value = "";
    sort.value = "featured";
    filters
      .querySelectorAll(".category-chip")
      .forEach((chip) =>
        chip.classList.toggle("active", chip.dataset.category === "All"),
      );
    renderProducts();
  });

  renderProducts();
})();
