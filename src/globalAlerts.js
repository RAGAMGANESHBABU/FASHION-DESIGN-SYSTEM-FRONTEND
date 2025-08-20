// Inject CSS globally
(function() {
  const style = document.createElement("style");
  style.innerHTML = `
    .custom-alert {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      font-size: 16px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      animation: slideDown 0.5s ease, fadeOut 0.5s ease 3s forwards;
      z-index: 9999;
    }
    .custom-alert.error {
      background: #f44336;
    }
    @keyframes slideDown {
      from { transform: translateY(-50px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeOut {
      to { opacity: 0; transform: translateY(-20px); }
    }
  `;
  document.head.appendChild(style);

  // Override window.alert
  window.alert = function(msg, type="success") {
    const alertBox = document.createElement("div");
    alertBox.className = `custom-alert ${type === "error" ? "error" : ""}`;
    alertBox.innerText = msg;
    document.body.appendChild(alertBox);

    setTimeout(() => alertBox.remove(), 4000);
  };
})();
