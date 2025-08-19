import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "./Navbar";
import "./Dashboard.css";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/products`);
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setLoading(false);
    }
  };

  const handleBuyNow = async (product) => {
    try {
      await axios.post(`${BASE_URL}/orders`, {
        productId: product._id,
        quantity: 1,
      });
      alert("Order placed successfully!");
    } catch (err) {
      console.error("Error buying product:", err);
      alert("Error placing order");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="dashboard-container">
        <h2>Available Products</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <img
                  src={product.image}   // ✅ directly use image
                  alt={product.name}
                  className="product-image"
                />
                <h3>{product.name}</h3>
                <p>₹{product.price}</p>
                <button onClick={() => handleBuyNow(product)}>Buy Now</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
