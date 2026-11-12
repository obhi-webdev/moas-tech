import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL, getImageUrl, formatPrice } from "../lib/api";
import { useCart } from "../context/CartContext";

const buttonStyle =
  "inline-flex items-center justify-center rounded-xl bg-orange-500 px-7 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600";

function safeLink(value) {
  if (!value) return "#order";

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  if (value.startsWith("#")) {
    return value;
  }

  try {
    const url = new URL(value);
    if (["https:", "http:"].includes(url.protocol)) {
      return url.href;
    }
  } catch {
    // Invalid links fall back to the order section.
  }

  return "#order";
}

function Section({ section, index }) {
  const { type, heading, body, imageUrl, buttonText, buttonUrl } = section;
  const image = imageUrl ? getImageUrl(imageUrl) : "";
  const link = safeLink(buttonUrl);

  if (type === "hero") {
    return (
      <section className="overflow-hidden bg-gradient-to-br from-[#071724] via-[#112d3e] to-[#1b2933] text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div>
            <span className="rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-300">
              VC Tech Exclusive
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              {heading || "Discover Something Amazing"}
            </h1>

            {body && (
              <p className="mt-6 whitespace-pre-line text-lg leading-8 text-slate-300">
                {body}
              </p>
            )}

            <a href={link} className={`${buttonStyle} mt-8`}>
              {buttonText || "Order Now"}
            </a>
          </div>

          {image && (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl">
              <img
                src={image}
                alt={heading || "Landing page hero"}
                className="aspect-square w-full rounded-2xl object-cover"
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  if (type === "image") {
    return (
      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        {heading && (
          <h2 className="mb-7 text-center text-3xl font-black text-slate-900">
            {heading}
          </h2>
        )}

        {image && (
          <img
            src={image}
            alt={heading || "Product showcase"}
            className="mx-auto max-h-[650px] w-full rounded-3xl object-contain shadow-lg"
            loading="lazy"
          />
        )}

        {body && (
          <p className="mt-6 whitespace-pre-line text-center text-slate-600">
            {body}
          </p>
        )}
      </section>
    );
  }

  if (type === "cta") {
    return (
      <section className="bg-[#071724] px-5 py-16 text-center text-white">
        <h2 className="text-3xl font-black md:text-4xl">
          {heading || "Ready to Order?"}
        </h2>

        {body && (
          <p className="mx-auto mt-4 max-w-2xl whitespace-pre-line text-slate-300">
            {body}
          </p>
        )}

        <a href={link} className={`${buttonStyle} mt-7`}>
          {buttonText || "Buy Now"}
        </a>
      </section>
    );
  }

  return (
    <section className={index % 2 ? "bg-white" : "bg-slate-50"}>
      <div className="mx-auto max-w-5xl px-5 py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
            {type}
          </span>

          {heading && (
            <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">
              {heading}
            </h2>
          )}

          {body && (
            <p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-600">
              {body}
            </p>
          )}
        </div>

        {image && (
          <img
            src={image}
            alt={heading || type}
            loading="lazy"
            className="mx-auto mt-8 max-h-[480px] w-full rounded-2xl object-contain"
          />
        )}

        {buttonText && (
          <div className="mt-8 text-center">
            <a href={link} className={buttonStyle}>
              {buttonText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();

  const [page, setPage] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      setPage(null);
      setProduct(null);

      try {
        const response = await fetch(
          `${API_URL}/landing-pages/${encodeURIComponent(slug)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "This landing page is unavailable."
              : "Unable to load landing page."
          );
        }

        const result = await response.json();

        if (!active) return;

        const landingPage = result.page;
        setPage(landingPage);

        if (landingPage?.productId) {
          const productId =
            typeof landingPage.productId === "object"
              ? landingPage.productId._id
              : landingPage.productId;

          const productResponse = await fetch(
            `${API_URL}/products/by-id/${encodeURIComponent(productId)}`,
            { cache: "no-store" }
          );

          if (productResponse.ok) {
            const linkedProduct = await productResponse.json();

            if (active) {
              setProduct(linkedProduct);
            }
          }
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (slug) load();

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!page) return;

    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content");

    document.title = page.seoTitle || page.title || "VC Tech";

    if (description) {
      description.setAttribute(
        "content",
        page.seoDescription || page.description || ""
      );
    }

    return () => {
      document.title = previousTitle;
      if (description && previousDescription !== null) {
        description.setAttribute("content", previousDescription);
      }
    };
  }, [page]);

  function buyNow() {
    if (!product || Number(product.stock) <= 0) return;

    const existingQuantity = items.find(
      item => item._id === product._id
    )?.quantity || 0;

    const available = Number(product.stock) - existingQuantity;

    if (available <= 0) {
      navigate("/cart");
      return;
    }

    const hasSale =
      product.salePrice != null &&
      Number(product.salePrice) < Number(product.regularPrice);

    const currentPrice = hasSale
      ? Number(product.salePrice)
      : Number(product.regularPrice);

    addToCart(
      {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: product.images?.[0],
        price: currentPrice,
        regularPrice: product.regularPrice,
        stock: product.stock
      },
      Math.min(quantity, available)
    );
    navigate("/checkout");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-bold text-slate-500">Loading landing page...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-50 px-5 text-center">
        <h1 className="text-3xl font-black text-slate-900">
          Page Unavailable
        </h1>

        <p className="text-slate-500">
          {error || "This page could not be found."}
        </p>

        <Link to="/" className={buttonStyle}>Back to Home</Link>
      </main>
    );
  }

  const hasSale =
    product?.salePrice != null &&
    Number(product.salePrice) < Number(product.regularPrice);

  const price = product
    ? hasSale
      ? Number(product.salePrice)
      : Number(product.regularPrice)
    : null;
  const hasStock = product && Number(product.stock) > 0;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link to="/" className="text-2xl font-black text-[#071724]">
            VC <span className="text-orange-500">Tech</span>
          </Link>

          <a href="#order" className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white">
            Order Now
          </a>
        </div>
      </header>

      {page.sections?.length ? (
        page.sections.map((section, index) => (
          <Section
            key={section._id || index}
            section={section}
            index={index}
          />
        ))
      ) : (
        <section className="bg-slate-50 px-5 py-20 text-center">
          <h1 className="text-4xl font-black text-slate-900">
            {page.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-slate-600">
            {page.description}
          </p>
        </section>
      )}

      <section id="order" className="scroll-mt-8 bg-slate-100 px-5 py-16">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-xl md:p-10">
          <h2 className="mb-8 text-center text-3xl font-black text-slate-900">
            Order Your Product
          </h2>

          {product ? (
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                {product.images?.[0] && (
                  <img
                    src={getImageUrl(product.images[0])}
                    alt={product.name}
                    className="aspect-square w-full object-contain"
                  />
                )}
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {product.name}
                </h3>

                <p className="mt-5 text-3xl font-black text-orange-600">
                  ৳{formatPrice(price)}
                </p>

                {hasSale && (
                  <p className="mt-2 text-slate-400 line-through">
                    ৳{formatPrice(product.regularPrice)}
                  </p>
                )}

                <p className="mt-5 text-sm font-semibold">
                  {hasStock ? "In Stock" : "Out of Stock"}
                </p>

                {hasStock && (
                  <div className="mt-6 flex items-center gap-3">
                    <label htmlFor="lp-quantity" className="font-semibold">
                      Quantity
                    </label>

                    <input
                      id="lp-quantity"
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={event => {
                        const next = Number(event.target.value);
                        setQuantity(
                          Math.max(1, Math.min(next || 1, product.stock))
                        );
                      }}
                      className="w-24 rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                )}

                <button
                  type="button"
                  disabled={!hasStock}
                  onClick={buyNow}
                  className={`${buttonStyle} mt-7 w-full disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {hasStock ? "Buy Now — Cash on Delivery" : "Currently Unavailable"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-600">
                Product ordering is not configured for this landing page yet.
              </p>

              <Link to="/shop" className={`${buttonStyle} mt-6`}>
                Explore Products
              </Link>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-[#071724] px-5 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} VC Tech. All rights reserved.
      </footer>
    </div>
  );
}
