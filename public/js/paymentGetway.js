

document.getElementById('proceed-to-payment-btn').addEventListener('click', function () {
    var myModal = new bootstrap.Modal(document.getElementById('payment-modal'));
    myModal.show();
});

document.getElementById('confirm-payment').addEventListener('click', async function () {
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');

    if (!paymentMethod) {
        alert('Please select a payment method.');
        return;
    }

    let paymentData = {};
    if (paymentMethod.value === 'online') {
        paymentData = { paymentMethod: 'online' };
        alert('Proceeding to online payment.');
    } else if (paymentMethod.value === 'cod') {
        paymentData = { paymentMethod: 'cod' };
        alert('Proceeding with Cash on Delivery.');
    }

    const userId = localStorage.getItem('user_i');
    if (!userId) {
        alert('User ID is required.');
        return;
    }

    try {
        // Fetch amount from the cart API
        const cartResponse = await fetch(`http://localhost:3000/api/cart?userId=${userId}`);
        if (!cartResponse.ok) {
            throw new Error('Failed to fetch cart');
        }
        const cartData = await cartResponse.json();
        const amount = cartData.cart.totalPrice;

        if (!amount) {
            alert('Invalid amount. Please try again.');
            return;
        }

        // Pass userId and amount to the order API
        const response = await fetch('http://localhost:3000/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        console.log(response);
        if (!response.ok) {
            throw new Error('Failed to create order');
        }

        const order = await response.json();

        // Razorpay integration
        const options = {
            key: 'rzp_test_nYQzadcgwZUgVD', // Replace with your Razorpay Key ID
            amount: order.amount, // ✅ Correct reference
            currency: order.currency, // ✅ Correct reference
            order_id: order.id, // ✅ Correct reference
            name: 'Bhookaha Panda',
            description: 'Order Payment - Enjoy your delicious food!',
            prefill: {
                name: 'Customer Name',
                email: 'customer@example.com',
                contact: '9876543210',
            },
            notes: {
                address: 'Delivery Address: 123, Street Name, City',
                items: 'Margherita Pizza, Garlic Bread',
            },
            theme: {
                color: '#F37254',
            },
            handler: function (response) {
                console.log('Payment successful:', response);
                alert('Thank you! Your payment was successful.');
            },
            modal: {
                ondismiss: function () {
                    alert('Payment was not completed. Please try again!');
                },
            },
        };

        // Open the Razorpay payment modal
        const razorpay = new Razorpay(options);
        razorpay.open();

    } catch (error) {
        console.error('Error:', error);
        alert('There was an issue processing your payment. Please try again.');
    }
});

