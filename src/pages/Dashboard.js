import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import LoadingSpinner from "./LoadingSpinner"; // ✅ Global loader
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false); // ✅ added loader state
  const [showPopup, setShowPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    landmark: "",
    pincode: "",
    city: "",
    state: ""
  });

  const navigate = useNavigate();

  const categories = [
    "All",
    "Men",
    "Women",
    "Kids",
    "Footwear",
    "Accessories",
    "Seasonal",
  ];

  // Fetch products
  const fetchProducts = async (category) => {
    try {
      setLoading(true); // ✅ start loading
      const url =
        category === "All"
          ? `${BASE_URL}/products`
          : `${BASE_URL}/products?category=${category}`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false); // ✅ stop loading
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const addToCart = async (product) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser._id) {
      alert("You must be logged in to add to cart!");
      return;
    }
    const userId = storedUser._id;

    const cartData = {
      user: userId,
      product: product._id,
      isCart: true,
      location: "Cart item - address not set", // ✅ dummy value
    };

    try {
      await axios.post(`${BASE_URL}/orders`, cartData);
      alert(`${product.name} added to cart successfully!`);
    } catch (error) {
      console.error("Error adding product to cart:", error.response?.data || error);
      alert("Failed to add product to cart.");
    }
  };

  // Order Now → open popup
  const orderNow = (product) => {
    setSelectedProduct(product);
    setShowPopup(true);
  };

  // Handle confirm order
  const confirmOrder = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser._id) {
      alert("You must be logged in to place an order!");
      return;
    }

    const userId = storedUser._id;

    const fullAddress = `${address.line1}, ${address.line2}, ${address.landmark}, ${address.pincode}, ${address.city}, ${address.state}`;
    
    const orderData = {
      user: userId,
      product: selectedProduct._id,
      isCart: false,
      location: fullAddress,
    };

    try {
      await axios.post(`${BASE_URL}/orders`, orderData);
      alert(`Order placed for ${selectedProduct.name}!`);
      setShowPopup(false);
      setAddress({
        line1: "",
        line2: "",
        landmark: "",
        pincode: "",
        city: "",
        state: ""
      });
      navigate("/orders"); 
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error);
      alert("Failed to place order.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar">
          <h2>Categories</h2>
          <ul>
            {categories.map((cat) => (
              <li
                key={cat}
                className={selectedCategory === cat ? "active-category" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>

        <main className="dashboard-content">
          <h1>{selectedCategory} Products</h1>

          {loading ? ( // ✅ show spinner while fetching
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: "2rem" }}>
              No products available in this category.
            </p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div className="product-card" key={product._id}>
                  <img
                    src={
                      product.image?.startsWith("data:")
                        ? product.image
                        : `data:image/jpeg;base64,${product.image}`
                    }
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-card-content">
                    <h3>{product.name}</h3>
                    <p>₹{product.price}</p>
                    <p>{product.description}</p>
                    <div className="product-actions">
                      <button onClick={() => addToCart(product)}>Add to Cart</button>
                      <button onClick={() => orderNow(product)}>Order Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Popup Modal */}
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
              <button onClick={confirmOrder}>Confirm</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
