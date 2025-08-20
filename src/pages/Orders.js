import React, { useEffect, useState } from 'react';
import NavBar from './Navbar';
import axios from 'axios';
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
      await axios.delete(`${BASE_URL}/orders/${orderId}`);
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      alert("Order cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel order. Please try again.");
    }
  };

  return (
    <div>
      <NavBar />
      <h2 className="orders-heading">Your Orders</h2>
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="no-orders">No orders placed yet.</p>
      ) : (
        <div className="orders-container">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-card-main">
                {/* Left side: order details */}
                <div className="order-card-content">
                  <h3>{order.product?.name || 'Product'}</h3>
                  <p>Price: <span>₹{order.totalAmount || order.product?.price}</span></p>
                  <p>Status: <span>{order.status}</span></p>
                  <p>Ordered on: <span>{new Date(order.createdAt).toLocaleString()}</span></p>
                  {order.location && (
                    <p>Delivery Address: <span>{order.location}</span></p>
                  )}
                </div>

                {/* Right side: image + cancel button */}
                <div className="order-card-right">
                  {order.product?.image && (
                    <img
                      src={order.product.image.startsWith('data:')
                        ? order.product.image
                        : `data:image/jpeg;base64,${order.product.image}`
                      }
                      alt={order.product.name || 'Product'}
                      className="order-card-image"
                    />
                  )}
                  <button
                    className="cancel-order-btn"
                    onClick={() => handleCancel(order._id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
