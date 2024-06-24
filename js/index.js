const BASE = "https://fakestoreapi.com/";
const CATEGORIES = "products/categories";
const CATEGORY = "products/category";

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

async function fetchData(url) {
  try {
    const response = await fetch(`${BASE}${url}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

async function getProducts(category) {
  try {
    const products = await fetchData(`${CATEGORY}/${category}`);
    return products;
  } catch (error) {}
}

function displayProducts(products) {
  const allProductsContainer = document.getElementById("all-products");
  const total = document.getElementById("total-result");
  let productItemHTML = "";
  total.innerText = `${products?.length} Results`;

  products.forEach((product) => {
    productItemHTML += `
        <div class="product-container">
           <div>
              <img title="${product.title}" src="${product.image}" role="presentation" />
           </div>
           <div>
              <h3>${product.title}</h3>
              <p>${product.description}</p>
              <p>$${product.price}</p>
           </div>
        </div>
     `;
  });

  allProductsContainer.innerHTML = productItemHTML;
}

async function getCategories() {
  try {
    const categories = await fetchData(CATEGORIES);
    return categories;
  } catch (error) {
    // todo error
  }
}

function displayCategories(categories) {
  const categoriesContainer = document.getElementById("categoriesContainer");
  categoriesContainer.innerHTML = "";

  categories.forEach((category) => {
    const checkbox = document.createElement("input");
    checkbox.type = "radio";
    checkbox.name = "categories";
    checkbox.value = category;
    checkbox.id = category;

    const title = document.createElement("span");
    title.innerText = category;

    const label = document.createElement("label");
    label.htmlFor = category;
    label.appendChild(title);
    label.appendChild(checkbox);

    categoriesContainer.appendChild(label);
  });
}

function closeMenu(state) {
  const menu = document.getElementById("menu-sidebar");
  menu.ariaHidden = state;
  menu.hidden = state;
}

(() => {
  (async () => {
    const products = await getProducts(`men's clothing`);
    displayProducts(products);
    document.getElementById("category-title").innerText = `Men's Clothing`;
    const categories = await getCategories();
    displayCategories(categories);
  })();

  document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.getElementById("menu-button");
    const menuCloseButton = document.getElementById("menu-close-button");
    const categoryForm = document.getElementById("category-form");
    const searchForm = document.getElementById("search-input");

    menuCloseButton.addEventListener("click", () => closeMenu(true));

    menuButton.addEventListener("click", async () => {
      const menu = document.getElementById("menu-sidebar");
      const isTrue = menu.hidden;
      menu.ariaHidden = !isTrue;
      menu.hidden = !isTrue;
      if (isTrue) {
        const categories = await getCategories();
        displayCategories(categories);
      }
    });

    categoryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const category = formData.get("categories");

      document.getElementById("category-title").innerText = category;
      closeMenu(true);
      const products = await getProducts(category);
      displayProducts(products);
    });

    async function handleSearchInput(event) {
      const search = event.target.value.toLowerCase();
      const category = document
        .getElementById("category-title")
        .innerText?.toLowerCase();
      const products = await getProducts(category);

      const searchedProducts = products.filter((product) =>
        product.title.toLowerCase().includes(search)
      );

      displayProducts(searchedProducts);
    }

    const delayedInput = debounce(handleSearchInput, 500);

    searchForm.addEventListener("input", delayedInput);
  });

  let isToggle = true;

  const sortByPriceButton = document.getElementById("sort-by-price");

  sortByPriceButton.addEventListener("click", async () => {
    isToggle = !isToggle;
    const category = document
      .getElementById("category-title")
      .innerText?.toLowerCase();
    const products = await getProducts(category);
    if (!products?.length) {
      return;
    }
    const sortedByPrice = !isToggle
      ? products.sort((a, b) => a.price - b.price)
      : products.sort((a, b) => b.price - a.price);

    displayProducts(sortedByPrice);
    closeMenu(true);
  });

  const sortButton = document.getElementById("sort-button");
  sortButton.addEventListener("click", () => {
    closeMenu(false);
  });
})();
