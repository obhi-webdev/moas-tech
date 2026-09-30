import Link from "next/link";

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

export default function ProductCard({ product }: ProductCardProps) {
  const hasSalePrice =
    product.salePrice !== null &&
    product.salePrice !== undefined &&
    product.salePrice < product.regularPrice;

  const finalPrice = hasSalePrice ? product.salePrice! : product.regularPrice;

  const productImage =
    product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No Image
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.isOffer && (
              <span className="w-fit rounded-md bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
                Offer
              </span>
            )}

            {product.isNewArrival && (
              <span className="w-fit rounded-md bg-blue-700 px-2.5 py-1 text-xs font-semibold text-white">
                New
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4">
        {product.brand && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {product.brand}
          </p>
        )}

        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-12 font-semibold leading-6 text-slate-900 transition hover:text-blue-700">
            {product.name}
          </h3>
        </Link>

        {product.category && (
          <Link
            href={`/category/${product.category.slug}`}
            className="mt-1 inline-block text-xs text-slate-500 hover:text-blue-700"
          >
            {product.category.name}
          </Link>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xl font-bold text-blue-700">
            ৳{formatPrice(finalPrice)}
          </span>

          {hasSalePrice && (
            <span className="text-sm text-slate-400 line-through">
              ৳{formatPrice(product.regularPrice)}
            </span>
          )}
        </div>

        <div className="mt-3">
          {product.stock > 0 ? (
            <span className="text-xs font-medium text-green-600">
              In Stock ({product.stock})
            </span>
          ) : (
            <span className="text-xs font-medium text-red-600">
              Out of Stock
            </span>
          )}
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="mt-4 block rounded-lg bg-blue-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
