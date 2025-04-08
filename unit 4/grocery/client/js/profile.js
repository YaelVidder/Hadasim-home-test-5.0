document.addEventListener('DOMContentLoaded', () => {

    const adminToken = localStorage.getItem('adminToken');
    const supplierId = localStorage.getItem('supplierId');
    const port = "http://localhost:3000";
    const profileDetailsDiv = document.getElementById('profile-details');
    const supplierProductsDiv = document.getElementById('supplier-products');

    let userType = '';

    if (adminToken) {
        userType = 'admin';
    } else if (supplierId) {
        userType = 'supplier';
    } else {
        alert('לא מחובר. יש להתחבר כדי לראות פרופיל.');
        window.location.href = 'index.html';
        return;
    }
    

    if (userType === 'admin') {
        if (profileDetailsDiv) {
            profileDetailsDiv.innerHTML = `
                <p><b>כניסת מנהל</b></p>
                <p>למנהלים אין פרופיל ספק.</p>
                <p>כאן יוצגו בעתיד כלים ומידע ניהולי.</p>
            `;
        }
        if (supplierProductsDiv) {
            supplierProductsDiv.style.display = 'none'; 
        }
        return; 
    }

    if (userType === 'supplier') {
        // console.log('User type is supplier:', supplierId);
        if (!supplierId) {
            alert('לא מחובר כספק. יש להתחבר כספק כדי לראות את הפרופיל.');
            window.location.href = 'index.html';
            return;
        }

        const apiUrl = `${port}/suppliers/${supplierId}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(profile => {
                if (profileDetailsDiv) {
                    // console.log('Profile data:', profile);
                    profileDetailsDiv.innerHTML = `
                        <p><b>שם החברה:</b> ${profile.company_name || 'לא זמין'}</p>
                        <p><b>שם נציג:</b> ${profile.representative_name || 'לא זמין'}</p>
                        <p><b>טלפון:</b> ${profile.phone_number || 'לא זמין'}</p>
                        <p><b>אימייל:</b> ${profile.email || 'לא זמין'}</p>
                    `;
                }
                if (supplierProductsDiv) {
                    loadSupplierProducts(supplierId);
                }
            })
            .catch(error => {
                console.error('שגיאה בטעינת הפרופיל:', error);
                alert('אירעה שגיאה בטעינת הפרופיל. אנא נסה שוב מאוחר יותר.');
                if (profileDetailsDiv) {
                    profileDetailsDiv.innerHTML = '<p>אירעה שגיאה בטעינת הפרופיל.</p>';
                }
            });

        function loadSupplierProducts(supplierId) {
            const productsTableBody = document.getElementById('product-list');
            const productsApiUrl = `${port}/products/${supplierId}`;
            if (productsTableBody) {
                productsTableBody.innerHTML = '<tr><td colspan="3">טוען רשימת מוצרים...</td></tr>';
                fetch(productsApiUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(products => {
                        productsTableBody.innerHTML = '';
                        if (products && products.length > 0) {
                            products.forEach(product => {
                                const row = productsTableBody.insertRow();
                                row.insertCell().textContent = product.product_name || 'לא זמין';
                                row.insertCell().textContent = product.price || 'לא זמין';
                                row.insertCell().textContent = product.minimum_quantity || 'לא זמין';
                            });
                        } else {
                            productsTableBody.innerHTML = '<tr><td colspan="3">אין מוצרים להצגה.</td></tr>';
                        }
                    })
                    .catch(error => {
                        console.error('שגיאה בטעינת המוצרים:', error);
                        productsTableBody.innerHTML = '<tr><td colspan="3">אירעה שגיאה בטעינת המוצרים.</p>';
                    });
            }
        }
    }
});