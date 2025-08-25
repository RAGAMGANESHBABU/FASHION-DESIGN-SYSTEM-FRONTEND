import React, { useEffect, useState } from 'react';
import NavBar from './Navbar';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner'; // ✅ Global loader import
import './Orders.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingMap, setCancellingMap] = useState({}); // { [orderId]: true }

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${BASE_URL}/orders`, { headers });
      const placedOrders = Array.isArray(response.data)
        ? response.data.filter(order => !order.isCart)
        : [];
      setOrders(placedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    // only allow if not already cancelling
    if (cancellingMap[orderId]) return;
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancellingMap(prev => ({ ...prev, [orderId]: true }));
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${BASE_URL}/orders/${orderId}`, { headers });

      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      alert("Order cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancellingMap(prev => {
        const copy = { ...prev };
        delete copy[orderId];
        return copy;
      });
    }
  };

  // helper: is cancellable when status is Pending or Processing (case-insensitive)
  const isCancellable = (status) => {
    if (!status) return false;
    const s = String(status).trim().toLowerCase();
    return s === 'pending' || s === 'processing';
  };

  return (
    <div>
      <NavBar />
      <h2 className="orders-heading">Your Orders</h2>

      {/* ✅ Loader */}
      {loading && <LoadingSpinner />}

      {!loading && (
        orders.length === 0 ? (
          <p className="no-orders">No orders placed yet.</p>
        ) : (
          <div className="orders-container">
            {orders.map(order => (
              <div key={order._id} className="order-row">
                {/* Left side: details */}
                <div className="order-left">
                  <p style={{ textAlign: 'left' }}><strong>Product:</strong> {order.product?.name || 'Product'}</p>
                  <p style={{ textAlign: 'left' }}><strong>Price:</strong> ₹{order.totalAmount || order.product?.price}</p>
                  <p style={{ textAlign: 'left' }}><strong>Status:</strong> {order.status || '—'}</p>
                  <p style={{ textAlign: 'left' }}><strong>Ordered on:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</p>
                  {order.location && (
                    <p style={{ textAlign: 'left' }}><strong>Delivery Address:</strong> {order.location}</p>
                  )}
                </div>

                {/* Right side: image + cancel (conditionally shown) */}
                <div className="order-right">
                  {order.product?.image && (
                    <img
                      src={order.product.image.startsWith('data:')
                        ? order.product.image
                        : `data:image/jpeg;base64,${order.product.image}`}
                      alt={order.product.name || 'Product'}
                      className="order-image"
                    />
                  )}

                  {/* Show Cancel only for Pending or Processing */}
                  {isCancellable(order.status) ? (
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancel(order._id)}
                      disabled={!!cancellingMap[order._id]}
                    >
                      {cancellingMap[order._id] ? 'Cancelling...' : 'Cancel'}
                    </button>
                  ) : (
                    <button className="cancel-btn" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default Orders;
