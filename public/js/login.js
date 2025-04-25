// Select elements
const loginForm = document.querySelector('#login form');
const registerForm = document.querySelector('#register form');

const logout = () => {
    const logoutButtonDisplay = document.querySelector("#logoutItem");
    logoutButtonDisplay.style.display = 'block';
};

// Handle Login Form Submit
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            alert('Login successful!');
            getProfile();
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Handle Register Form Submit
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful!');
            document.querySelector('#login-tab').click();
        } else {
            alert('Registration failed: ' + data.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Function to fetch user profile after login
async function getProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to view the profile');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/profile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        console.log(data);  // <-- fixed here

        if (response.ok) {
            localStorage.setItem('user_id', data._id);
            localStorage.setItem('user_name', data.name);
            localStorage.setItem('user_email', data.email);
            localStorage.setItem('razorpay_api_key', data.api_id);

            // Hide modal
            $('#loginModal').modal('hide');

            // Show logout button
            if (typeof logout === "function") {
                logout();
            } else {
                console.error("logout function is not defined");
            }

            // Welcome message
            alert('Welcome, ' + data.name);
        } else {
            alert('Failed to fetch profile: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Toggle password visibility for login and register
document.getElementById('toggleLoginPassword').addEventListener('click', function () {
    const pw = document.getElementById('loginPassword');
    pw.type = pw.type === 'password' ? 'text' : 'password';
});

document.getElementById('toggleRegisterPassword').addEventListener('click', function () {
    const pw = document.getElementById('registerPassword');
    pw.type = pw.type === 'password' ? 'text' : 'password';
});

document.getElementById('toggleRegisterConfirmPassword').addEventListener('click', function () {
    const pw = document.getElementById('registerConfirmPassword');
    pw.type = pw.type === 'password' ? 'text' : 'password';
});
