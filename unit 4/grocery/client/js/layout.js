function loadNav() {
    const navContainer = document.getElementById('nav-container');
    if (navContainer) {
        const navHTML = `
            <nav class="nav-bar">
                <ul class="nav-links">
                    <li><a href="orders.html">הזמנות</a></li>
                    <li><a href="profile.html">פרופיל</a></li>
                    <li><button id="logout-btn">התנתקות</button></li>
                </ul>
            </nav>
        `;
        navContainer.innerHTML = navHTML;

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('supplierId'); 
                alert('התנתקת בהצלחה!');
                window.location.href = 'index.html'; 
            });
        }
    } else {
        console.warn('Element with id "nav-container" not found.');
    }
}

function loadFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        const footerHTML = `
            <footer class="footer">
                <div class="footer-content">
                    <p>&copy; ${new Date().getFullYear()} כל הזכויות שמורות | המכולת שלך</p>
                    <ul class="footer-links">
                        <li><a href="terms.html">תנאי שימוש</a></li>
                        <li><a href="privacy.html">מדיניות פרטיות</a></li>
                    </ul>
                </div>
            </footer>
        `;
        footerContainer.innerHTML = footerHTML;
    } else {
        console.warn('Element with id "footer-container" not found.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadNav();
    loadFooter();
});