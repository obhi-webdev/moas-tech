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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-lg md:hover:-translate-y-1">

      {/* IMAGE AREA */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block bg-[#fafafa]"
      >
        {/* BADGES */}
        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {hasSalePrice && (
            <>
              <span className="rounded-md bg-violet-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                Save ৳{formatPrice(discountAmount)}
              </span>

              <span className="rounded-md bg-orange-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                -{discountPercent}%
              </span>
            </>
          )}

          {!hasSalePrice && product.isNewArrival && (
            <span className="rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white">
              New Arrival
            </span>
          )}

          {!hasSalePrice &&
            !product.isNewArrival &&
            product.isOffer && (
              <span className="rounded-md bg-orange-500 px-2.5 py-1 text-[10px] font-semibold text-white">
                Special Offer
              </span>
            )}
        </div>

        <div className="flex h-[150px] w-full items-center justify-center p-2 sm:h-[190px] sm:p-3">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-400">
              No Image
            </div>
          )}
        </div>
      </Link>

      {/* PRODUCT INFORMATION */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-3 sm:px-4 sm:pb-3">

        {/* CATEGORY */}
        {product.category && (
          <Link
            href={`/category/${product.category.slug}`}
            className="mb-1.5 w-fit text-[9px] sm:mb-2 sm:text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 transition-colors hover:text-orange-500"
          >
            {product.category.name}
          </Link>
        )}

        {/* TITLE */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[38px] text-[13px] font-semibold leading-[19px] sm:min-h-[44px] sm:text-[15px] sm:leading-[22px] text-slate-900 transition-colors group-hover:text-orange-500">
            {product.name}
          </h3>
        </Link>

        {/* SHORT DESCRIPTION */}
        {product.shortDescription && (
          <p className="mt-1.5 hidden overflow-hidden text-[12px] font-normal leading-[18px] text-slate-500 sm:[display:-webkit-box] sm:[-webkit-box-orient:vertical] sm:[-webkit-line-clamp:2]">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-auto pt-2">

          {/* PRICE */}
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[17px] font-bold tracking-tight text-[#ef3f32] sm:text-xl">
              ৳{formatPrice(finalPrice)}
            </span>

            {hasSalePrice && (
              <span className="text-xs font-medium text-slate-400 line-through">
                ৳{formatPrice(product.regularPrice)}
              </span>
            )}
          </div>

          {/* STOCK + BRAND */}
          <div className="mt-2 flex min-h-5 items-center justify-between gap-3">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-emerald-600 sm:text-[11px]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-red-500 sm:text-[11px]">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Out of Stock
              </span>
            )}

            {product.brand && (
              <span className="max-w-[70px] truncate text-[9px] font-semibold text-slate-400 sm:max-w-[110px] sm:text-[11px]">
                {product.brand}
              </span>
            )}
          </div>

          {/* ACTIONS */}
          <div className="mt-2.5 grid grid-cols-[1fr_38px] gap-1.5 sm:mt-2.5 sm:grid-cols-[1fr_44px] sm:gap-2">
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
              className={`h-9 rounded-lg px-2 text-[10px] font-semibold sm:h-11 sm:px-4 sm:text-[12px] text-white transition-all duration-200 active:scale-[0.98] ${
                added
                  ? "bg-emerald-600"
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
              className="flex h-9 items-center justify-center rounded-lg sm:h-11 border border-slate-200 text-lg font-medium text-slate-600 transition-all hover:border-orange-400 hover:bg-orange-50 hover:text-orange-500"
            >
              →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
