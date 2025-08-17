import React, { useEffect, useState } from 'react';
import NavBar from './Navbar';
import axios from 'axios';
import './Orders.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/orders`);
        // Only orders which are not cart
        const placedOrders = response.data.filter(order => !order.isCart);
        setOrders(placedOrders);
        console.log("Orders fetched:", placedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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
              <div className="order-card-content">
                <h3>{order.product?.name || 'Product'}</h3>
                <p>Price: <span>₹{order.totalAmount}</span></p>
                <p>Status: <span>{order.status}</span></p>
                <p>Ordered on: <span>{new Date(order.createdAt).toLocaleString()}</span></p>
              </div>

              {/* Product Image on right */}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
