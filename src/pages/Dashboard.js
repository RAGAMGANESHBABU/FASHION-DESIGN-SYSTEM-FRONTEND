import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Get userId from localStorage
const userId = JSON.parse(localStorage.getItem("user"))._id; // just _id

  // ✅ If not logged in → redirect
  useEffect(() => {
    if (!userId) {
      alert("⚠️ Please login to continue");
      navigate("/login");
    }
  }, [userId, navigate]);

  // Fetch products
  const fetchProducts = async (category) => {
    try {
      setLoading(true);
      const url =
        category === 'All'
          ? `${BASE_URL}/products`
          : `${BASE_URL}/products?category=${encodeURIComponent(category)}`;

      const response = await axios.get(url);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const categories = ['All', 'Men', 'Women', 'Kids', 'Footwear', 'Accessories', 'Seasonal'];

  // Add to Cart
 // Buy Now
// Buy Now
const handleBuyNow = async (productId) => {
  
  try {
    await axios.post(`${BASE_URL}/orders`, {
      user: userId,
      product: productId, // ✅ single product only
      isCart: false
    });
    alert("✅ Order Placed Successfully!");
    navigate('/orders');
  } catch (err) {
    console.error("Error buying product:", err);
    alert("❌ Failed to place order");
  }
};

// Add to Cart
const handleAddToCart = async (productId) => {
  
  try {
    await axios.post(`${BASE_URL}/orders`, {
      user: userId,
      product: productId, // ✅ single product only
      isCart: true
    });
    alert("✅ Product added to Cart!");
    navigate('/cart');
  } catch (err) {
    console.error("Error adding to cart:", err);
    alert("❌ Failed to add product to Cart");
  }
};



  return (
    <div>
      <Navbar />
      <div className="dashboard-layout">
        
        {/* Sidebar */}
        <aside className="sidebar">
          <h2>Categories</h2>
          <ul>
            {categories.map((cat) => (
              <li
                key={cat}
                className={selectedCategory === cat ? 'active-category' : ''}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <h1>{selectedCategory} Products</h1>

          {loading ? (
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
          ) : products.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>
              No products available in this category.
            </p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div className="product-card" key={product._id}>
                  <img
                    src={
                      product.image?.startsWith('data:')
                        ? product.image
                        : `data:image/jpeg;base64,${product.image}`
                    }
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-card-content">
                    <h3>{product.name}</h3>
                    <p className="product-price">₹{product.price}</p>
                    <p className="product-description">{product.description}</p>
                    <div className="product-buttons">
                      <button
                        onClick={() => handleBuyNow(product._id)}
                        className="buy-btn"
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className="cart-btn"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
