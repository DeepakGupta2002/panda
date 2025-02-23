


// Select elements
const loginForm = document.querySelector('#login form');
const registerForm = document.querySelector('#register form');
const logout = () => {
    const logoutButtonDisplay = document.querySelector("#logoutItem");

    // Set the display style to block to make it visible
    logoutButtonDisplay.style.display = 'block';

}

// Handle Login Form Submit
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();  // Prevent the default form submission behavior

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // If login is successful, store the token and show profile
            localStorage.setItem('token', data.token);
            alert('Login successful!');
            getProfile();  // Call the profile function to fetch user data
        } else {
            // If login failed, show error message
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Handle Register Form Submit
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();  // Prevent the default form submission behavior

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // If registration is successful, show success message
            alert('Registration successful!');
            document.querySelector('#login-tab').click();  // Switch to login tab after successful registration
        } else {
            // If registration failed, show error message
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
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            // Profile fetched successfully
            localStorage.setItem('user_i', data._id);

            // Hide modal
            $('#loginModal').modal('hide');


            // Make logout button visible
            if (typeof logout === "function") {
                logout(); // Ensure logout function exists
            } else {
                console.error("logout function is not defined");
            }

            // Welcome message
            alert('Welcome, ' + data.name);
        } else {
            // Handle unsuccessful response
            alert('Failed to fetch profile: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        // Handle network or other errors
        alert('Error: ' + error.message);
    }
}

// Toggle password visibility for login and register
document.getElementById('toggleLoginPassword').addEventListener('click', function () {
    const passwordField = document.getElementById('loginPassword');
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;
});

document.getElementById('toggleRegisterPassword').addEventListener('click', function () {
    const passwordField = document.getElementById('registerPassword');
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;
});

document.getElementById('toggleRegisterConfirmPassword').addEventListener('click', function () {
    const passwordField = document.getElementById('registerConfirmPassword');
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;
});

