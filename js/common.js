
/* VORIX shared utilities */

(() => {
  "use strict";

  const PRODUCTS = Array.isArray(window.VORIX_PRODUCTS)
    ? window.VORIX_PRODUCTS
    : [];

  const CART_KEY = "vorix-cart";

  function formatPrice(price, currency = "INR") {
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      return "Price not configured";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(price);
  }

  function getProduct(id) {
    return PRODUCTS.find(product => product.id === id) || null;
  }

  function readCart() {
    try {
      const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function updateCartCount() {
    const count = readCart().reduce((total, item) => {
      const quantity = Number(item.quantity);

      return total + (
        Number.isInteger(quantity) && quantity > 0
          ? quantity
          : 0
      );
    }, 0);

    document.querySelectorAll("[data-cart-count]").forEach(element => {
      element.textContent = String(count);
    });
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
  }

  function createProductCard(product) {
    const article = createElement("article", "product-card");

    const link = createElement("a", "product-card__image-link");
    link.href = `product.html?id=${encodeURIComponent(product.id)}`;
    link.setAttribute("aria-label", `View ${product.name}`);

    const image = createElement("img", "product-card__image");
    image.src = product.image;
    image.alt = `${product.name} product artwork`;
    image.loading = "lazy";
    image.width = 600;
    image.height = 750;

    image.addEventListener("error", () => {
      image.hidden = true;
      link.classList.add("product-card__image-link--missing");
    }, { once: true });

    link.append(image);

    const content = createElement("div", "product-card__content");
    const meta = createElement("div", "product-card__meta");

    meta.append(
      createElement("span", "product-card__category", product.category),
      createElement(
        "span",
        "product-card__type",
        product.providers?.length > 1
          ? `${product.providers.length} provider options`
          : product.productType
      )
    );

    const title = createElement("h3", "product-card__title");
    const titleLink = createElement("a");
    titleLink.href = link.href;
    titleLink.textContent = product.name;
    title.append(titleLink);

    const price = createElement(
      "p",
      "product-card__price",
      "Compare options for price"
    );

    const description = createElement(
      "p",
      "product-card__description",
      product.description
    );

    const actions = createElement("div", "product-card__actions");
    const details = createElement(
      "a",
      "button button--dark",
      "View Details"
    );
    details.href = link.href;

    actions.append(details);
    content.append(meta, title, price, description, actions);
    article.append(link, content);

    return article;
  }

  function renderProducts(container, products) {
    if (!container) return;

    container.replaceChildren();

    if (!products.length) {
      container.append(
        createElement("p", "empty-state", "No products to display yet.")
      );
      return;
    }

    products.forEach(product => {
      container.append(createProductCard(product));
    });
  }

  function initMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-navigation]");

    if (!button || !navigation) return;

    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!isOpen));
      navigation.classList.toggle("is-open", !isOpen);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    initMenu();
  });

  window.VORIX = {
    products: PRODUCTS,
    formatPrice,
    getProduct,
    readCart,
    updateCartCount,
    createElement,
    createProductCard,
    renderProducts
  };
})();
