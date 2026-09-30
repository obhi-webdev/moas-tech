"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [added, setAdded] = useState(false);

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

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1400);
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">

      {/* BADGES */}

      <div className="absolute left-0 top-3 z-10 flex flex-col items-start gap-1.5">

        {hasSalePrice && (
          <span className="rounded-r bg-[#6d28d9] px-2.5 py-1.5 text-[10px] font-bold text-white">
            Save ৳{formatPrice(discountAmount)}
          </span>
        )}

        {hasSalePrice && (
          <span className="rounded-r bg-orange-500 px-2.5 py-1 text-[9px] font-black text-white">
            -{discountPercent}%
          </span>
        )}

        {!hasSalePrice && product.isNewArrival && (
          <span className="rounded-r bg-blue-700 px-2.5 py-1.5 text-[10px] font-bold text-white">
            New Arrival
          </span>
        )}

        {!hasSalePrice &&
          !product.isNewArrival &&
          product.isOffer && (
            <span className="rounded-r bg-orange-500 px-2.5 py-1.5 text-[10px] font-bold text-white">
              Special Offer
            </span>
          )}

      </div>

      {/* IMAGE */}

      <Link
        href={`/product/${product.slug}`}
        className="relative block overflow-hidden bg-white"
      >
        <div className="flex h-[145px] items-center justify-center p-3 sm:h-[190px] sm:p-5 md:h-[220px] md:p-6">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded bg-slate-50 text-xs font-medium text-slate-400">
              No Image
            </div>
          )}
        </div>
      </Link>

      {/* INFORMATION */}

      <div className="flex flex-1 flex-col border-t border-slate-100 px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">

        {product.category && (
          <Link
            href={`/category/${product.category.slug}`}
            className="mb-1 w-fit text-[9px] font-bold uppercase tracking-wide text-slate-400 transition hover:text-orange-500 sm:mb-1.5 sm:text-[10px]"
          >
            {product.category.name}
          </Link>
        )}

        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[38px] text-[12px] font-bold leading-[19px] text-[#172337] transition group-hover:text-blue-700 sm:min-h-[44px] sm:text-[13px] sm:leading-[22px]">
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="mt-2 hidden line-clamp-2 text-[11px] leading-[18px] text-slate-500 sm:block">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-auto pt-2.5 sm:pt-4">

          {/* PRICE */}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[16px] font-black text-[#ef3f32] sm:text-lg">
              ৳{formatPrice(finalPrice)}
            </span>

            {hasSalePrice && (
              <span className="text-[10px] font-semibold text-slate-400 line-through sm:text-xs">
                ৳{formatPrice(product.regularPrice)}
              </span>
            )}
          </div>

          {/* STOCK */}

          <div className="mt-1.5 flex items-center justify-between gap-1 sm:mt-2 sm:gap-2">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-500">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Out of Stock
              </span>
            )}

            {product.brand && (
              <span className="max-w-[90px] truncate text-[10px] font-semibold text-slate-400">
                {product.brand}
              </span>
            )}
          </div>

          {/* ACTIONS */}

          <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-1.5 sm:mt-3 sm:gap-2">
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
              className={`rounded-md px-2 py-2 text-[10px] font-bold text-white transition sm:px-3 sm:py-2.5 sm:text-[11px] ${
                added
                  ? "bg-green-600"
                  : "bg-[#075eb4] hover:bg-[#064f96]"
              } disabled:cursor-not-allowed disabled:bg-slate-300`}
            >
              {product.stock <= 0
                ? "Out of Stock"
                : added
                  ? "Added ✓"
                  : "Add to Cart"}
            </button>

            <Link
              href={`/product/${product.slug}`}
              aria-label={`View ${product.name}`}
              className="flex min-w-9 items-center justify-center rounded-md border border-slate-200 px-2 text-sm font-bold text-slate-600 transition sm:min-w-10 sm:px-3 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-500"
            >
              →
            </Link>
          </div>

        </div>
      </div>
    </article>
  );
}
