import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, X, ChevronRight } from 'lucide-react';
import { orderService } from '../services/api';

/**
 * Orders Component
 * 
 * Displays user's product orders:
 * - Order history with status
 * - Order details
 * - Track order status
 */

function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderService.getMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'PROCESSING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'PENDING':
        return <Package className="w-5 h-5 text-orange-600" />;
      case 'CANCELLED':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-700';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PENDING':
        return 'bg-orange-100 text-orange-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status?.toUpperCase() === filterStatus);

  const OrderCard = ({ order }) => (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
      onClick={() => setSelectedOrder(order)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">
            Order #{order.id || 'N/A'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Placed on {formatDate(order.orderDate)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span>{order.status || 'Pending'}</span>
        </span>
      </div>

      {/* Order Items Preview */}
      <div className="space-y-2 mb-4">
        {order.items && order.items.slice(0, 2).map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{item.productName || 'Product'} x{item.quantity || 1}</span>
            <span className="text-gray-600">${item.price || '0.00'}</span>
          </div>
        ))}
        {order.items && order.items.length > 2 && (
          <p className="text-sm text-gray-500">
            +{order.items.length - 2} more item(s)
          </p>
        )}
      </div>

      {/* Total and View Details */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-xl font-bold text-gray-800">${order.totalAmount || '0.00'}</p>
        </div>
        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm">
          <span>View Details</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
              <p className="text-sm text-gray-600 mt-1">Order #{order.id}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Timeline */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status || 'Pending'}
                </span>
                <span className="text-sm text-gray-600">
                  Placed on {formatDate(order.orderDate)}
                </span>
              </div>

              {/* Simple Status Tracker */}
              <div className="flex items-center justify-between mt-6">
                {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status, index) => {
                  const isComplete = ['DELIVERED', 'SHIPPED', 'PROCESSING'].includes(order.status?.toUpperCase()) && 
                    ['PENDING', 'PROCESSING'].includes(status);
                  const isCurrent = order.status?.toUpperCase() === status;
                  
                  return (
                    <div key={status} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        isComplete || isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isComplete ? <CheckCircle className="w-5 h-5" /> : index + 1}
                      </div>
                      {index < 3 && (
                        <div className={`flex-1 h-1 mx-2 ${
                          isComplete ? 'bg-blue-600' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Pending</span>
                <span>Processing</span>
                <span>Shipped</span>
                <span>Delivered</span>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.productName || 'Product Name'}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-800">${item.price || '0.00'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Shipping Address</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{order.shippingAddress}</p>
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Price Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${order.subtotal || order.totalAmount || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>${order.shipping || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${order.tax || '0.00'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${order.totalAmount || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <button 
              onClick={onClose}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-600 mt-1">Track and manage your product orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex flex-wrap gap-1">
        {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-6">
            {filterStatus === 'ALL' 
              ? "You haven't placed any orders yet."
              : `No ${filterStatus.toLowerCase()} orders.`}
          </p>
          {filterStatus === 'ALL' && (
            <button 
              onClick={() => window.location.href = '/dashboard/products'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Browse Products
            </button>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
}

export default Orders;