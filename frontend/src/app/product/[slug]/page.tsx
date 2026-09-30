"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import Header from "@/components/home/Header";
import ProductCard, { type Product } from "@/components/home/ProductCard";
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
  const router = useRouter();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [relatedProducts, setRelatedProducts] =
    useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPosition, setZoomPosition] = useState("50% 50%");
  const [isZooming, setIsZooming] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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

  useEffect(() => {
    if (!product) {
      setRelatedProducts([]);
      return;
    }

    const currentProduct = product;
    const categoryId = currentProduct.category?._id;

    if (!categoryId) {
      setRelatedProducts([]);
      return;
    }

    async function loadRelatedProducts() {
      try {
        setRelatedLoading(true);

        const params = new URLSearchParams();

        params.set("category", categoryId!);
        params.set("limit", "6");
        params.set("sort", "newest");

        const response = await fetch(
          `${API_URL}/products?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Related products could not be loaded.",
          );
        }

        const data = await response.json();

        const items: Product[] =
          Array.isArray(data?.products)
            ? data.products
            : [];

        setRelatedProducts(
          items
            .filter(
              (item) =>
                item._id !== currentProduct._id,
            )
            .slice(0, 5),
        );
      } catch (error) {
        console.error(
          "Related products loading error:",
          error,
        );

        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    }

    loadRelatedProducts();
  }, [product]);

  function handleImageMouseMove(
    event: React.MouseEvent<HTMLDivElement>,
  ) {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width) * 100;

    const y =
      ((event.clientY - rect.top) / rect.height) * 100;

    setZoomPosition(`${x}% ${y}%`);
  }

  function handleImageMouseEnter() {
    if (
      window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches
    ) {
      setIsZooming(true);
    }
  }

  function handleImageMouseLeave() {
    setIsZooming(false);
    setZoomPosition("50% 50%");
  }

  function showPreviousImage() {
    if (!product?.images?.length) return;

    setSelectedImage((current) =>
      current === 0
        ? product.images.length - 1
        : current - 1,
    );
  }

  function showNextImage() {
    if (!product?.images?.length) return;

    setSelectedImage((current) =>
      current === product.images.length - 1
        ? 0
        : current + 1,
    );
  }

  function handleTouchStart(
    event: React.TouchEvent<HTMLDivElement>,
  ) {
    touchEndX.current = null;
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchMove(
    event: React.TouchEvent<HTMLDivElement>,
  ) {
    touchEndX.current = event.touches[0].clientX;
  }

  function handleTouchEnd() {
    if (
      touchStartX.current === null ||
      touchEndX.current === null
    ) {
      return;
    }

    const distance =
      touchStartX.current - touchEndX.current;

    const minimumSwipeDistance = 50;

    if (distance > minimumSwipeDistance) {
      showNextImage();
    }

    if (distance < -minimumSwipeDistance) {
      showPreviousImage();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  useEffect(() => {
    if (!product?.images || product.images.length <= 1) {
      return;
    }

    function handleGalleryKeyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
    }

    window.addEventListener(
      "keydown",
      handleGalleryKeyboard,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleGalleryKeyboard,
      );
    };
  }, [product]);

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

  function handleBuyNow() {
    if (!product || product.stock <= 0) return;

    const hasSale =
      product.salePrice !== null &&
      product.salePrice !== undefined &&
      product.salePrice < product.regularPrice;

    const currentPrice = hasSale
      ? product.salePrice!
      : product.regularPrice;

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

    router.push("/checkout");
  }

  if (loading) {
    return (
      <>
        <Header phone="01614106550" whatsapp="01614106550" />

        <main className="min-h-screen bg-[#f1f3f6]">
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

        <main className="min-h-screen bg-[#f1f3f6]">
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

      <main className="min-h-screen bg-[#f1f3f6]">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          {/* Breadcrumb */}

          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
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

          <div className="grid gap-7 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
            {/* Product Images */}

            <div className="min-w-0">
              {/* Main Image */}

              <div
                className="group relative flex aspect-square touch-pan-y select-none items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white"
                onMouseEnter={handleImageMouseEnter}
                onMouseMove={handleImageMouseMove}
                onMouseLeave={handleImageMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {image ? (
                  <img
                    key={image}
                    src={image}
                    alt={product.name}
                    style={{
                      transformOrigin: zoomPosition,
                      transform: isZooming
                        ? "scale(1.65)"
                        : "scale(1)",
                    }}
                    className="product-gallery-image h-full w-full object-contain p-5 transition-transform duration-300 ease-out md:p-7"
                  />
                ) : (
                  <span className="text-sm text-slate-400">
                    No product image
                  </span>
                )}

                {/* Product Badges */}

                <div className="absolute left-3 top-3 flex flex-wrap gap-2 md:left-4 md:top-4">
                  {product.isOffer && (
                    <span className="rounded-md bg-orange-500 px-2.5 py-1 text-[10px] font-black tracking-wide text-white shadow-sm md:px-3 md:py-1.5 md:text-xs">
                      OFFER
                    </span>
                  )}

                  {product.isNewArrival && (
                    <span className="rounded-md bg-blue-700 px-2.5 py-1 text-[10px] font-black tracking-wide text-white shadow-sm md:px-3 md:py-1.5 md:text-xs">
                      NEW
                    </span>
                  )}
                </div>

                {/* Gallery Navigation */}

                {product.images &&
                  product.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={showPreviousImage}
                        aria-label="Previous product image"
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-lg font-bold text-slate-700 opacity-100 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-orange-400 hover:bg-orange-500 hover:text-white active:scale-95 md:left-4 md:opacity-0 md:group-hover:opacity-100"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        onClick={showNextImage}
                        aria-label="Next product image"
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-lg font-bold text-slate-700 opacity-100 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-orange-400 hover:bg-orange-500 hover:text-white active:scale-95 md:right-4 md:opacity-0 md:group-hover:opacity-100"
                      >
                        ›
                      </button>
                    </>
                  )}

                {/* Image Counter */}

                {product.images &&
                  product.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/75 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                      {selectedImage + 1} /{" "}
                      {product.images.length}
                    </div>
                  )}
              </div>

              {/* Thumbnail Gallery */}

              {product.images &&
                product.images.length > 1 && (
                  <div className="mt-3 overflow-x-auto pb-1">
                    <div className="flex min-w-max gap-2.5">
                      {product.images.map(
                        (item, index) => (
                          <button
                            key={`${item}-${index}`}
                            type="button"
                            onClick={() =>
                              setSelectedImage(index)
                            }
                            aria-label={`View product image ${
                              index + 1
                            }`}
                            className={`group/thumb relative flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-white transition-all duration-200 sm:h-[76px] sm:w-[76px] ${
                              selectedImage === index
                                ? "border-orange-500 shadow-sm ring-2 ring-orange-100"
                                : "border-slate-200 hover:border-orange-300 hover:shadow-sm"
                            }`}
                          >
                            <img
                              src={item}
                              alt={`${product.name} ${
                                index + 1
                              }`}
                              className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover/thumb:scale-110"
                            />

                            {selectedImage ===
                              index && (
                              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {product.images &&
                product.images.length > 1 && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    Select an image to view
                  </p>
                )}
            </div>

            {/* Product Information */}

            <div className="flex flex-col">
              {product.brand && (
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  {product.brand}
                </p>
              )}

              <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                {product.name}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>SKU: {product.sku}</span>

                {product.category && (
                  <>
                    <span>•</span>

                    <span>{product.category.name}</span>
                  </>
                )}
              </div>

              {/* Price */}

              <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-slate-100 py-5">
                <span className="text-3xl font-black text-red-600">
                  ৳{formatPrice(price)}
                </span>

                {hasSale && (
                  <span className="text-sm font-medium text-slate-400 line-through">
                    ৳{formatPrice(product.regularPrice)}
                  </span>
                )}
              </div>

              {/* Stock */}

              <div className="mt-4">
                {product.stock > 0 ? (
                  <span className="inline-flex rounded-md bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                    In Stock — {product.stock} available
                  </span>
                ) : (
                  <span className="inline-flex rounded-md bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Short Description */}

              {product.shortDescription && (
                <p className="mt-5 text-sm leading-7 text-slate-600">
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

                    <div className="inline-flex overflow-hidden rounded-md border border-slate-300">
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
                      className="flex-1 rounded-md bg-blue-700 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800"
                    >
                      {added ? "Added to Cart ✓" : "Add to Cart"}
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="flex-1 rounded-md bg-orange-500 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600"
                    >
                      Buy Now
                    </button>

                    {added && (
                      <Link
                        href="/cart"
                        className="flex-1 rounded-md border border-slate-300 px-7 py-3.5 text-center text-sm font-bold text-slate-700 transition hover:border-orange-500 hover:text-orange-500"
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
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-xl font-bold text-slate-900">
                Product Description
              </h2>

              <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
                {product.description}
              </p>
            </section>
          )}

          {/* Specifications */}

          {product.specifications && product.specifications.length > 0 && (
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-xl font-bold text-slate-900">
                Specifications
              </h2>

              <div className="mt-5 overflow-hidden rounded-md border border-slate-200">
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

          {/* Related Products */}

          {(relatedLoading ||
            relatedProducts.length > 0) && (
            <section className="mt-8">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">
                    You May Also Like
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-900 md:text-2xl">
                    Related Products
                  </h2>
                </div>

                {product.category && (
                  <Link
                    href={`/category/${product.category.slug}`}
                    className="hidden text-sm font-bold text-blue-700 transition hover:text-orange-500 sm:block"
                  >
                    View All →
                  </Link>
                )}
              </div>

              {relatedLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {Array.from({
                    length: 5,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-md border border-slate-200 bg-white"
                    >
                      <div className="h-[135px] animate-pulse bg-slate-100 sm:h-[165px]" />

                      <div className="space-y-3 p-3">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />

                        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

                        <div className="h-9 animate-pulse rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {relatedProducts.map(
                    (relatedProduct) => (
                      <ProductCard
                        key={
                          relatedProduct._id
                        }
                        product={
                          relatedProduct
                        }
                      />
                    ),
                  )}
                </div>
              )}

              {product.category && (
                <Link
                  href={`/category/${product.category.slug}`}
                  className="mt-5 flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-500 sm:hidden"
                >
                  View All Related Products →
                </Link>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
