import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import LoadingSpinner from "./LoadingSpinner"; // ✅ Spinner import
import "./Dashboard.css";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
  });

  const categories = ["All", "Men", "Women", "Kids", "Electronics"];

  useEffect(() => {
    fetchProducts("All");
  }, []);

  const fetchProducts = async (category) => {
    try {
      setLoading(true);
      const url =
        category === "All"
          ? `${BASE_URL}/products`
          : `${BASE_URL}/products?category=${category}`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchProducts(category);
  };

  const handleBuyNow = (product) => {
    setSelectedProduct(product);
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
    setSelectedProduct(null);
    setAddress({
      line1: "",
      line2: "",
      landmark: "",
      pincode: "",
      city: "",
      state: "",
    });
  };

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const confirmOrder = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      // ✅ Mandatory validation
      if (!address.line1 || !address.pincode || !address.city || !address.state) {
        alert("Please fill Address Line1, Pincode, City, and State.");
        setLoading(false);
        return;
      }

      const fullAddress = `${address.line1}, ${address.line2}, ${address.landmark}, ${address.pincode}, ${address.city}, ${address.state}`;

      const orderData = {
        user: userId,
        product: selectedProduct._id,
        isCart: false,
        location: fullAddress,
      };

      await axios.post(`${BASE_URL}/orders`, orderData);
      alert("Order placed successfully!");
      handleClosePopup();
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      const cartData = {
        user: userId,
        product: product._id,
        isCart: true,
        location: "Default Address", // ✅ Dummy for cart
      };

      await axios.post(`${BASE_URL}/orders`, cartData);
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Failed to add product to cart!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="categories">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`category-btn ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />} {/* ✅ Spinner visible */}

      <div className="products">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>₹{product.price}</p>
            <div className="actions">
              <button onClick={() => addToCart(product)}>Add to Cart</button>
              <button onClick={() => handleBuyNow(product)}>Order Now</button>
            </div>
          </div>
        ))}
      </div>

      {popupVisible && (
        <div className="popup">
          <div className="popup-content">
            <h2>Enter Address Details</h2>
            <input
              type="text"
              name="line1"
              placeholder="Address Line 1"
              value={address.line1}
              onChange={handleAddressChange}
            />
            <input
              type="text"
              name="line2"
              placeholder="Address Line 2"
              value={address.line2}
              onChange={handleAddressChange}
            />
            <input
              type="text"
              name="landmark"
              placeholder="Landmark"
              value={address.landmark}
              onChange={handleAddressChange}
            />
            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={address.pincode}
              onChange={handleAddressChange}
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleAddressChange}
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleAddressChange}
            />

            <div className="popup-actions">
              <button onClick={confirmOrder}>Confirm Order</button>
              <button onClick={handleClosePopup}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
