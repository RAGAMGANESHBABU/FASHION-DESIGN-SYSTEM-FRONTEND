import React, { useEffect, useState } from 'react';
import Navbar from '../pages/Navbar';
import axios from 'axios';
import LoadingSpinner from "./LoadingSpinner"; 
import './Cart.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  // popup + address state
  const [showPopup, setShowPopup] = useState(false);
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    landmark: "",
    pincode: "",
    city: "",
    state: ""
  });

  // Fetch cart items (orders with isCart = true)
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("📌 Token:", token);

        const response = await axios.get(`${BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("📌 Full API Response:", response.data);

        // filter cart items (handle boolean/string)
        const cartData = Array.isArray(response.data)
          ? response.data.filter(item => item.isCart === true || item.isCart === "true")
          : [];

        console.log("📌 Filtered Cart Items:", cartData);

        setCartItems(cartData);
      } catch (error) {
        console.error('❌ Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Remove single item from cart
  const handleRemove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(prev => prev.filter(item => item._id !== id));
      setSelectedItems(prev => prev.filter(i => i !== id));
    } catch (error) {
      console.error('❌ Error removing item:', error);
      alert("Failed to remove item. Try again.");
    }
  };

  // Remove all selected items (bulk delete)
  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to remove.");
      return;
    }

    if (!window.confirm("Remove selected items from cart?")) return;

    try {
      const token = localStorage.getItem('token');

      // send delete requests in parallel
      await Promise.all(
        selectedItems.map(id =>
          axios.delete(`${BASE_URL}/orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );

      // update local state
      setCartItems(prev => prev.filter(item => !selectedItems.includes(item._id)));
      setSelectedItems([]);
      alert("Selected items removed from cart.");
    } catch (error) {
      console.error("❌ Error removing selected items:", error);
      alert("Failed to remove selected items. Try again.");
    }
  };

  // Select / Deselect item (store ids)
  const handleSelect = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Checkout: show popup only when at least one selected
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout!");
      return;
    }
    setShowPopup(true);
  };

  // Confirm checkout after entering address
  const confirmCheckout = async () => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser._id) {
      alert("You must be logged in to place an order!");
      return;
    }

    const userId = storedUser._id;
    const fullAddress = `${address.line1}, ${address.line2}, ${address.landmark}, ${address.pincode}, ${address.city}, ${address.state}`;

    const itemsToOrder = cartItems.filter(item => selectedItems.includes(item._id));

    try {
      // Mark each selected order as purchased (isCart = false) and add location
      await Promise.all(
        itemsToOrder.map(item =>
          axios.patch(`${BASE_URL}/orders/${item._id}`, {
            user: userId,
            product: item.product?._id || item.product,
            isCart: false,
            location: fullAddress,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );

      alert("✅ Order placed successfully!");
      setCartItems(prev => prev.filter(item => !selectedItems.includes(item._id)));
      setSelectedItems([]);
      setShowPopup(false);

      // reset address
      setAddress({
        line1: "",
        line2: "",
        landmark: "",
        pincode: "",
        city: "",
        state: ""
      });
    } catch (error) {
      console.error("❌ Error during checkout:", error);
      alert("❌ Checkout failed. Try again!");
    }
  };

  return (
    <>
      <Navbar />
      <div className="cart-container">
        <h2>🛒 My Cart</h2>

        {loading ? (
          <LoadingSpinner />
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
                      src={
                        item.product?.image.startsWith('data:')
                          ? item.product.image
                          : `data:image/jpeg;base64,${item.product.image}`
                      }
                      alt={item.product?.name || "Product"}
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

            {/* Footer: Remove Selected (above) + Checkout Selected (below) */}
            <div className="cart-footer">
              <button
                className="remove-selected-btn"
                onClick={handleRemoveSelected}
                disabled={selectedItems.length === 0}
              >
                Remove Selected
              </button>

              {/* Checkout button appears (and enabled) only when >=1 item selected */}
              {selectedItems.length > 0 && (
                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  Checkout Selected ({selectedItems.length})
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Popup Modal for Address */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Enter Delivery Address</h2>
            <input type="text" placeholder="Address Line 1"
              value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
            <input type="text" placeholder="Address Line 2"
              value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
            <input type="text" placeholder="Landmark"
              value={address.landmark} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} />
            <input type="text" placeholder="Pincode"
              value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
            <input type="text" placeholder="City"
              value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            <input type="text" placeholder="State"
              value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />

            <div className="popup-actions">
              <button onClick={confirmCheckout}>Confirm</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;
