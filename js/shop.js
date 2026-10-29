
/* VORIX SHOP — search, category filters and sorting */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const api = window.VORIX;

    if (!api) return;

    const grid = document.getElementById("shop-products");
    const search = document.getElementById("product-search");
    const category = document.getElementById("category-filter");
    const sort = document.getElementById("sort-products");
    const count = document.getElementById("results-count");
    const clear = document.getElementById("clear-filters");

    if (!grid || !search || !category || !sort || !count || !clear) return;

    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    const validCategories = ["apparel", "wall-art", "digital"];

    if (validCategories.includes(requestedCategory)) {
      category.value = requestedCategory;
    }

    function getConfiguredBasePrice(product) {
      // A design with multiple providers has no single price unless
      // a provider price is configured. We sort by the lowest configured
      // provider base price, not an invented delivered price.
      const prices = (product.providers || [])
        .map(provider => provider.prices?.INR)
        .filter(price =>
          typeof price === "number" &&
          Number.isFinite(price) &&
          price >= 0
        );

      if (prices.length) return Math.min(...prices);

      return typeof product.price === "number" &&
        Number.isFinite(product.price) &&
        product.price >= 0
        ? product.price
        : null;
    }

    function render() {
      const term = search.value.trim().toLocaleLowerCase("en");
      const selectedCategory = category.value;

      let results = api.products.filter(product => {
        const matchesCategory =
          selectedCategory === "all" ||
          product.category === selectedCategory;

        const searchableText = [
          product.name,
          product.description,
          product.category,
          product.productType,
          ...(product.providers || []).map(provider => provider.name)
        ].join(" ").toLocaleLowerCase("en");

        return matchesCategory && searchableText.includes(term);
      });

      switch (sort.value) {
        case "name-asc":
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;

        case "price-asc":
          results.sort((a, b) => {
            const ap = getConfiguredBasePrice(a);
            const bp = getConfiguredBasePrice(b);

            if (ap === null && bp === null) return a.name.localeCompare(b.name);
            if (ap === null) return 1;
            if (bp === null) return -1;
            return ap - bp;
          });
          break;

        case "price-desc":
          results.sort((a, b) => {
            const ap = getConfiguredBasePrice(a);
            const bp = getConfiguredBasePrice(b);

            if (ap === null && bp === null) return a.name.localeCompare(b.name);
            if (ap === null) return 1;
            if (bp === null) return -1;
            return bp - ap;
          });
          break;

        case "featured":
        default:
          results.sort((a, b) =>
            Number(Boolean(b.featured)) - Number(Boolean(a.featured))
          );
          break;
      }

      api.renderProducts(grid, results);
      count.textContent =
        `${results.length} ${results.length === 1 ? "design" : "designs"} found`;
    }

    search.addEventListener("input", render);
    category.addEventListener("change", render);
    sort.addEventListener("change", render);

    clear.addEventListener("click", () => {
      search.value = "";
      category.value = "all";
      sort.value = "featured";

      const url = new URL(window.location.href);
      url.searchParams.delete("category");
      window.history.replaceState({}, "", url);
      render();
      search.focus();
    });

    render();
  });
})();
