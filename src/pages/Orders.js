import React, { useEffect, useState } from 'react';
import NavBar from './Navbar';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner'; // ✅ Global loader import
import './Orders.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/orders`);
      const placedOrders = response.data.filter(order => !order.isCart);
      setOrders(placedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setLoading(true);
      await axios.delete(`${BASE_URL}/orders/${orderId}`);
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      alert("Order cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setLoading(false);
    }
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
                  <p><strong>Product:</strong> {order.product?.name || 'Product'}</p>
                  <p><strong>Price:</strong> ₹{order.totalAmount || order.product?.price}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Ordered on:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  {order.location && (
                    <p><strong>Delivery Address:</strong> {order.location}</p>
                  )}
                </div>

                {/* Right side: image + cancel */}
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
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancel(order._id)}
                  >
                    Cancel
                  </button>
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
