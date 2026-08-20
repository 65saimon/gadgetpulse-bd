'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingCart,
  Heart,
  Scale,
  Check,
  Sparkles,
  Zap,
  Info,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { AnnouncementBar } from '../../../components/storefront/AnnouncementBar';
import { Navbar } from '../../../components/storefront/Navbar';
import { Footer } from '../../../components/storefront/Footer';
import { CartDrawer } from '../../../components/storefront/CartDrawer';
import { CompareDrawer } from '../../../components/storefront/CompareDrawer';
import { ProductCard } from '../../../components/storefront/ProductCard';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useCompare } from '../../../context/CompareContext';
import { useAuth } from '../../../context/AuthContext';
import { apiRequest, formatBDT, formatDate } from '../../../lib/api';
import { Product, ProductVariant } from '../../../types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();
  const { customer, customerToken } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
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
          setSelectedImage(res.product.mainImage);

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

  // Parse specifications JSON
  let specsObj: Record<string, string> = {};
  if (product.specifications) {
    try {
      specsObj = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications;
    } catch (e) {
      specsObj = { Specifications: String(product.specifications) };
    }
  }

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerToken) {
      router.push('/login');
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await apiRequest(
        '/products/review',
        {
          method: 'POST',
          body: JSON.stringify({
            productId: product.id,
            rating: reviewRating,
            title: reviewTitle,
            comment: reviewComment,
          }),
        },
        customerToken
      );

      if (res.success) {
        setReviewSuccess(true);
        setReviewTitle('');
        setReviewComment('');
        // Refresh product
        const updated = await apiRequest(`/products/detail/${slug}`);
        if (updated.success) setProduct(updated.product);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const allImages = [product.mainImage, ...(product.images || []).map((img) => img.url)];
  const uniqueImages = Array.from(new Set(allImages));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Breadcrumb */}
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Link href="/" className="hover:text-slate-700">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-slate-700">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/products?category=${product.category?.slug}`} className="hover:text-slate-700">
            {product.category?.name}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Top Product Section (Images + Details + Buy Box) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Multi-Image Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative pt-[90%] rounded-2xl bg-slate-50 border border-slate-100 p-6 overflow-hidden flex items-center justify-center">
              <img
                src={selectedImage || product.mainImage}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-contain p-6 hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Thumbnails */}
            {uniqueImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {uniqueImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-16 h-16 rounded-xl border-2 p-1.5 flex-shrink-0 bg-slate-50 transition ${
                      selectedImage === imgUrl ? 'border-blue-600 shadow-md' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={imgUrl} alt="thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Spec selection & Buy Box */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand & Stock Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {product.brand?.name}
                </span>
                <span className="text-xs font-mono text-slate-400">SKU: {currentSku}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm">{product.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({product.ratingCount} reviews)</span>
                </div>
                <span className="text-slate-300">•</span>
                <div>
                  {currentStock > 0 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      In Stock ({currentStock} units available)
                    </span>
                  ) : (
                    <span className="text-rose-500 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  {formatBDT(currentPrice)}
                </span>
                {currentOldPrice && (
                  <span className="text-base text-slate-400 line-through">
                    {formatBDT(currentOldPrice)}
                  </span>
                )}
                {currentOldPrice && (
                  <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    SAVE {formatBDT(currentOldPrice - currentPrice)}
                  </span>
                )}
              </div>

              {/* Variant Switcher */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Select Model / Color / Storage Variant:
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-600/20'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                        >
                          {v.colorCode && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0"
                              style={{ backgroundColor: v.colorCode }}
                            />
                          )}
                          <span>{v.name}</span>
                          <span className="text-[10px] text-slate-400">({v.stockQuantity} in stock)</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Specs Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-400 block text-[10px]">Warranty</span>
                  <span className="font-bold text-slate-800">{product.warranty || '1 Year Official'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-400 block text-[10px]">Authenticity</span>
                  <span className="font-bold text-emerald-600">100% Genuine BD</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-400 block text-[10px]">Shipping</span>
                  <span className="font-bold text-slate-800">24h Express Dhaka</span>
                </div>
              </div>
            </div>

            {/* Purchase Controls & Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-3 text-sm font-bold text-slate-600 hover:text-black"
                  >
                    -
                  </button>
                  <span className="px-3.5 py-3 text-sm font-black text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    className="px-3.5 py-3 text-sm font-bold text-slate-600 hover:text-black"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                    addedAnimation
                      ? 'bg-emerald-600 text-white'
                      : currentStock > 0
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {addedAnimation ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  <span>{addedAnimation ? 'Added to Cart!' : 'Add to Cart'}</span>
                </button>

                {/* Buy Now Instant */}
                <button
                  onClick={handleBuyNow}
                  disabled={currentStock <= 0}
                  className="flex-1 py-3.5 px-6 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>

                {/* Wishlist & Compare Buttons */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-xl border transition ${
                    isWish ? 'bg-rose-500 text-white border-rose-500' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                  title="Wishlist"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
                <button
                  onClick={() => addToCompare(product)}
                  className={`p-3.5 rounded-xl border transition ${
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
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4">
              Product Overview & Details
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
              {product.description || product.shortDesc}
            </p>
          </div>

          {/* Technical Specs Table */}
          {Object.keys(specsObj).length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Technical Specifications</h3>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {Object.entries(specsObj).map(([key, val], idx) => (
                  <div
                    key={key}
                    className={`grid grid-cols-1 sm:grid-cols-3 p-3.5 text-xs ${
                      idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'
                    }`}
                  >
                    <span className="font-bold text-slate-600">{key}</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 mt-1 sm:mt-0">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Reviews & Ratings Submission */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Customer Reviews</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-900">{product.rating.toFixed(1)} out of 5</span>
                <span className="text-xs text-slate-400">({product.reviews?.length || 0} customer ratings)</span>
              </div>
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center uppercase">
                        {rev.customer?.fullName.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{rev.customer?.fullName || 'Verified Customer'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{formatDate(rev.createdAt)}</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  {rev.title && <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>}
                  <p className="text-xs text-slate-600">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No reviews yet for this product. Be the first to leave one!</p>
            )}
          </div>

          {/* Submit Review Form */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Write a Review</span>
            </h3>

            {reviewSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Thank you for your rating! Your review is now live.</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setReviewRating(num)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                          reviewRating >= num ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{num}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Review Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent battery life and fast performance"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Review Details *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your experience with build quality, battery, performance, camera..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Related Devices You Might Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <CartDrawer />
      <CompareDrawer />
    </div>
  );
}
