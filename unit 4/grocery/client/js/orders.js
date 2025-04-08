document.addEventListener('DOMContentLoaded', () => {
    const port = "http://localhost:3000";
    const sortOrderSelect = document.getElementById('sort-order');
    const statusFilterSelect = document.getElementById('status-filter');
    let allOrders = [];
    let userType = ''; 

    const adminToken = localStorage.getItem('adminToken');
    const supplierId = localStorage.getItem('supplierId');

    if (adminToken) {
        userType = 'admin';
    } else if (supplierId) {
        userType = 'supplier';
    } else {
        alert('לא מחובר. יש להתחבר כדי לראות הזמנות.');
        window.location.href = 'index.html';
        return;
    }

    function fetchOrders() {
        let currentApiUrl = '';
        if (userType === 'supplier') {
            currentApiUrl = `${port}/suppliers/${localStorage.getItem('supplierId')}/orders`;
        } else if (userType === 'admin') {
            currentApiUrl = `${port}/orders`;
        }
        fetch(currentApiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(orders => {
                allOrders = orders;
                renderOrders(allOrders, userType); 
            })
            .catch(error => {
                console.error('שגיאה בטעינת ההזמנות:', error);
               // alert('אירעה שגיאה בטעינת ההזמנות. אנא נסה שוב מאוחר יותר.');
                const ordersListDiv = document.getElementById('orders-list');
                if (ordersListDiv) {
                    ordersListDiv.innerHTML = '<p>אירעה שגיאה בטעינת ההזמנות.</p>';
                }
            });
    }

    fetchOrders();
    
    function renderOrders(ordersToRender, userType) {
        // console.log('נתונים שהתקבלו מהשרת:', ordersToRender);
        const ordersListDiv = document.getElementById('orders-list');
        if (ordersListDiv) {
            const uniqueOrdersMap = new Map(); 
            ordersToRender.forEach(item => {
                if (!uniqueOrdersMap.has(item.order_id)) {
                    uniqueOrdersMap.set(item.order_id, {
                        order_id: item.order_id,
                        order_date: item.order_date,
                        status: item.status,
                        Total_Price: item.Total_Price,
                        products: []
                    });
                }
                // console.log('item: ', item)
                const order = uniqueOrdersMap.get(item.order_id);
                // console.log('order: ', order)
                order.products.push({
                    product_name: item.product_name,
                    quantity: item.quantity
                });
            });
            const uniqueOrders = Array.from(uniqueOrdersMap.values());
    
            let ordersHTML = '<div class="orders-grid">';
            if (uniqueOrders && uniqueOrders.length > 0) {
                uniqueOrders.forEach(order => {
                    let actionButtonHTML = '';
                    if (userType === 'supplier' && order.status === 'חדשה') {
                        actionButtonHTML = `<button class="confirm-order-btn" data-order-id="${order.order_id}">אשר הזמנה</button>`;
                    } else if (userType === 'admin' && order.status === 'בתהליך') {
                        actionButtonHTML = `<button class="complete-order-btn" data-order-id="${order.order_id}">השלם הזמנה</button>`;
                    }
    
                    ordersHTML += `
                        <div class="order-item">
                            <h3 class="order-id">הזמנה #${order.order_id}</h3>
                            <p class="order-date">תאריך: ${new Date(order.order_date).toLocaleDateString()}</p>
                            <p class="order-status">סטטוס: <span class="${order.status}">${order.status}</span></p>
                            <div class="order-details">
                                <h4>מוצרים:</h4>
                                <ul>
                                    ${order.products.map(product => `<li>${product.product_name} (${product.quantity})</li>`).join('')}
                                </ul>
                                <p class="order-total">סך הכל: ₪${order.Total_Price ? order.Total_Price.toFixed(2) : 'לא זמין'}</p>
                            </div>
                            <div class="order-actions">
                                ${actionButtonHTML}
                            </div>
                        </div>
                    `;
                });
            } else {
                ordersHTML += '<p>אין הזמנות להצגה לפי הסינון שבחרת.</p>';
            }
            ordersHTML += '</div>';
            ordersListDiv.innerHTML = ordersHTML;
    
            if (userType === 'supplier') {
                const confirmOrderButtons = document.querySelectorAll('.confirm-order-btn');
                confirmOrderButtons.forEach(button => {
                    button.addEventListener('click', (event) => {
                        const orderId = event.target.dataset.orderId;
                        confirmOrder(orderId);
                    });
                });
            } else if (userType === 'admin') {
                const completeOrderButtons = document.querySelectorAll('.complete-order-btn');
                completeOrderButtons.forEach(button => {
                    button.addEventListener('click', (event) => {
                        const orderId = event.target.dataset.orderId;
                        completeOrder(orderId);
                    });
                });
            }
        }
    }

    async function confirmOrder(orderId) {
        const apiUrl = `${port}/orders/${orderId}/approve`;
        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ supplierId: localStorage.getItem('supplierId') }) 
            });
            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            // console.log('הזמנה אושרה בהצלחה:', result);
            fetchOrders();
            alert(`הזמנה #${orderId} אושרה והועברה לסטטוס: בתהליך`);
        } catch (error) {
            console.error('שגיאה באישור הזמנה:', error);
            alert(`אירעה שגיאה באישור הזמנה #${orderId}. אנא נסה שוב.`);
        }
    }

    async function completeOrder(orderId) {
        const apiUrl = `${port}/orders/${orderId}/complete`;
        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            // console.log('הזמנה הושלמה בהצלחה:', result);
            fetchOrders();
            alert(`הזמנה #${orderId} עודכנה לסטטוס: הושלמה`);

        } catch (error) {
            console.error('שגיאה בהשלמת הזמנה:', error);
            alert(`אירעה שגיאה בהשלמת הזמנה #${orderId}. אנא נסה שוב.`);
        }
    }

    

    sortOrderSelect.addEventListener('change', () => {
        const sortValue = sortOrderSelect.value;
        if (sortValue === 'oldest') {
            allOrders.sort((a, b) => new Date(a.order_date) - new Date(b.order_date));
        } else if (sortValue === 'newest') {
            allOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
        }
        renderOrders(allOrders, userType); 
    });

    statusFilterSelect.addEventListener('change', () => {
        const filterValue = statusFilterSelect.value;
        const filteredOrders = allOrders.filter(order => {
            if (filterValue === '') {
                return true;
            }
            return order.status === filterValue;
        });
        renderOrders(filteredOrders, userType);
    });

    const newOrderButtonContainer = document.getElementById('new-order-button-container');

if (newOrderButtonContainer) {
        if (adminToken) {
            const newOrderButton = document.createElement('button');
            newOrderButton.textContent = 'הזמנה חדשה';
            newOrderButton.addEventListener('click', () => {
                window.location.href = 'new-order.html'; 
            });
            newOrderButtonContainer.appendChild(newOrderButton);
        }
    } else {
        console.warn('Element with id "new-order-button-container" not found.');
    }
});

