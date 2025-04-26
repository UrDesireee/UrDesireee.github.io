document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');

    // Modal controls
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // Handle login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            loginModal.style.display = 'none';
            loginBtn.textContent = 'Logout';
            adminPanel.classList.remove('hidden');
            showNotification('Logged in successfully!', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // Check if user is already logged in
    checkUser().then(({ data: { user } }) => {
        if (user) {
            loginBtn.textContent = 'Logout';
            adminPanel.classList.remove('hidden');
        }
    });

    // Handle logout
    loginBtn.addEventListener('click', async (e) => {
        if (loginBtn.textContent === 'Logout') {
            e.preventDefault();
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;

                loginBtn.textContent = 'Login';
                adminPanel.classList.add('hidden');
                showNotification('Logged out successfully!', 'success');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    });
});

// Notification helper
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}