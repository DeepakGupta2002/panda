
const categoriesContainer = document.getElementById("categories-container");
const productsContainer = document.getElementById("products-container");
const categoriesSection = document.getElementById("categories-section");
const productsSection = document.getElementById("products-section");
const backToCategoriesButton = document.getElementById("back-to-categories");
const cartCountElement = document.getElementById("cart-count");
const userId = localStorage.getItem('user_i');

// Fetch categories
async function fetchCategories() {
    const res = await fetch("http://localhost:3000/api/categories");
    const categories = await res.json();
    renderCategories(categories);
}

// Fetch products by category
async function fetchProducts(categoryId) {
    const res = await fetch("http://localhost:3000/api/products");
    const products = await res.json();
    const filteredProducts = products.filter(
        (product) => product.categoryId._id === categoryId
    );
    renderProducts(filteredProducts);
}

// Render categories
function renderCategories(categories) {
    categoriesContainer.innerHTML = "";
    categories.forEach((category) => {
        const categoryElement = document.createElement("div");
        categoryElement.className = "circular-image";
        categoryElement.innerHTML = `<img src="${category.imageUrl}" alt="${category.name}" />`;
        categoryElement.addEventListener("click", () => {
            categoriesSection.classList.add("d-none");
            productsSection.classList.remove("d-none");
            backToCategoriesButton.style.display = "block"; // Show back button
            fetchProducts(category._id);
        });

        const categoryWrapper = document.createElement("div");
        categoryWrapper.className = "col-4 col-md-2 text-center";
        categoryWrapper.appendChild(categoryElement);

        const categoryName = document.createElement("p");
        categoryName.className = "category-name";
        categoryName.textContent = category.name;
        categoryWrapper.appendChild(categoryName);

        categoriesContainer.appendChild(categoryWrapper);
    });
}

// Render products
function renderProducts(products) {
    productsContainer.innerHTML = "";
    if (products.length === 0) {
        productsContainer.innerHTML = "<p>No products available for this category.</p>";
        return;
    }
    products.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.className = "product-card m-2";
        productCard.innerHTML = `
    <img src="${product.images[0]}" alt="${product.name}" />
    <h5>${product.name}</h5>
    <p>${product.description}</p>
    <p><strong>Price:</strong> ₹${product.price}</p>
    <button class="btn btn-success btn-sm add-to-cart-btn" data-product-id="${product._id}">Add to Cart</button>
`;
        productsContainer.appendChild(productCard);
    });

    // Attach event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", async (event) => {
            const productId = event.target.getAttribute("data-product-id");
            await addToCart(productId);
        });
    });
}

// Add to Cart logic
async function addToCart(productId) {
    try {
        const response = await fetch("http://localhost:3000/api/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId, productId, quantity: 1 }) // Replace `userId` with actual user ID
        });

        if (response.ok) {
            alert("Item added to cart!");
            updateCartCount(); // Update cart count after adding
        } else {
            alert("Failed to add item to cart.");
        }
    } catch (error) {
        console.error("Error adding item to cart:", error);
    }
}

// Update cart count
async function updateCartCount() {
    try {
        const response = await fetch(`http://localhost:3000/api/cart?userId=${userId}`);
        if (response.ok) {
            const cartData = await response.json();
            console.log(cartData);
            const totalItems = cartData.cart.items.length; // `items` की लंबाई से कुल आइटम्स की गणना
            cartCountElement.textContent = totalItems || 0;
        }
    } catch (error) {
        console.error("Error fetching cart count:", error);
    }
}

// Back to Categories with 1-second delay
backToCategoriesButton.addEventListener("click", () => {
    backToCategoriesButton.disabled = true; // Disable button to prevent multiple clicks
    setTimeout(() => {
        categoriesSection.classList.remove("d-none");
        productsSection.classList.add("d-none");
        backToCategoriesButton.style.display = "none"; // Hide back button
        backToCategoriesButton.disabled = false; // Re-enable button
    }, 1000); // 1-second delay
});
// Cart icon element
const cartIcon = document.getElementById("cart-icon");

// Add click event listener to redirect to cart.html
cartIcon.addEventListener("click", () => {
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

    // Redirect to cart.html after a slight delay
    setTimeout(() => {
        window.location.href = "cart.html";
    }, 100); // Optional small delay for effect
});

// Update cart count on page load
updateCartCount();


// Initialize
fetchCategories();
updateCartCount(); // Fetch initial cart count