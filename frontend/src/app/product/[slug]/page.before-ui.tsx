"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Header from "@/components/home/Header";
import type { Product } from "@/components/home/ProductCard";
import { useCart } from "@/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface Specification {
  key: string;
  value: string;
}

interface ProductDetails extends Product {
  description?: string;
  specifications?: Specification[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-BD").format(price);
}

export default function ProductDetailsPage() {
  const params = useParams();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products/${slug}`);

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data: ProductDetails = await response.json();

        setProduct(data);
      } catch (err) {
        console.error("Product loading error:", err);

        setError("Product could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  function increaseQuantity() {
    if (!product) return;

    setQuantity((current) => Math.min(current + 1, product.stock));

    setAdded(false);
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));

    setAdded(false);
  }

  function handleAddToCart() {
    if (!product) return;

    const hasSale =
      product.salePrice !== null &&
      product.salePrice !== undefined &&
      product.salePrice < product.regularPrice;

    const currentPrice = hasSale ? product.salePrice! : product.regularPrice;

    addToCart(
      {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: product.images?.[0],
        price: currentPrice,
        regularPrice: product.regularPrice,
        stock: product.stock,
      },
      quantity,
    );

    setAdded(true);
  }

  if (loading) {
    return (
      <>
        <Header phone="01614106550" whatsapp="01614106550" />

        <main className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="rounded-2xl bg-white p-10 text-slate-500">
              Loading product...
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header phone="01614106550" whatsapp="01614106550" />

        <main className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10">
              <h1 className="text-2xl font-bold text-red-700">
                Product not found
              </h1>

              <p className="mt-2 text-red-600">{error}</p>

              <Link
                href="/shop"
                className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
              >
                Back to Shop
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const hasSale =
    product.salePrice !== null &&
    product.salePrice !== undefined &&
    product.salePrice < product.regularPrice;

  const price = hasSale ? product.salePrice! : product.regularPrice;

  const image = product.images?.[selectedImage];

  return (
    <>
      <Header phone="01614106550" whatsapp="01614106550" />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Breadcrumb */}

          <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">
              Home
            </Link>

            <span>/</span>

            {product.category && (
              <>
                <Link
                  href={`/category/${product.category.slug}`}
                  className="hover:text-blue-700"
                >
                  {product.category.name}
                </Link>

                <span>/</span>
              </>
            )}

            <span className="text-slate-800">{product.name}</span>
          </div>

          {/* Main Product */}

          <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-5 md:p-8 lg:grid-cols-2">
            {/* Product Images */}

            <div>
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="h-full w-full object-contain p-8"
                  />
                ) : (
                  <span className="text-slate-400">No product image</span>
                )}

                <div className="absolute left-4 top-4 flex gap-2">
                  {product.isOffer && (
                    <span className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-bold text-white">
                      OFFER
                    </span>
                  )}

                  {product.isNewArrival && (
                    <span className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-bold text-white">
                      NEW
                    </span>
                  )}
                </div>
              </div>

              {product.images && product.images.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {product.images.map((item, index) => (
                    <button
                      key={`${item}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`h-20 w-20 overflow-hidden rounded-xl border bg-white ${
                        selectedImage === index
                          ? "border-blue-700"
                          : "border-slate-200"
                      }`}
                    >
                      <img
                        src={item}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}

            <div className="flex flex-col justify-center">
              {product.brand && (
                <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
                  {product.brand}
                </p>
              )}

              <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                {product.name}
              </h1>

              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                <span>SKU: {product.sku}</span>

                {product.category && (
                  <>
                    <span>•</span>

                    <span>{product.category.name}</span>
                  </>
                )}
              </div>

              {/* Price */}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-bold text-blue-700">
                  ৳{formatPrice(price)}
                </span>

                {hasSale && (
                  <span className="text-lg text-slate-400 line-through">
                    ৳{formatPrice(product.regularPrice)}
                  </span>
                )}
              </div>

              {/* Stock */}

              <div className="mt-5">
                {product.stock > 0 ? (
                  <span className="inline-flex rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
                    In Stock — {product.stock} available
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Short Description */}

              {product.shortDescription && (
                <p className="mt-6 leading-7 text-slate-600">
                  {product.shortDescription}
                </p>
              )}

              {/* Quantity + Cart */}

              {product.stock > 0 && (
                <>
                  <div className="mt-7">
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Quantity
                    </p>

                    <div className="inline-flex overflow-hidden rounded-lg border border-slate-300">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="h-11 w-11 text-xl hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>

                      <div className="flex h-11 min-w-12 items-center justify-center border-x border-slate-300 font-semibold">
                        {quantity}
                      </div>

                      <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={quantity >= product.stock}
                        className="h-11 w-11 text-xl hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Maximum {product.stock} item
                      {product.stock !== 1 ? "s" : ""} available
                    </p>
                  </div>

                  {/* Add To Cart */}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="rounded-xl bg-blue-700 px-7 py-4 font-bold text-white transition hover:bg-blue-800"
                    >
                      {added ? "Added to Cart ✓" : "Add to Cart"}
                    </button>

                    {added && (
                      <Link
                        href="/cart"
                        className="rounded-xl border border-blue-700 px-7 py-4 text-center font-bold text-blue-700 transition hover:bg-blue-50"
                      >
                        View Cart
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}

          {product.description && (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Product Description
              </h2>

              <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
                {product.description}
              </p>
            </section>
          )}

          {/* Specifications */}

          {product.specifications && product.specifications.length > 0 && (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Specifications
              </h2>

              <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
                {product.specifications.map((spec, index) => (
                  <div
                    key={`${spec.key}-${index}`}
                    className="grid grid-cols-1 border-b border-slate-200 last:border-b-0 sm:grid-cols-[220px_1fr]"
                  >
                    <div className="bg-slate-50 px-5 py-4 font-semibold text-slate-700">
                      {spec.key}
                    </div>

                    <div className="px-5 py-4 text-slate-600">{spec.value}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
