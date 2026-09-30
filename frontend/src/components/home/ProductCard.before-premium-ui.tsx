"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  brand?: string;
  images: string[];
  regularPrice: number;
  salePrice?: number | null;
  stock: number;
  shortDescription?: string;
  description?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isOffer?: boolean;
  sortOrder?: number;

  category?: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface ProductCardProps {
  product: Product;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-BD").format(price);
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const { addToCart } = useCart();

  const hasSalePrice =
    product.salePrice !== null &&
    product.salePrice !== undefined &&
    product.salePrice > 0 &&
    product.salePrice < product.regularPrice;

  const finalPrice = hasSalePrice
    ? product.salePrice!
    : product.regularPrice;

  const productImage =
    product.images?.length > 0
      ? product.images[0]
      : null;

  const discountAmount = hasSalePrice
    ? product.regularPrice - finalPrice
    : 0;

  const discountPercent = hasSalePrice
    ? Math.round(
        ((product.regularPrice - finalPrice) /
          product.regularPrice) *
          100,
      )
    : 0;

  function handleAddToCart() {
    if (product.stock <= 0) return;

    addToCart(
      {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: productImage || undefined,
        price: finalPrice,
        regularPrice: product.regularPrice,
        stock: product.stock,
      },
      1,
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white transition duration-200 hover:shadow-lg">
      {/* BADGES */}
      <div className="absolute left-0 top-3 z-10 flex flex-col items-start gap-1">
        {hasSalePrice && (
          <span className="rounded-r-md bg-purple-700 px-2.5 py-1 text-[10px] font-bold text-white">
            Save: ৳{formatPrice(discountAmount)} (-{discountPercent}%)
          </span>
        )}

        {!hasSalePrice && product.isNewArrival && (
          <span className="rounded-r-md bg-blue-700 px-2.5 py-1 text-[10px] font-bold text-white">
            New Arrival
          </span>
        )}

        {!hasSalePrice &&
          !product.isNewArrival &&
          product.isOffer && (
            <span className="rounded-r-md bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white">
              Special Offer
            </span>
          )}
      </div>

      {/* IMAGE */}
      <Link
        href={`/product/${product.slug}`}
        className="block"
      >
        <div className="flex aspect-[1.12/1] items-center justify-center overflow-hidden bg-white p-4">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-50 text-xs text-slate-400">
              No Image
            </div>
          )}
        </div>
      </Link>

      {/* INFO */}
      <div className="flex flex-1 flex-col border-t border-slate-100 p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[44px] text-sm font-semibold leading-[22px] text-slate-900 transition hover:text-blue-700">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {product.brand}
          </p>
        )}

        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-lg font-black text-red-600">
              ৳{formatPrice(finalPrice)}
            </span>

            {hasSalePrice && (
              <span className="text-xs font-medium text-slate-400 line-through">
                ৳{formatPrice(product.regularPrice)}
              </span>
            )}
          </div>

          <div className="mt-2">
            {product.stock > 0 ? (
              <span className="text-[11px] font-semibold text-green-600">
                In Stock
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-red-500">
                Out of Stock
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
              className="rounded-md bg-blue-700 px-2 py-2.5 text-xs font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Add to Cart
            </button>

            <Link
              href={`/product/${product.slug}`}
              className="rounded-md border border-slate-200 px-2 py-2.5 text-center text-xs font-bold text-slate-700 transition hover:border-orange-400 hover:text-orange-500"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
