
/* VORIX PRODUCT DETAILS AND PROVIDER COMPARISON */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const api = window.VORIX;
    if (!api) return;

    const params = new URLSearchParams(window.location.search);
    const product = api.getProduct(params.get("id"));

    const content = document.getElementById("product-content");
    const error = document.getElementById("product-error");

    if (!product) {
      error.hidden = false;
      document.title = "Design Not Found | VORIX";
      return;
    }

    content.hidden = false;
    document.title = `${product.name} | VORIX`;

    const $ = id => document.getElementById(id);

    $("product-breadcrumb-name").textContent = product.name;
    $("product-category").textContent =
      `${product.category} / ${product.productType}`;

    $("product-name").textContent = product.name;
    $("product-description").textContent = product.description;

    const image = $("product-image");
    image.src = product.image;
    image.alt = `${product.name} design preview`;

    image.addEventListener("error", () => {
      image.hidden = true;
      image.parentElement.classList.add("product-image--missing");
    }, { once: true });

    function validPrice(price) {
      return typeof price === "number" &&
        Number.isFinite(price) &&
        price >= 0;
    }

    function getProviderPrices() {
      return (product.providers || [])
        .map(provider => provider.prices?.INR)
        .filter(validPrice);
    }

    function getBasePrice(provider) {
      const price = provider?.prices?.INR;
      return validPrice(price) ? price : null;
    }

    function selectedVariantKey() {
      const color = $("product-color")?.value || "";
      const size = $("product-size")?.value || "";
      return color && size ? `${color}-${size}` : "";
    }

    const options = $("product-options");

    function addSelect(labelText, id, values) {
      if (!Array.isArray(values) || values.length === 0) return;

      const label = api.createElement("label", "option-field", labelText);
      const select = document.createElement("select");
      select.id = id;

      values.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.append(option);
      });

      label.append(select);
      options.append(label);
    }

    addSelect("Colour", "product-color", product.options?.colors);
    addSelect("Size", "product-size", product.options?.sizes);
    addSelect("Format", "product-format", product.options?.formats);

    const providerGrid = $("provider-comparison");
    const providerEmpty = $("provider-empty");

    function safeExternalUrl(value) {
      if (typeof value !== "string" || !value.trim()) return null;

      try {
        const url = new URL(value);

        if (url.protocol !== "https:" && url.protocol !== "http:") {
          return null;
        }

        return url.href;
      } catch {
        return null;
      }
    }

    function makeExternalLink(url, label) {
      const safeUrl = safeExternalUrl(url);

      if (!safeUrl) {
        const disabled = api.createElement(
          "button",
          "button button--outline",
          "Purchase link coming soon"
        );
        disabled.type = "button";
        disabled.disabled = true;
        return disabled;
      }

      const link = api.createElement("a", "button button--dark", label);
      link.href = safeUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      return link;
    }

    function renderProviders() {
      providerGrid.replaceChildren();

      const providers = Array.isArray(product.providers)
        ? product.providers
        : [];

      providerEmpty.hidden = providers.length > 0;

      providers.forEach(provider => {
        const card = api.createElement("article", "provider-card");

        const header = api.createElement("div", "provider-card__header");
        header.append(
          api.createElement("p", "eyebrow", "Purchase option"),
          api.createElement("h3", "provider-card__name", provider.name)
        );

        const price = getBasePrice(provider);
        const priceElement = api.createElement(
          "p",
          "provider-card__price",
          price === null
            ? "Price not configured"
            : api.formatPrice(price, "INR")
        );

        const priceNote = api.createElement(
          "p",
          "provider-card__note",
          price === null
            ? "A verified price has not been entered."
            : "Configured base price; shipping and taxes are not included unless stated."
        );

        const shipping = provider.shipping;
        const shippingText = shipping?.verified &&
          typeof shipping.description === "string" &&
          shipping.description.trim()
          ? shipping.description
          : "Shipping and taxes not verified / not calculated.";

        const shippingElement = api.createElement(
          "p",
          "provider-card__shipping",
          shippingText
        );

        const updated = api.createElement(
          "p",
          "provider-card__updated",
          provider.lastUpdated
            ? `Price last checked: ${provider.lastUpdated}`
            : "Price verification date not provided."
        );

        const variantKey = selectedVariantKey();
        const variant = variantKey
          ? provider.variants?.[variantKey]
          : null;

        const variantUrl = variant?.externalProductUrl || provider.externalProductUrl || "";
        const purchaseLink = makeExternalLink(
          variantUrl,
          "Shop externally ↗"
        );

        const checkoutUrl = safeExternalUrl(provider.checkoutUrl);
        const collectionUrl = safeExternalUrl(provider.collectionUrl);

        const extraLinks = api.createElement("div", "provider-card__extra-links");

        if (collectionUrl) {
          const collectionLink = api.createElement(
            "a",
            "text-link",
            "View provider collection"
          );
          collectionLink.href = collectionUrl;
          collectionLink.target = "_blank";
          collectionLink.rel = "noopener noreferrer";
          extraLinks.append(collectionLink);
        }

        if (checkoutUrl) {
          const checkoutLink = api.createElement(
            "a",
            "text-link",
            "Open configured checkout"
          );
          checkoutLink.href = checkoutUrl;
          checkoutLink.target = "_blank";
          checkoutLink.rel = "noopener noreferrer";
          extraLinks.append(checkoutLink);
        }

        card.append(
          header,
          priceElement,
          priceNote,
          shippingElement,
          updated,
          purchaseLink,
          extraLinks
        );

        providerGrid.append(card);
      });

      const configuredPrices = getProviderPrices();
      const productPrice = $("product-price");

      if (configuredPrices.length > 0) {
        const lowest = Math.min(...configuredPrices);
        productPrice.textContent =
          `Configured base prices from ${api.formatPrice(lowest, "INR")}`;
      } else {
        productPrice.textContent = "Prices not configured";
      }
    }

    // Keep provider links in sync with the selected colour and size.
    ["product-color", "product-size", "product-format"].forEach(id => {
      $(id)?.addEventListener("change", renderProviders);
    });

    $("add-to-cart").addEventListener("click", () => {
      const quantity = Number($("product-quantity").value);
      const feedback = $("cart-feedback");

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        feedback.textContent = "Choose a quantity between 1 and 20.";
        return;
      }

      const cart = api.readCart();
      const chosenOptions = {};

      ["product-color", "product-size", "product-format"].forEach(id => {
        const element = $(id);
        if (element) {
          const key = id.replace("product-", "");
          chosenOptions[key] = element.value;
        }
      });

      const existing = cart.find(item =>
        item.productId === product.id &&
        JSON.stringify(item.options || {}) === JSON.stringify(chosenOptions)
      );

      const currentQuantity = existing ? Number(existing.quantity) : 0;

      if (currentQuantity + quantity > 20) {
        feedback.textContent = "Maximum 20 of this selection per cart.";
        return;
      }

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          productId: product.id,
          quantity,
          options: chosenOptions
        });
      }

      try {
        localStorage.setItem("vorix-cart", JSON.stringify(cart));
        api.updateCartCount();
        feedback.textContent =
          "Added to your VORIX cart. No payment or order has been made.";
      } catch {
        feedback.textContent =
          "Your browser could not save the cart. Check browser storage settings.";
      }
    });

    renderProviders();
  });
})();
