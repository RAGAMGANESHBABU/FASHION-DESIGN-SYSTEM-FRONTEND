import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import './Dashboard.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchProducts = async (category) => {
    try {
      const url =
        category === 'All'
          ? `${BASE_URL}/products`
          : `${BASE_URL}/products?category=${category}`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const categories = ['All', 'Men', 'Women', 'Kids', 'Footwear', 'Accessories', 'Seasonal'];

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
                className={selectedCategory === cat ? 'active-category' : ''}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>

        <main className="dashboard-content">
          <h1>{selectedCategory} Products</h1>
          {products.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>
              No products available in this category.
            </p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div className="product-card" key={product._id}>
                  <img
                    src={`${BASE_URL.replace('/api', '')}/uploads/${product.image}`}
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-card-content">
                    <h3>{product.name}</h3>
                    <p>₹{product.price}</p>
                    <p>{product.description}</p>
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
 