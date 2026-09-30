import type {
  Category,
  Product,
  ProductListResponse,
  SiteSettings,
} from "@/types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
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
      // Ignore JSON parsing errors.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export async function getProducts(
  query = "",
): Promise<ProductListResponse> {
  const endpoint = query
    ? `/products?${query}`
    : "/products";

  return request<ProductListResponse>(endpoint);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product> {
  return request<Product>(
    `/products/${encodeURIComponent(slug)}`,
  );
}

export async function getSettings(): Promise<SiteSettings> {
  return request<SiteSettings>("/settings");
}

export function getImageUrl(image?: string): string {
  if (!image) {
    return "/placeholder-product.svg";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${BACKEND_URL}${image}`;
  }

  return `${BACKEND_URL}/${image}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(price);
}
