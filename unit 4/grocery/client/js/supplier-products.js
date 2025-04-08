document.addEventListener('DOMContentLoaded', () => {
    const port = "http://localhost:3000";
    const productList = document.getElementById('product-list');
    const addProductForm = document.getElementById('add-product-form');
    const productNameInput = document.getElementById('product-name');
    const priceInput = document.getElementById('price');
    const minimumQuantityInput = document.getElementById('minimum-quantity');

    const adminToken = localStorage.getItem('adminToken');
    const supplierId = localStorage.getItem('supplierId');

    let userType = '';

    if (adminToken) {
        userType = 'admin';
        return;
    } else if (supplierId) {
        userType = 'supplier';
    } else {
        alert('לא מחובר. יש להתחבר כדי לראות פרופיל.');
        window.location.href = 'index.html';
        return;
    }
    

    if (!supplierId) {
        console.error('Supplier ID not found. Redirecting to login.');
        window.location.href = 'index.html';
        return;
    }

    // פונקציה לטעינת רשימת המוצרים של הספק
    const loadSupplierProducts = async () => {
        productList.innerHTML = '<tr><td colspan="3">טוען רשימת מוצרים...</td></tr>';
        try {
            const response = await fetch(`${port}/products/${supplierId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.length > 0) {
                productList.innerHTML = data.map(product => `
                    <tr>
                        <td>${product.product_name}</td>
                        <td>${product.price}</td>
                        <td>${product.minimum_quantity}</td>
                    </tr>
                `).join('');
            } else {
                productList.innerHTML = '<tr><td colspan="3">אין מוצרים רשומים.</td></tr>';
            }
        } catch (error) {
            console.error('Failed to load supplier products:', error);
            productList.innerHTML = '<tr><td colspan="3">אירעה שגיאה בטעינת המוצרים.</td></tr>';
        }
    };

    loadSupplierProducts();

    addProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const productName = productNameInput.value.trim();
        const price = parseFloat(priceInput.value);
        const minimumQuantity = parseInt(minimumQuantityInput.value);

        if (productName && !isNaN(price) && !isNaN(minimumQuantity)) {
            try {
                const response = await fetch(`${port}/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        product_name: productName,
                        price: price,
                        minimum_quantity: minimumQuantity,
                        supplier_id: supplierId
                    })
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                productNameInput.value = '';
                priceInput.value = '';
                minimumQuantityInput.value = '';
                await loadSupplierProducts();
                alert('המוצר נוסף בהצלחה!');
            } catch (error) {
                console.error('Failed to add product:', error);
                alert(`אירעה שגיאה בהוספת המוצר: ${error.message}`);
            }
        } else {
            alert('יש למלא את כל השדות בצורה תקינה.');
        }
    });
});