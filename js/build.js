/* SCOOP — "Build Yours" page. Cart/toast come from main.js */
(function () {
  "use strict";

  const flavorPrices = {
    Strawberry: 1.5,
    Vanilla: 1.25,
    Chocolate: 1.5,
    Mint: 1.35,
    Blueberry: 1.6,
    Mango: 1.4,
  };
  const selectedFlavors = ["Vanilla"];
  const flavorButtons = document.querySelectorAll(".choice-card");
  const baseButtons = document.querySelectorAll(".base-choice");
  const toppingChecks = document.querySelectorAll(".topping-check");
  const previewScoops = document.getElementById("previewScoops");
  const previewBase = document.getElementById("previewBase");
  const summaryFlavors = document.getElementById("summaryFlavors");
  const summaryBase = document.getElementById("summaryBase");
  const summaryToppings = document.getElementById("summaryToppings");
  const buildTotal = document.getElementById("buildTotal");
  const buildFeedback = document.getElementById("buildFeedback");
  let chosenBase = "Cone";
  let basePrice = 0.75;
  let currentTotal = 0;

  const DEFAULT_NOTE = "A little scoop of happiness, made by you.";

  function updateBuilder(note) {
    flavorButtons.forEach((button) => {
      const on = selectedFlavors.includes(button.dataset.flavor);
      button.classList.toggle("selected", on);
      button.setAttribute("aria-pressed", on);
    });
    baseButtons.forEach((button) =>
      button.setAttribute("aria-pressed", button.classList.contains("active")),
    );

    const selectedButtons = [...flavorButtons].filter((b) =>
      selectedFlavors.includes(b.dataset.flavor),
    );
    previewScoops.innerHTML = selectedButtons
      .map(
        (b) =>
          `<span class="preview-scoop" style="background:${b.dataset.color}" title="${b.dataset.flavor}">${b.dataset.emoji}</span>`,
      )
      .join("");
    previewBase.textContent = chosenBase === "Cone" ? "🍦" : "🥣";

    summaryFlavors.textContent = selectedFlavors.join(", ");
    summaryBase.textContent =
      chosenBase === "Cone" ? "Waffle cone" : "Happy cup";

    const toppings = [...toppingChecks].filter((input) => input.checked);
    summaryToppings.textContent = toppings.length
      ? toppings.map((input) => input.value).join(", ")
      : "None yet";

    const flavorTotal = selectedFlavors.reduce(
      (sum, flavor) => sum + flavorPrices[flavor],
      0,
    );
    const toppingTotal = toppings.reduce(
      (sum, input) => sum + Number(input.dataset.price),
      0,
    );
    currentTotal =
      Math.round((flavorTotal + basePrice + toppingTotal) * 100) / 100;
    buildTotal.textContent = `$${currentTotal.toFixed(2)}`;

    buildFeedback.textContent =
      typeof note === "string"
        ? note
        : selectedFlavors.length >= 3
          ? "Maximum scoops reached — what a masterpiece!"
          : DEFAULT_NOTE;
  }

  flavorButtons.forEach((button) =>
    button.addEventListener("click", () => {
      const flavor = button.dataset.flavor;
      const index = selectedFlavors.indexOf(flavor);
      if (index >= 0) {
        if (selectedFlavors.length === 1) {
          buildFeedback.textContent = "Choose at least one flavor.";
          return;
        }
        selectedFlavors.splice(index, 1);
      } else {
        if (selectedFlavors.length >= 3) {
          buildFeedback.textContent = "You can choose up to three flavors.";
          return;
        }
        selectedFlavors.push(flavor);
      }
      updateBuilder();
    }),
  );

  baseButtons.forEach((button) =>
    button.addEventListener("click", () => {
      baseButtons.forEach((item) =>
        item.classList.toggle("active", item === button),
      );
      chosenBase = button.dataset.base;
      basePrice = Number(button.dataset.price);
      updateBuilder();
    }),
  );

  toppingChecks.forEach((input) =>
    input.addEventListener("change", () => updateBuilder()),
  );

  document.getElementById("addCustomToCart").addEventListener("click", () => {
    const toppings = [...toppingChecks]
      .filter((input) => input.checked)
      .map((input) => input.value);
    window.addToCart(
      {
        name: `Custom Scoop (${selectedFlavors.join(" + ")})`,
        price: currentTotal,
        details: { base: chosenBase, toppings },
      },
      "Your custom scoop was added! 🍦",
    );
    buildFeedback.textContent =
      "Saved to your cart. You made something delicious!";
  });

  updateBuilder();
})();
