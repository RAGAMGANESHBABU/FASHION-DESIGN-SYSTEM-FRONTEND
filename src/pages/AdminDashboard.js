import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [product, setProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
  });
  const [image, setImage] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products');
    setProducts(res.data);
  };

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('price', product.price);
    formData.append('description', product.description);
    formData.append('category', product.category);
    formData.append('image', image);

    try {
      await axios.post('http://localhost:5000/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Product added!');
      setProduct({ name: '', price: '', description: '', category: '' });
      setImage(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="admin-container">
        <form onSubmit={handleSubmit} className="product-form">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={product.name}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Product Price"
            value={product.price}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Product Description"
            value={product.description}
            onChange={handleChange}
            rows="5"
            required
          />
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
            <option value="Accessories">Accessories</option>
          </select>
          <input type="file" accept="image/*" onChange={handleImageChange} required />
          <button type="submit">Add Product</button>
        </form>

        <div className="product-list">
          {products.length === 0 ? (
            <p className="no-products">No products added.</p>
          ) : (
            products.map((prod) => (
              <div key={prod._id} className="product-item">
                <img src={`http://localhost:5000/uploads/${prod.image}`} alt={prod.name} />
                <h4>{prod.name}</h4>
                <p>₹{prod.price}</p>
                <p>{prod.category}</p>
                <button onClick={() => handleDelete(prod._id)}>Delete</button>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
};

export default AdminDashboard;
