import React, { useEffect, useState } from 'react';
import Navbar from '../pages/Navbar';
import axios from 'axios';
import './Cart.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Fetch cart items (isCart = true)
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/orders`);
        const cartData = response.data.filter(order => order.isCart);
        setCartItems(cartData);
      } catch (err) {
        console.error("Error fetching cart items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, []);

  // Checkbox select/deselect
  const handleSelect = (orderId) => {
    if (selectedItems.includes(orderId)) {
      setSelectedItems(selectedItems.filter(id => id !== orderId));
    } else {
      setSelectedItems([...selectedItems, orderId]);
    }
  };

  // Checkout: update isCart=false for selected items
  const handleCheckout = async () => {
    const itemsToOrder = cartItems.filter(item => selectedItems.includes(item._id));

    try {
      await Promise.all(
        itemsToOrder.map(item =>
          axios.patch(`${BASE_URL}/orders/${item._id}`, { isCart: false })
        )
      );

      // Remove from frontend
      setCartItems(cartItems.filter(item => !selectedItems.includes(item._id)));
      setSelectedItems([]);
      alert("Order placed successfully!");
    } catch (err) {
      console.error("Error during checkout:", err);
      alert("Failed to place order. Please try again.");
    }
  };

  // Remove from cart
  const handleRemove = async (orderId) => {
    try {
      await axios.delete(`${BASE_URL}/orders/${orderId}`);
      setCartItems(cartItems.filter(item => item._id !== orderId));
      setSelectedItems(selectedItems.filter(id => id !== orderId));
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item from cart. Please try again.");
    }
  };

  // Total price calculation
  const totalPrice = cartItems
    .filter(item => selectedItems.includes(item._id))
    .reduce((acc, item) => acc + (item.product?.price || 0), 0);

  return (
    <div>
      <Navbar />
      <div className="cart-container">
        <h2>🛒 My Cart</h2>
        {loading ? (
          <p>Loading...</p>
        ) : cartItems.length === 0 ? (
          <p className="empty-cart">Your cart is empty</p>
        ) : (
          <>
            <ul className="cart-list">
              {cartItems.map(item => (
                <li key={item._id} className="cart-item">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={() => handleSelect(item._id)}
                  />
                  {item.product?.image && (
                    <img
                      src={item.product.image.startsWith('data:')
                        ? item.product.image
                        : `data:image/jpeg;base64,${item.product.image}`
                      }
                      alt={item.product.name}
                      className="cart-item-image"
                    />
                  )}
                  <div className="item-info">
                    <span className="item-name">{item.product?.name || 'Product'}</span>
                    <span className="item-price">₹{item.product?.price || 0}</span>
                  </div>
                  <div className="item-actions">
                    <button className="remove-btn" onClick={() => handleRemove(item._id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>

            {selectedItems.length > 0 && (
              <div className="checkout-section">
                <h3>Total: ₹{totalPrice}</h3>
                <button className="checkout-btn" onClick={handleCheckout}>
                  Checkout ({selectedItems.length} item{selectedItems.length > 1 ? 's' : ''})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
