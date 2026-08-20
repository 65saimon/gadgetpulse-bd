'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Zap,
  Heart,
  Scale,
  Star,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  Send,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { AnnouncementBar } from '../../../components/storefront/AnnouncementBar';
import { Navbar } from '../../../components/storefront/Navbar';
import { Footer } from '../../../components/storefront/Footer';
import { ProductCard } from '../../../components/storefront/ProductCard';
import { CartDrawer } from '../../../components/storefront/CartDrawer';
import { CompareDrawer } from '../../../components/storefront/CompareDrawer';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useCompare } from '../../../context/CompareContext';
import { useAuth } from '../../../context/AuthContext';
import { apiRequest, formatBDT } from '../../../lib/api';
import { Product, ProductVariant } from '../../../types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();
  const { customer, customerToken } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await apiRequest(`/products/detail/${slug}`);
        if (res.success && res.product) {
          setProduct(res.product);
          setRelatedProducts(res.relatedProducts || []);
          setSelectedImage(res.product.mainImage || FALLBACK_IMAGE);

          if (res.product.variants && res.product.variants.length > 0) {
            setSelectedVariant(res.product.variants[0]);
          }
        }
      } catch (err) {
        console.error('Error loading product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <AnnouncementBar />
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto p-12 text-center text-slate-500 animate-pulse">
          Loading product specifications...
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <AnnouncementBar />
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto p-16 text-center space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500">The requested mobile phone or gadget is not available.</p>
          <Link href="/products" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold">
            Back to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? selectedVariant.discountPrice || selectedVariant.regularPrice
    : product.discountPrice || product.regularPrice;

  const currentOldPrice = selectedVariant
    ? (selectedVariant.discountPrice ? selectedVariant.regularPrice : null)
    : (product.discountPrice ? product.regularPrice : null);

  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;

  const isWish = isInWishlist(product.id);
  const isComp = isInCompare(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant || undefined, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant || undefined, quantity);
    router.push('/checkout');
  };

  // Parse specifications JSON
  let specsObj: { [key: string]: any } = {};
  try {
    if (typeof product.specifications === 'string') {
      specsObj = JSON.parse(product.specifications);
    } else if (typeof product.specifications === 'object' && product.specifications !== null) {
      specsObj = product.specifications;
    }
  } catch (e) {
    specsObj = {};
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerToken) {
      alert('Please log in as a customer to submit a review.');
      router.push('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await apiRequest(`/products/${product.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      if (res.success) {
        setReviewSuccess(true);
        setReviewComment('');
        setReviewTitle('');
      } else {
        alert(res.message || 'Failed to submit review.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const allImages = [product.mainImage, ...(product.images || []).map((img) => img.url)].filter(Boolean);
  const uniqueImages = Array.from(new Set(allImages));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 w-full overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-12 w-full max-w-full overflow-hidden">
        {/* Breadcrumb */}
        <div className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-slate-700">Home</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link href="/products" className="hover:text-slate-700">Products</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link href={`/products?category=${product.category?.slug}`} className="hover:text-slate-700">
            {product.category?.name}
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-slate-900 font-semibold truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
        </div>

        {/* Top Product Section (Images + Details + Buy Box) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 w-full overflow-hidden">
          {/* Left: Multi-Image Gallery */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            <div className="relative pt-[85%] sm:pt-[90%] rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 p-4 sm:p-6 overflow-hidden flex items-center justify-center">
              <img
                src={selectedImage || product.mainImage || FALLBACK_IMAGE}
                alt={product.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
                className="absolute inset-0 w-full h-full object-contain p-3 sm:p-6 hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Thumbnails */}
            {uniqueImages.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {uniqueImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 p-1 flex-shrink-0 bg-slate-50 transition ${
                      selectedImage === imgUrl ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt="thumbnail"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Spec selection & Buy Box */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
            <div className="space-y-3 sm:space-y-4">
              {/* Brand & Stock Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {product.brand?.name}
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-slate-400">SKU: {currentSku}</span>
              </div>

              {/* Title */}
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 leading-snug break-words hyphens-auto">
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                  <span className="text-xs sm:text-sm">{product.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal text-[11px]">({product.ratingCount} reviews)</span>
                </div>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <div>
                  {currentStock > 0 ? (
                    <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      In Stock ({currentStock} units)
                    </span>
                  ) : (
                    <span className="text-rose-500 font-bold text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-baseline gap-2 sm:gap-4">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">
                  {formatBDT(currentPrice)}
                </span>
                {currentOldPrice && (
                  <span className="text-sm sm:text-base text-slate-400 line-through">
                    {formatBDT(currentOldPrice)}
                  </span>
                )}
                {currentOldPrice && (
                  <span className="text-[10px] sm:text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    SAVE {formatBDT(currentOldPrice - currentPrice)}
                  </span>
                )}
              </div>

              {/* Variant Switcher */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Select Variant:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 max-w-full ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-600/20'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                        >
                          {v.colorCode && (
                            <span
                              className="w-3 h-3 rounded-full border border-slate-300 flex-shrink-0"
                              style={{ backgroundColor: v.colorCode }}
                            />
                          )}
                          <span className="truncate">{v.name}</span>
                          <span className="text-[10px] text-slate-400">({v.stockQuantity})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Specs Highlights */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center sm:text-left">
                  <span className="text-slate-400 block text-[9px] sm:text-[10px]">Warranty</span>
                  <span className="font-bold text-slate-800 text-[11px] sm:text-xs truncate block">{product.warranty || '1 Year Official'}</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center sm:text-left">
                  <span className="text-slate-400 block text-[9px] sm:text-[10px]">Authenticity</span>
                  <span className="font-bold text-emerald-600 text-[11px] sm:text-xs truncate block">100% Genuine</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center sm:text-left">
                  <span className="text-slate-400 block text-[9px] sm:text-[10px]">Delivery</span>
                  <span className="font-bold text-slate-800 text-[11px] sm:text-xs truncate block">24h Express</span>
                </div>
              </div>
            </div>

            {/* Desktop / Tablet Purchase Controls */}
            <div className="space-y-3 pt-3 sm:pt-4 border-t border-slate-100 hidden sm:block">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:text-black"
                  >
                    -
                  </button>
                  <span className="px-3.5 py-2.5 text-sm font-black text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    className="px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:text-black"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                    addedAnimation
                      ? 'bg-emerald-600 text-white'
                      : currentStock > 0
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {addedAnimation ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  <span>{addedAnimation ? 'Added!' : 'Add to Cart'}</span>
                </button>

                {/* Buy Now Instant */}
                <button
                  onClick={handleBuyNow}
                  disabled={currentStock <= 0}
                  className="flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>

                {/* Wishlist & Compare Buttons */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-xl border transition ${
                    isWish ? 'bg-rose-500 text-white border-rose-500' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                  title="Wishlist"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
                <button
                  onClick={() => addToCompare(product)}
                  className={`p-3 rounded-xl border transition ${
                    isComp ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                  title="Compare"
                >
                  <Scale className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Description Tabs */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-slate-200 shadow-sm space-y-6 sm:space-y-8 w-full overflow-hidden">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-2 sm:mb-4">
              Product Overview & Details
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl">
              {product.description || product.shortDesc}
            </p>
          </div>

          {/* Technical Specs Table */}
          {Object.keys(specsObj).length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Technical Specifications</h3>
              <div className="border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden divide-y divide-slate-100 w-full">
                {Object.entries(specsObj).map(([key, val], idx) => (
                  <div
                    key={key}
                    className={`grid grid-cols-1 sm:grid-cols-3 p-3 text-xs ${
                      idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'
                    }`}
                  >
                    <span className="font-bold text-slate-600">{key}</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 mt-0.5 sm:mt-0 break-words">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-slate-200 shadow-sm space-y-6 sm:space-y-8 w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Verified Customer Reviews</h2>
              <p className="text-xs text-slate-500">Real feedback from verified purchasers across Bangladesh</p>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="text-sm font-black text-amber-700">{product.rating.toFixed(1)} / 5.0</span>
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-3 sm:space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{rev.customer?.fullName || 'Verified Shopper'}</span>
                      {rev.isVerified && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  {rev.title && <h4 className="text-xs font-bold text-slate-800">{rev.title}</h4>}
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No reviews yet for this model.</p>
            )}
          </div>
        </div>

        {/* Related Products Carousel / Grid */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4 sm:space-y-6 pt-4">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900">Similar Recommended Gadgets</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Mobile Bottom Buy Action Bar */}
      <div className="fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-between gap-2 lg:hidden shadow-xl">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-black text-slate-900 truncate">
            {formatBDT(currentPrice)}
          </div>
          <span className="text-[9px] text-emerald-600 font-bold block truncate">
            {currentStock > 0 ? '● In Stock' : '● Out of Stock'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAddToCart}
            disabled={currentStock <= 0}
            className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl active:scale-95 disabled:opacity-50 transition"
          >
            {addedAnimation ? 'Added!' : '+ Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={currentStock <= 0}
            className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-50 transition"
          >
            Buy Now
          </button>
        </div>
      </div>

      <Footer />
      <CartDrawer />
      <CompareDrawer />
    </div>
  );
}
