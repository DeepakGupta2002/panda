
const userId = localStorage.getItem('user_i'); // Ensure the user ID is available

// Fetch product details


// Render products on the page

// Function to show the custom alert modal
function showAlert(message) {
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message; // Set the alert message
    const alertModal = new bootstrap.Modal(document.getElementById('alertModal')); // Get the modal
    alertModal.show(); // Show the modal
}

// Fetch cart details
async function fetchCart() {
    try {
        const response = await fetch(`http://localhost:3000/api/cart?userId=${userId}`);
        const { cart } = await response.json();
        renderCart(cart);

    } catch (error) {
        console.error("Error fetching cart:", error);
        showAlert("Failed to update cart.");
    }
}

// Render cart details
function renderCart(cart) {
    const cartBody = document.getElementById("cart-table-body");
    const subTotalEl = document.getElementById("sub-total");

    cartBody.innerHTML = cart.items.map(item => {
        const product = item.productId; // Product object
        const price = product.price || 0; // Default price to 0 if undefined
        const total = price * item.quantity; // Calculate total price
        const imageUrl = product.images && product.images[0] ? product.images[0] : "https://via.placeholder.com/150"; // Fallback image

        return `
                    <tr>
                        <td><img src="${imageUrl}" alt="${product.name}" class="img-fluid" width="50" height="50"></td>
                        <td>${product.name}</td>
                        <td>
                            <button class="btn btn-warning" onclick="updateCart('${item.productId._id}', ${item.quantity - 1})">-</button>
                            ${item.quantity}
                            <button class="btn btn-info" onclick="updateCart('${item.productId._id}', ${item.quantity + 1})">+</button>
                        </td>
                        <td>₹${price}</td>
                        <td>₹${total}</td>
                        <td>
                            <button class="btn btn-danger" onclick="removeFromCart('${item.productId._id}')">Remove</button>
                        </td>
                    </tr>
                `;
    }).join('');

    // Update subtotal
    const subTotal = cart.items.reduce((total, item) => {
        return total + item.productId.price * item.quantity;
    }, 0);
    subTotalEl.innerText = `₹${subTotal.toFixed(2)}`;
}

// Add product to cart


// Update product quantity in cart
async function updateCart(productId, quantity) {
    try {
        const response = await fetch(`http://localhost:3000/api/cart/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: userId,
                productId: productId,
                quantity: quantity,
            }),
        });

        if (response.ok) {
            fetchCart(); // Refresh cart
        } else {
            showAlert("Failed to update cart.");
        }
    } catch (error) {
        console.error("Error updating cart:", error);

    }
}

// Remove product from cart
async function removeFromCart(productId) {
    try {
        const response = await fetch(`http://localhost:3000/api/cart/remove`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: userId,
                productId: productId,
            }),
        });

        if (response.ok) {
            fetchCart(); // Refresh cart
        } else {
            showAlert("Failed to remove product from cart.");

        }
    } catch (error) {
        console.error("Error removing product from cart:", error);
    }
}

// Checkout action



// Initial data fetch

fetchCart();

const backButton = document.getElementById("back-button");

backButton.addEventListener("click", () => {
    // Check if the loading indicator has already been shown in the current session
    if (!sessionStorage.getItem('loadingShown')) {
        // Show loading indicator
        document.body.innerHTML += `<div id="loading-indicator" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
            color: #333;
            z-index: 9999;
        ">Loading...</div>`;

        // Set sessionStorage to track that the loading indicator was shown
        sessionStorage.setItem('loadingShown', 'true');
    }

    // Redirect to category.html after a slight delay
    setTimeout(() => {
        window.location.href = "cotegory.html"; // Redirect to category.html
    }, 100); // Optional small delay for effect
});

