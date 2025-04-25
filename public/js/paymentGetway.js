// Payment Modal Logic
document.getElementById('proceed-to-payment-btn').addEventListener('click', function () {
    // Show the payment modal
    var myModal = new bootstrap.Modal(document.getElementById('payment-modal'));
    myModal.show();
});

// Confirm Payment Button Logic
// Payment Modal Logic
document.getElementById('proceed-to-payment-btn').addEventListener('click', function () {
    // Show the payment modal
    var myModal = new bootstrap.Modal(document.getElementById('payment-modal'));
    myModal.show();
});

// Confirm Payment Button Logic
document.getElementById('confirm-payment').addEventListener('click', async () => {
    const userId = localStorage.getItem("user_i");
    if (!userId) {
        return alert("User ID missing!");
    }

    try {
        const res = await fetch('http://localhost:3000/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        const order = await res.json();

        const razorpay = new Razorpay({
            key: order.key, // sent from backend
            amount: order.amount,
            currency: order.currency,
            name: "Bhookaha Panda",
            description: "Order Payment",
            order_id: order.id,
            handler: async function (response) {
                const verifyRes = await fetch('http://localhost:3000/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(response)
                });

                const result = await verifyRes.json();
                if (result.success) {
                    alert("Payment successful!");
                    window.location.href = "confirmation.html";
                } else {
                    alert("Payment verification failed!");
                }
            },
            theme: { color: "#F37254" }
        });

        razorpay.open();

    } catch (error) {
        console.error(error);
        alert("Something went wrong during payment process.");
    }
});