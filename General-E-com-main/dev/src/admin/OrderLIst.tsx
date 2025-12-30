import React, { useState } from "react";
import { orderAPI } from "../utils/api";
import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useAlert } from "../context/AlertContext";

type OrderItem = {
  productId?: string;
  productName?: string;
  quantity?: number;
  price?: number;
};

type Order = {
  _id?: string;
  orderNumber?: string;
  userId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  guestId?: string;
  guestInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  items?: OrderItem[];
  totalAmount?: number;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

interface OrdersListProps {
  orders: Order[];
  onOrderUpdate?: () => void; // Callback to refresh orders after update
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onOrderUpdate }) => {
  const formatCurrency = useFormatCurrency();
  const { showAlert } = useAlert();
  console.log(orders);
  
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Calculate order statistics
  const orderStats = React.useMemo(() => {
    const stats = {
      total: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
      totalRevenue: 0
    };

    orders.forEach(order => {
      const status = order.status?.toLowerCase() || 'pending';
      if (stats[status as keyof typeof stats] !== undefined) {
        (stats[status as keyof typeof stats] as number)++;
      }
      if (order.status !== 'cancelled' && order.status !== 'refunded') {
        stats.totalRevenue += order.totalAmount || 0;
      }
    });

    return stats;
  }, [orders]);

  // Filter orders based on selected status
  const filteredOrders = React.useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter(order => order.status?.toLowerCase() === statusFilter);
  }, [orders, statusFilter]);

  const getUserDisplayName = (order: Order) => {
    if (order.userId) {
      return `${order.userId.firstName || ''} ${order.userId.lastName || ''}`.trim() || order.userId.email || 'Registered User';
    }
    if (order.guestInfo?.name) {
      return order.guestInfo.name;
    }
    return 'Guest User';
  };

  const getUserEmail = (order: Order) => {
    return order.userId?.email || order.guestInfo?.email || 'No email';
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
  ];

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!orderId) return;

    setUpdatingOrderId(orderId);
    try {
      await orderAPI.updateOrderStatus(orderId, { status: newStatus });
      if (onOrderUpdate) {
        onOrderUpdate(); // Refresh the orders list
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      showAlert('Failed to update order status. Please try again.', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Order Management</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">Track and update order status</span>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{orderStats.total}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">Total Orders</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{orderStats.pending}</div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{orderStats.processing}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">Processing</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{orderStats.shipped}</div>
          <div className="text-xs text-purple-600 dark:text-purple-400">Shipped</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{orderStats.delivered}</div>
          <div className="text-xs text-green-600 dark:text-green-400">Delivered</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{orderStats.cancelled}</div>
          <div className="text-xs text-red-600 dark:text-red-400">Cancelled</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{orderStats.refunded}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Refunded</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(orderStats.totalRevenue)}</div>
          <div className="text-xs text-green-600 dark:text-green-400">Total Revenue</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Orders ({orderStats.total})</option>
            <option value="pending">Pending ({orderStats.pending})</option>
            <option value="processing">Processing ({orderStats.processing})</option>
            <option value="shipped">Shipped ({orderStats.shipped})</option>
            <option value="delivered">Delivered ({orderStats.delivered})</option>
            <option value="cancelled">Cancelled ({orderStats.cancelled})</option>
            <option value="refunded">Refunded ({orderStats.refunded})</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredOrders.length} of {orderStats.total} orders
        </div>
      </div>

      <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto">
        {(!filteredOrders || filteredOrders.length === 0) ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{statusFilter === 'all' ? 'No orders found.' : `No ${statusFilter} orders found.`}</p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <div key={order._id || order.orderNumber || index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status || 'pending'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus || 'pending'}
                    </span>
                    {/* Status Update Dropdown */}
                    <div className="relative flex items-center gap-2">
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusUpdate(order._id || '', e.target.value)}
                        disabled={updatingOrderId === order._id}
                        className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {updatingOrderId === order._id && (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-4">
                      <span><strong>Customer:</strong> {getUserDisplayName(order)}</span>
                      <span><strong>Email:</strong> {getUserEmail(order)}</span>
                      <span><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</span>
                      {order.updatedAt && order.updatedAt !== order.createdAt && (
                        <span><strong>Last Updated:</strong> {new Date(order.updatedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Items: {order.items?.length || 0}</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(order.totalAmount)}</div>
                  <div className="text-xs text-gray-500 mt-1">{order.paymentMethod || 'N/A'}</div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <h4 className="font-medium mb-2">Order Items:</h4>
                <div className="space-y-2">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{item.productName || `Product ${item.productId}`}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Quantity: {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="font-semibold">{formatCurrency((item.price || 0) * (item.quantity || 1))}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                  <h4 className="font-medium mb-2">Shipping Address:</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {order.shippingAddress.street && <div>{order.shippingAddress.street}</div>}
                    <div>
                      {order.shippingAddress.city && `${order.shippingAddress.city}, `}
                      {order.shippingAddress.state && `${order.shippingAddress.state} `}
                      {order.shippingAddress.postalCode && order.shippingAddress.postalCode}
                    </div>
                    {order.shippingAddress.country && <div>{order.shippingAddress.country}</div>}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Order Total:</span>
                  <span className="text-lg font-bold text-green-600">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersList;
