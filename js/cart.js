
/* VORIX CART
   Local product preparation only. No payment or order creation.
*/

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const api = window.VORIX;
    if (!api) return;

    const $ = id => document.getElementById(id);
    const emptyState = $("cart-empty");
    const content = $("cart-content");
    const itemsContainer = $("cart-items");
    const subtotalElement = $("cart-subtotal");
    const priceNote = $("cart-price-note");
    const status = $("cart-status");
    const review = $("purchase-review");
    const groupsContainer = $("purchase-groups");

    function safeUrl(value) {
      if (typeof value !== "string" || !value.trim()) return null;

      try {
        const url = new URL(value);
        if (!["https:", "http:"].includes(url.protocol)) return null;
        return url.href;
      } catch {
        return null;
      }
    }

    function readValidCart() {
      return api.readCart().filter(item =>
        item &&
        typeof item.productId === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        api.getProduct(item.productId)
      );
    }

    function saveCart(cart) {
      try {
        localStorage.setItem("vorix-cart", JSON.stringify(cart));
        api.updateCartCount();
        return true;
      } catch {
        status.textContent =
          "Unable to save cart changes. Check your browser storage settings.";
        return false;
      }
    }

    function getProductPrice(product, options) {
      // Only use explicitly configured prices.
      // Provider-specific options are not silently assigned a price here.
      const price = product.price;

      if (
        typeof price === "number" &&
        Number.isFinite(price) &&
        price >= 0
      ) {
        return price;
      }

      return null;
    }

    function getSelectedVariant(item) {
      const options = item.options || {};
      const color = options.color || "";
      const size = options.size || "";
      return color && size ? `${color}-${size}` : "";
    }

    function createText(tag, className, text) {
      return api.createElement(tag, className, text);
    }

    function renderItems() {
      const cart = readValidCart();

      emptyState.hidden = cart.length > 0;
      content.hidden = cart.length === 0;
      itemsContainer.replaceChildren();

      if (!cart.length) {
        subtotalElement.textContent = "—";
        api.updateCartCount();
        return;
      }

      let subtotal = 0;
      let allPricesKnown = true;

      cart.forEach((item, index) => {
        const product = api.getProduct(item.productId);
        const unitPrice = getProductPrice(product, item.options);

        if (unitPrice === null) {
          allPricesKnown = false;
        } else {
          subtotal += unitPrice * item.quantity;
        }

        const row = createText("article", "cart-item");
        const imageLink = createText("a", "cart-item__image-link");
        imageLink.href = `product.html?id=${encodeURIComponent(product.id)}`;

        const image = createText("img", "cart-item__image");
        image.src = product.image;
        image.alt = `${product.name} preview`;
        image.loading = "lazy";
        image.width = 140;
        image.height = 175;

        image.addEventListener("error", () => {
          image.hidden = true;
          imageLink.classList.add("cart-item__image-link--missing");
        }, { once: true });

        imageLink.append(image);

        const details = createText("div", "cart-item__details");
        const nameLink = createText("a", "cart-item__name", product.name);
        nameLink.href = `product.html?id=${encodeURIComponent(product.id)}`;

        details.append(
          nameLink,
          createText("p", "cart-item__category", product.category)
        );

        const optionEntries = Object.entries(item.options || {})
          .filter(([, value]) => typeof value === "string" && value);

        if (optionEntries.length) {
          details.append(createText(
            "p",
            "cart-item__options",
            optionEntries.map(([key, value]) =>
              `${key}: ${value}`
            ).join(" · ")
          ));
        }

        details.append(createText(
          "p",
          "cart-item__unit-price",
          unitPrice === null
            ? "Unit price not configured"
            : `${api.formatPrice(unitPrice)} each`
        ));

        const controls = createText("div", "cart-item__controls");

        const quantityLabel = createText("label", "cart-quantity-label", "Qty");
        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.min = "1";
        quantityInput.max = "20";
        quantityInput.step = "1";
        quantityInput.value = String(item.quantity);
        quantityInput.setAttribute("aria-label", `Quantity for ${product.name}`);

        quantityInput.addEventListener("change", () => {
          const nextQuantity = Number(quantityInput.value);

          if (!Number.isInteger(nextQuantity) || nextQuantity < 1 || nextQuantity > 20) {
            status.textContent = "Quantity must be between 1 and 20.";
            quantityInput.value = String(item.quantity);
            return;
          }

          const updated = readValidCart();
          const target = updated[index];

          if (!target) return;

          target.quantity = nextQuantity;

          if (saveCart(updated)) {
            status.textContent = "Cart quantity updated.";
            renderItems();
          }
        });

        quantityLabel.append(quantityInput);

        const remove = createText("button", "text-button", "Remove");
        remove.type = "button";
        remove.addEventListener("click", () => {
          const updated = readValidCart();
          updated.splice(index, 1);

          if (saveCart(updated)) {
            review.hidden = true;
            status.textContent = `${product.name} removed from your cart.`;
            renderItems();
          }
        });

        controls.append(quantityLabel, remove);
        details.append(controls);
        row.append(imageLink, details);
        itemsContainer.append(row);
      });

      subtotalElement.textContent = allPricesKnown
        ? api.formatPrice(subtotal)
        : `${api.formatPrice(subtotal)} + unpriced items`;

      priceNote.textContent = allPricesKnown
        ? "Subtotal uses configured base prices only. Shipping and taxes are not included unless verified."
        : "Some products have no configured price. The subtotal is incomplete and does not mean those products are free.";

      api.updateCartCount();
    }

    function getPurchaseLinks(product, item) {
      const variantKey = getSelectedVariant(item);
      const links = [];

      (product.providers || []).forEach(provider => {
        const variant = variantKey ? provider.variants?.[variantKey] : null;
        const url = safeUrl(
          variant?.externalProductUrl || provider.externalProductUrl || ""
        );

        if (url) {
          links.push({
            destination: url,
            destinationName: provider.name,
            productName: product.name,
            quantity: item.quantity,
            note: "Individual product link; multi-item checkout not verified."
          });
        }

        const collectionUrl = safeUrl(provider.collectionUrl || "");
        if (collectionUrl) {
          links.push({
            destination: collectionUrl,
            destinationName: `${provider.name} collection`,
            productName: product.name,
            quantity: item.quantity,
            note: "Collection link; confirm the required product and variant on the seller's site."
          });
        }
      });

      const directUrl = safeUrl(product.externalProductUrl || "");
      if (directUrl) {
        links.push({
          destination: directUrl,
          destinationName: product.externalStoreName || "External seller",
          productName: product.name,
          quantity: item.quantity,
          note: "Individual product link; multi-item checkout not verified."
        });
      }

      return links;
    }

    function renderPurchaseReview() {
      const cart = readValidCart();
      groupsContainer.replaceChildren();

      const links = cart.flatMap(item => {
        const product = api.getProduct(item.productId);
        return getPurchaseLinks(product, item);
      });

      if (!links.length) {
        groupsContainer.append(createText(
          "p",
          "purchase-no-links",
          "No genuine external purchase links are configured for the products in your cart yet. Configure verified seller URLs in js/products.js before inviting customers to purchase."
        ));
        review.hidden = false;
        return;
      }

      // Group by exact destination URL. Similar platform names alone
      // do not prove that links share a compatible checkout.
      const groups = new Map();

      links.forEach(link => {
        if (!groups.has(link.destination)) {
          groups.set(link.destination, []);
        }
        groups.get(link.destination).push(link);
      });

      const groupCount = groups.size;

      groups.forEach((entries, url) => {
        const group = createText("section", "purchase-group");
        group.append(createText(
          "h3",
          "purchase-group__title",
          entries[0].destinationName
        ));

        const list = createText("ul", "purchase-group__list");

        entries.forEach(entry => {
          const li = document.createElement("li");
          li.append(
            createText(
              "p",
              "purchase-group__product",
              `${entry.productName} · Quantity ${entry.quantity}`
            ),
            createText("p", "purchase-group__note", entry.note)
          );

          const link = createText("a", "button button--outline", "Open seller link ↗");
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";

          li.append(link);
          list.append(li);
        });

        group.append(list);
        groupsContainer.append(group);
      });

      groupsContainer.prepend(createText(
        "p",
        "purchase-group-count",
        groupCount > 1
          ? `Your cart contains ${groupCount} distinct external destinations. Separate purchases may be required.`
          : "These links share one destination URL, but a combined multi-item checkout has not been verified."
      ));

      review.hidden = false;
    }

    $("clear-cart").addEventListener("click", () => {
      if (!readValidCart().length) return;

      if (saveCart([])) {
        review.hidden = true;
        status.textContent = "Your VORIX cart has been cleared.";
        renderItems();
      }
    });

    $("continue-purchase").addEventListener("click", () => {
      renderPurchaseReview();
      review.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    renderItems();
  });
})();
