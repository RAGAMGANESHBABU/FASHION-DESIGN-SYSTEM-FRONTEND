import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import './AdminDashboard.css';

const BASE_URL = 'https://fashion-design-system-backend.vercel.app/api';

function AdminDashboard() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Men');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null); // Track update mode

  // Convert file → base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Small preview (browser blob)
    setPreview(URL.createObjectURL(file));

    // Save base64 for DB
    const reader = new FileReader();
    reader.onloadend = () => setImageFile(reader.result);
    reader.readAsDataURL(file);
  };


  // Fetch products on page load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Add or Update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !description || !imageFile || !category) {
      setMessage('⚠️ Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      if (editingId) {
        // Update product
        await axios.put(`${BASE_URL}/products/${editingId}`, {
          name,
          price: Number(price),
          description,
          category,
          image: imageFile,
        });
        alert(' Product updated successfully!');
      } else {
        // Add product
        await axios.post(`${BASE_URL}/products`, {
          name,
          price: Number(price),
          description,
          category,
          image: imageFile,
        });
        alert('✅ Product added successfully!');
      }

      // Reset form
      setName('');
      setPrice('');
      setDescription('');
      setCategory('Men');
      setImageFile(null);
      setEditingId(null);
      fetchProducts(); // refresh list
    } catch (err) {
      console.error('Error saving product:', err.response?.data || err.message);
      setMessage('❌ Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  // Load product into form for editing
  const handleEdit = (product) => {
    setEditingId(product._id);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description);
    setCategory(product.category);
    setImageFile(product.image);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${BASE_URL}/products/${id}`);
      setMessage('🗑️ Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err.response?.data || err.message);
      setMessage('❌ Failed to delete product.');
    }
  };

  return (
    <div>
      <AdminNavbar />
      <div className="admin-dashboard">
        <h1>{editingId ? 'Update Product' : 'Add New Product'}</h1>
        {message && <p className="status-message">{message}</p>}
        <form className="product-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Men</option><option>Women</option><option>Kids</option>
            <option>Footwear</option><option>Accessories</option><option>Seasonal</option>
          </select>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {preview && <img src={preview} alt="Preview" className="preview-image" />}

          <button type="submit" disabled={loading}>{loading ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}</button>
        </form>

        {/* Product List */}
        <h2>All Products</h2>
        <div className="product-list">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>
              <p>{product.description}</p>
              <p><b>{product.category}</b></p>
              <button onClick={() => handleEdit(product)}>✏️ Edit</button>
              <button onClick={() => handleDelete(product._id)}>🗑️ Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
