
document.addEventListener('DOMContentLoaded', function () {
    // Button to open payment modal
    const proceedToPaymentBtn = document.getElementById('proceed-to-payment-btn');

    if (proceedToPaymentBtn) {
        proceedToPaymentBtn.addEventListener('click', function () {
            // Initialize and show the modal
            const paymentModal = new bootstrap.Modal(document.getElementById('payment-modal'));
            paymentModal.show();
        });
    }

    // Confirm payment button logic
    const confirmPaymentBtn = document.getElementById('confirm-payment');
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', function () {
            const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
            if (selectedMethod === 'online') {
                // Fetch the total amount from the backend (cart items total)
                fetch('/api/cart/fetch')
                    .then(response => response.json())
                    .then(cartData => {
                        const totalAmount = cartData.cart.items.reduce((total, item) => total + item.productId.price * item.quantity, 0);

                        // Call backend to create Razorpay order and get the order ID
                        fetch('/api/orders/create-razorpay-order', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ totalAmount: totalAmount })
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    // Razorpay order created successfully, now initialize the payment
                                    var options = {
                                        key: data.razorpayKey, // Razorpay key
                                        amount: totalAmount * 100, // Amount in paise
                                        currency: 'INR',
                                        name: 'Your Company Name',
                                        description: 'Order Payment',
                                        order_id: data.orderId, // Razorpay order ID
                                        handler: function (response) {
                                            // Handle payment success here
                                            alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
                                        },
                                        modal: {
                                            ondismiss: function () {
                                                // Handle payment failure or dismissal
                                                alert('Payment cancelled or failed.');
                                            }
                                        }
                                    };
                                    var rzp1 = new Razorpay(options);
                                    rzp1.open();
                                } else {
                                    alert('Error creating Razorpay order.');
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                alert('Payment gateway error.');
                            });
                    })
                    .catch(error => {
                        console.error('Error fetching cart:', error);
                        alert('Error fetching cart data.');
                    });
            } else {
                // Handle other payment methods (COD, etc.)
                alert(`Payment method selected: ${selectedMethod}`);
            }
        });
    }
});

