const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const adminLoginSection = document.getElementById('admin-login-section');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const showAdminLoginBtn = document.getElementById('show-admin-login');
const showSupplierLoginLink = document.querySelector('#admin-login-section .toggle-link a');
const adminLoginForm = document.getElementById('admin-login-form');

const port = "http://localhost:3000"

showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.classList.remove('active');
    adminLoginSection.classList.remove('active');
    signupSection.classList.add('active');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupSection.classList.remove('active');
    adminLoginSection.classList.remove('active');
    loginSection.classList.add('active');
});

showAdminLoginBtn.addEventListener('click', () => {
    loginSection.classList.remove('active');
    signupSection.classList.remove('active');
    adminLoginSection.classList.add('active');
});

showSupplierLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    adminLoginSection.classList.remove('active');
    signupSection.classList.remove('active');
    loginSection.classList.add('active');
});

async function handleFormSubmission(isSignUp, formData, isAdmin = false) {
    const url = isSignUp ? `${port}/suppliers/register` : isAdmin ? `${port}/admin/login` : `${port}/suppliers/login`;
    const method = 'POST';
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify(formData);

    try {
        const response = await fetch(url, { method, headers, body });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }

        if (isAdmin) {
            // console.log('Admin login successful:', result);
            localStorage.setItem('adminToken', result.adminToken || 'dummyAdminToken'); 
            localStorage.removeItem('supplierId');
            alert('התחברת כמנהל בהצלחה!');
            window.location.href = 'orders.html'; 
        } else if (isSignUp) {
            alert('הרשמה בוצעה בהצלחה!');
            loginSection.classList.add('active');
            signupSection.classList.remove('active');
        } else {
            // console.log('Supplier login successful:', result);
            localStorage.setItem('supplierId', result.supplierId);
            localStorage.removeItem('adminToken');
            alert('התחברת כספק בהצלחה!');
            window.location.href = 'orders.html';
        }

    } catch (error) {
        console.error(isSignUp ? 'שגיאת הרשמה:' : isAdmin ? 'שגיאת התחברות מנהל:' : 'שגיאת התחברות ספק:', error);
        alert('משהו השתבש, נסה שוב!');
    }
}

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
        identifier: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    };
    handleFormSubmission(false, formData);
});

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
        company_name: document.getElementById('signup-name').value,
        phone_number: document.getElementById('signup-phone').value,
        representative_name: document.getElementById('signup-representative').value,
        email: document.getElementById('signup-email').value,
        password: document.getElementById('signup-password').value
    };
    handleFormSubmission(true, formData);
});

adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
        password: document.getElementById('admin-password').value
    };
    handleFormSubmission(false, formData, true); 
});

document.getElementById('signup-phone').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

signupSection.classList.remove('active');
adminLoginSection.classList.remove('active'); 