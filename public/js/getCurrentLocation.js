const paymentBtn = document.getElementById('proceed-to-payment-btn');
const addressFields = {
    address: document.getElementById('address'),
    pincode: document.getElementById('pincode'),
    name: document.getElementById('name'),
    phone: document.getElementById('phone'),
    deliveryInstructions: document.getElementById('deliveryInstructions')
};

// Update all form fields
function updateFormFields(data = {}) {
    for (const field in addressFields) {
        if (addressFields[field] && data[field]) {
            addressFields[field].value = data[field];
        }
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    alert(`${type.toUpperCase()}: ${message}`);
}

// Save to localStorage
function saveToLocalStorage() {
    try {
        const formData = {};
        for (const field in addressFields) {
            if (addressFields[field]) {
                formData[field] = addressFields[field].value.trim();
            }
        }

        localStorage.setItem('userLocationData', JSON.stringify(formData));
        console.log('✅ Data saved to localStorage:', formData);
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
    }
}

// Load from localStorage
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('userLocationData');
        return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
        console.error('❌ Error loading from localStorage:', error);
        return {};
    }
}

// Validate form before payment
function validateForm() {
    const requiredFields = ['name', 'phone', 'address', 'pincode'];
    for (const field of requiredFields) {
        if (!addressFields[field]?.value.trim()) {
            showToast(`Please fill in the ${field} field`, 'error');
            return false;
        }
    }
    return true;
}

// POST to API with JWT token
async function postDataToServer(data) {
    try {
        const token = localStorage.getItem('token'); // JWT from localStorage
        if (!token) {
            showToast('User token missing. Please login again.', 'error');
            return;
        }

        const response = await fetch('http://localhost:3000/api/addaddres', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Attach token in header
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('✅ Server response:', result);

        if (response.ok) {
            showToast('Address saved successfully', 'success');
        } else {
            showToast(`Server error: ${result.message || 'Failed to save'}`, 'error');
        }
    } catch (error) {
        console.error('❌ Error posting to server:', error);
        showToast('Network error while saving address', 'error');
    }
}

// Handle payment button click
async function handlePaymentClick() {
    if (!validateForm()) return;

    const formData = {
        name: addressFields.name.value.trim(),
        phone: addressFields.phone.value.trim(),
        address: addressFields.address.value.trim(),
        pincode: addressFields.pincode.value.trim(),
        deliveryInstructions: addressFields.deliveryInstructions.value.trim()
    };

    // Save to localStorage before sending
    localStorage.setItem('userLocationData', JSON.stringify(formData));

    console.log('🧾 Sending to API:', formData);
    await postDataToServer(formData);
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    const savedData = loadFromLocalStorage();
    if (savedData) {
        updateFormFields(savedData);
    }

    if (paymentBtn) {
        paymentBtn.addEventListener('click', handlePaymentClick);
    }

    for (const field in addressFields) {
        if (addressFields[field]) {
            addressFields[field].addEventListener('input', saveToLocalStorage);
            addressFields[field].addEventListener('change', saveToLocalStorage);
        }
    }
});
