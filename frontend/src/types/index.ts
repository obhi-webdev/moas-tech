export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;

  category:
    | string
    | {
        _id: string;
        name: string;
        slug: string;
      };

  brand?: string;
  images: string[];

  regularPrice: number;
  salePrice?: number | null;
  stock: number;

  shortDescription?: string;
  description?: string;
  specifications?: ProductSpecification[];

  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOffer: boolean;

  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface SiteSettings {
  _id?: string;
  siteName: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address?: string;

  deliveryChargeInside: number;
  deliveryChargeOutside: number;

  facebook?: string;
  logo?: string;

  primaryColor?: string;
  secondaryColor?: string;
}
