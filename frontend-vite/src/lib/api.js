const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5003/api";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5003";
async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  if (!response.ok) {
    let message = "Something went wrong";
    try {
      const data = await response.json();
      if (Array.isArray(data?.message)) {
        message = data.message.join(", ");
      } else if (data?.message) {
        message = data.message;
      }
    } catch {
    }
    throw new Error(message);
  }
  return response.json();
}
async function getCategories() {
  return request("/categories");
}
async function getProducts(query = "") {
  const endpoint = query ? `/products?${query}` : "/products";
  const response = await request(endpoint);
  if (Array.isArray(response)) {
    return { products: response, pagination: null };
  }
  return response;
}
async function getProductBySlug(slug) {
  return request(
    `/products/${encodeURIComponent(slug)}`
  );
}
async function getSettings() {
  return request("/settings");
}
function getImageUrl(image) {
  if (!image) {
    return "/placeholder-product.svg";
  }
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  if (image.startsWith("/")) {
    return `${BACKEND_URL}${image}`;
  }
  return `${BACKEND_URL}/${image}`;
}
function formatPrice(price) {
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0
  }).format(price);
}
export {
  API_URL,
  BACKEND_URL,
  formatPrice,
  getCategories,
  getImageUrl,
  getProductBySlug,
  getProducts,
  getSettings
};
