document.getElementById('logoutLink').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default anchor behavior

    // Remove token from localStorage
    localStorage.removeItem('token');

    // Clear token from cookies (if used)
    // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Redirect to login page or show login modal
    window.location.href = '/login.html'; // Replace with your login page URL
});