import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";
import LoadingSpinner from "./LoadingSpinner";
import "./AdminOrders.css";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled"
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingMap, setUpdatingMap] = useState({}); // { [orderId]: true }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${BASE_URL}/orders`, { headers });
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    // optimistic UI: update local state first then persist
    const previous = orders.find((o) => o._id === orderId);
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));

    setUpdatingMap((m) => ({ ...m, [orderId]: true }));
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // send only the status field; backend should accept patch
      await axios.patch(`${BASE_URL}/orders/${orderId}`, { status: newStatus }, { headers });
      // success — state already updated
      // optionally show a small confirmation
      // alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status", err);
      // revert on failure
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: previous?.status || "—" } : o)));
      alert("Failed to update status. Try again.");
    } finally {
      setUpdatingMap((m) => {
        const copy = { ...m };
        delete copy[orderId];
        return copy;
      });
    }
  };

  return (
    <div>
      <AdminNavbar />

      {loading && <LoadingSpinner />}

      <div className="admin-orders">
        <h2>All Orders</h2>

        {!loading && orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.customerName || order.user?.name || "—"}</td>

                  <td>
                    {Array.isArray(order.products)
                      ? order.products.map((p, idx) => (
                          <span key={p._id ?? `${p}-${idx}`}>
                            {p.name ?? p}
                            {idx < order.products.length - 1 ? ", " : ""}
                          </span>
                        ))
                      : order.product
                      ? order.product.name ?? order.product
                      : "—"}
                  </td>

                  <td>₹{order.totalAmount ?? order.total ?? 0}</td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <select
                        value={order.status ?? "Pending"}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={!!updatingMap[order._id]}
                        aria-label={`Change status for order ${order._id}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      {updatingMap[order._id] && (
                        <span style={{ fontSize: 12, color: "#666" }}>Updating...</span>
                      )}
                    </div>
                  </td>

                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
