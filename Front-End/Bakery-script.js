const form = document.getElementById('orderForm');
const tableBody = document.getElementById('ordersBody');

// ===================== SET BACKEND URL =====================
const API_URL = 'https://locsweetcrustbakery-production.up.railway.app/api/orders';

// ===================== VIEW/DISPLAY ALL ORDERS =====================
function displayOrder(order) {
    const row = document.createElement('tr');
    
    // Debug: Check which data is being received
    console.log('Order data:', order);
    row.innerHTML = `
        <td>${order.Order_ID || order.id || 'N/A'}</td>
        <td>${order.Customer_Name || order.customer || 'N/A'}</td>
        <td>${order.Product || order.product || 'N/A'}</td>
        <td>${order.Quantity || order.quantity || 'N/A'}</td>
        <td>${order.Order_date ? new Date(order.Order_date).toLocaleDateString() : 'Invalid Date'}</td>
        <td>
        <select class="status">
          <option value="Pending" ${(order.Status || order.status) === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Completed" ${(order.Status || order.status) === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
        </td>
        <td><button class="delete">Delete</button></td>
    `;

    // ===================== UPDATE ORDER STATUS =====================
    const orderId = order.Order_ID || order.id;
    row.querySelector('.status').addEventListener('change', function () {
        const newStatus = this.value;
        fetch(`${API_URL}/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            alert(`Order number ${orderId} status updated to "${newStatus}"`);
        })
        .catch(err => alert('Error updating status: ' + err.message));
    });

    // ===================== DELETE ORDER =====================
    row.querySelector('.delete').addEventListener('click', function () {
        if (!confirm(`Are you sure you want to delete order number ${orderId}?`)) return;
        fetch(`${API_URL}/${orderId}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                row.remove();
                alert(`Order number ${orderId} deleted successfully!`);
            })
            .catch(err => alert('Error deleting order: ' + err.message));
    });

    tableBody.appendChild(row);
}

// ===================== LOAD ALL ORDERS ON THE TABLE =====================
function loadOrders() {
    tableBody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error('Network response was not okay');
            return res.json();
        })
        .then(orders => {
            console.log('Orders received:', orders); // Debug line
            tableBody.innerHTML = '';
            
            if (!Array.isArray(orders) || orders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7">No orders found.</td></tr>';
                return;
            }
            
            orders.forEach(displayOrder);
        })
        .catch(err => {
            console.error('Error loading orders:', err);
            tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error loading orders: ${err.message}</td></tr>`;
        });
}

// ===================== ADD NEW ORDER =====================
form.addEventListener('submit', function (e) {
    e.preventDefault();
    
    // Get all form values including new fields
    const orderId = document.getElementById('orderId').value.trim();
    const customer = document.getElementById('customerName').value.trim();
    const product = document.getElementById('product').value.trim();
    const quantity = document.getElementById('quantity').value.trim();
    const order_date = document.getElementById('orderDate').value;
    const status = document.getElementById('status').value;

    // Check if all fields are filled
    if (!orderId || !customer || !product || !quantity || !order_date || !status) {
        alert('Please fill in all fields.');
        return;
    }

    // Create order object with all fields
    const newOrder = { orderId, customer, product, quantity, order_date, status 
    };

    // Send to backend
    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
    })
    .then(res => res.json())
    .then(order => {
        if (order.error) throw new Error(order.error);
        displayOrder(order);
        form.reset();
        alert('Order added successfully!');
    })
    .catch(err => alert('Error adding order: ' + err.message));
});

// Initial load
document.addEventListener('DOMContentLoaded', loadOrders);