import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Search, Filter, Plus, Minus, X } from 'lucide-react';
import { productService, cartService } from '../services/api';

/**
 * BrowseProducts Component
 * 
 * Product catalog with:
 * - Browse all wellness products
 * - Search and filter
 * - Add to cart
 * - View cart summary
 */

function BrowseProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showCart, setShowCart] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = ['ALL', 'Supplements', 'Essential Oils', 'Yoga Equipment', 'Herbal Remedies', 'Fitness Tools'];

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const loadProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const response = await cartService.getCurrentCart();
      setCart(response.data?.items || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      await cartService.addToCart(productId, quantity);
      await loadCart();
      setMessage({ type: 'success', text: 'Added to cart!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage({ type: 'error', text: 'Failed to add to cart' });
    }
  };

  const handleUpdateCartQuantity = async (cartItemId, quantity) => {
    try {
      await cartService.updateQuantity(cartItemId, quantity);
      await loadCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      await cartService.removeItem(cartItemId);
      await loadCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group">
      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <ShoppingCart className="w-16 h-16 text-gray-400" />
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded">
            Only {product.stock} left!
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded mb-2">
          {product.category || 'Product'}
        </span>
        
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name || 'Product Name'}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description || 'High-quality wellness product'}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= (product.rating || 4)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-800">
              ${product.price || '0.00'}
            </span>
          </div>
          <button
            onClick={() => handleAddToCart(product.id)}
            disabled={product.stock === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );

  const CartSidebar = () => (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
      
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
            <button
              onClick={() => setShowCart(false)}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{getCartItemCount()} items</p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length > 0 ? (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{item.productName || 'Product'}</h4>
                    <p className="text-sm text-gray-600">${item.price || '0.00'}</p>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleUpdateCartQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateCartQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Your cart is empty</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between mb-4">
              <span className="text-lg font-semibold text-gray-800">Total</span>
              <span className="text-2xl font-bold text-gray-800">${getCartTotal()}</span>
            </div>
            <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Wellness Products</h1>
          <p className="text-gray-600 mt-1">Discover premium wellness products</p>
        </div>
        
        {/* Cart Button */}
        <button
          onClick={() => setShowCart(true)}
          className="relative px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center space-x-2"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart</span>
          {getCartItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
              {getCartItemCount()}
            </span>
          )}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <p className="text-gray-600">
        Showing <span className="font-semibold">{filteredProducts.length}</span> products
      </p>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && <CartSidebar />}
    </div>
  );
}

export default BrowseProducts;