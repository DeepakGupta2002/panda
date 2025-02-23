// <!-- Custom JavaScript to Fetch and Display Data -->
// Fetch products from the API
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/product');
        const products = await response.json();

        // Check if products are received
        if (products && products.length > 0) {
            renderProducts(products);
        } else {
            document.getElementById("product-list").innerHTML = "<p>No products available</p>";
        }
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Render product cards
function renderProducts(products) {
    const productContainer = document.getElementById("product-list");
    productContainer.innerHTML = ''; // Clear existing products

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("col-md-4", "mb-4");

        // Use the first image or a placeholder if images array is empty
        const imageUrl = product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/200';

        productCard.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="${imageUrl}" class="card-img-top" alt="${product.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <p class="card-price">₹${product.price}</p>
                        <button class="btn btn-primary mt-auto">Order Now</button>
                    </div>
                </div>
            `;

        productContainer.appendChild(productCard);
    });
}

// Initial call to fetch and display products
fetchProducts();
