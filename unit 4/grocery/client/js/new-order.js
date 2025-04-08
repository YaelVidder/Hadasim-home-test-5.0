document.addEventListener('DOMContentLoaded', () => {
    const port = "http://localhost:3000";
    const suppliersContainer = document.getElementById('suppliers-container');
    const submitOrderBtn = document.getElementById('submit-order-btn');
    const orderSummaryDiv = document.getElementById('order-summary');

    let allSuppliers = [];
    let orderItems = {};

    function loadSuppliers() {
        const currentApiUrl = `${port}/suppliers`;
        fetch(currentApiUrl)
            .then(response => response.json())
            .then(suppliers => {
                allSuppliers = suppliers;
                displaySuppliers(suppliers);
            })
            .catch(error => {
                console.error('שגיאה בטעינת ספקים:', error);
                suppliersContainer.innerHTML = '<p>אירעה שגיאה בטעינת רשימת הספקים.</p>';
            });
    }

    function displaySuppliers(suppliers) {
        suppliersContainer.innerHTML = '';
        suppliers.forEach(supplier => {
            const supplierSection = document.createElement('div');
            supplierSection.classList.add('supplier-section');
            const supplierName = document.createElement('h2');
            supplierName.classList.add('supplier-name');
            supplierName.textContent = supplier.company_name || `ספק #${supplier.supplier_id}`;
            const productsList = document.createElement('ul');
            productsList.classList.add('products-list');
            loadProductsForSupplier(supplier.supplier_id, productsList);
            supplierSection.appendChild(supplierName);
            supplierSection.appendChild(productsList);
            suppliersContainer.appendChild(supplierSection);
        });
    }

    function loadProductsForSupplier(supplierId, productsListElement) {
        const currentApiUrl = `${port}/products/${supplierId}`;
        fetch(currentApiUrl)
            .then(response => response.json())
            .then(products => {
                displayProductsForSupplier(supplierId, products, productsListElement);
            })
            .catch(error => {
                console.error(`שגיאה בטעינת מוצרים עבור ספק ${supplierId}:`, error);
                productsListElement.innerHTML = '<li>אירעה שגיאה בטעינת המוצרים.</li>';
            });
    }

    function displayProductsForSupplier(supplierId, products, productsListElement) {
        products.forEach(product => {
            const listItem = document.createElement('li');
            listItem.classList.add('product-item');
    
            const productInfo = document.createElement('div');
            productInfo.classList.add('product-info');
    
            const productName = document.createElement('div');
            productName.classList.add('product-name');
            productName.textContent = product.product_name;
    
            const productDetails = document.createElement('div');
            productDetails.classList.add('product-details');
    
            const priceSpan = document.createElement('span');
            priceSpan.classList.add('product-price');
            priceSpan.textContent = `מחיר: ${product.price ? product.price.toFixed(2) : 'לא זמין'}`;
    
            const minimumQuantitySpan = document.createElement('span');
            minimumQuantitySpan.classList.add('minimum-quantity');
            minimumQuantitySpan.textContent = `מינימום: ${product.minimum_quantity || 1}`;
    
            productDetails.appendChild(priceSpan);
            productDetails.appendChild(minimumQuantitySpan);
    
            productInfo.appendChild(productName);
            productInfo.appendChild(productDetails);
    
            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.classList.add('quantity-input');
            quantityInput.min = product.minimum_quantity || '1';
            quantityInput.value = '0';
            quantityInput.dataset.productId = product.product_id;
            quantityInput.addEventListener('change', (event) => {
                handleQuantityChange(supplierId, product.product_id, parseInt(event.target.value));
            });
    
            listItem.appendChild(productInfo);
            listItem.appendChild(quantityInput);
            productsListElement.appendChild(listItem);
        });
    }

    function handleQuantityChange(supplierId, productId, quantity) {
        if (!orderItems[supplierId]) {
            orderItems[supplierId] = {};
        }
        if (quantity > 0) {
            orderItems[supplierId][productId] = quantity;
        } else {
            delete orderItems[supplierId][productId];
            if (Object.keys(orderItems[supplierId]).length === 0) {
                delete orderItems[supplierId];
            }
        }
        submitOrderBtn.disabled = Object.keys(orderItems).length === 0;
        // console.log('פריטי הזמנה נוכחיים:', orderItems);
    }

    function submitOrder() {
        if (Object.keys(orderItems).length > 0) {
            const orderPromises = [];
            for (const supplierId in orderItems) {
                const productsToOrder = Object.keys(orderItems[supplierId]).map(productId => ({
                    product_id: parseInt(productId),
                    quantity: orderItems[supplierId][productId]
                }));

                const orderData = {
                    supplier_id: parseInt(supplierId),
                    products: productsToOrder
                };

                // console.log('שולח הזמנה עבור ספק:', supplierId, 'נתונים:', orderData);

                const currentApiUrl = `${port}/orders`;
                const promise = fetch(currentApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // console.log('תגובה מהשרת עבור ספק', supplierId, ':', data);
                    return { supplierId: supplierId, success: true, data: data };
                })
                .catch(error => {
                    console.error('שגיאה בשליחת ההזמנה עבור ספק', supplierId, ':', error);
                    return { supplierId: supplierId, success: false, error: error };
                });
                orderPromises.push(promise);
            }

            Promise.all(orderPromises)
                .then(results => {
                    let allSuccessful = true;
                    results.forEach(result => {
                        if (result.success) {
                            alert(`הזמנה מספק ${result.supplierId} בוצעה בהצלחה!`);
                        } else {
                            allSuccessful = false;
                            alert(`אירעה שגיאה בהזמנה מספק ${result.supplierId}: ${result.error.message}. אנא נסה שוב.`);
                        }
                    });
                    resetOrderForm(); 
                });

        } else {
            alert('בחר לפחות מוצר אחד כדי לבצע הזמנה.');
        }
    }

    function resetOrderForm() {
        orderItems = {};
        submitOrderBtn.disabled = true;
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.value = '0';
        });
    }

    loadSuppliers();
    submitOrderBtn.addEventListener('click', submitOrder);
});