document.getElementById('getLocationBtn').addEventListener('click', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Nominatim API ka URL (reverse geocoding ke liye)
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

            // Fetch request for reverse geocoding
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.address) {
                        // Address parts ko display karenge
                        const address = data.display_name; // Complete address
                        console.log(address)
                        document.getElementById('address').value = address;

                        // Alag-alag components ko display karna
                        document.getElementById('city').value = data.address.city || "Not Available";
                        document.getElementById('state').value = data.address.state || "Not Available";
                        document.getElementById('country').value = data.address.country || "Not Available";

                        // Latitude aur Longitude ko bhi fields mein set karenge
                        document.getElementById('latitude').value = latitude;
                        document.getElementById('longitude').value = longitude;
                    } else {
                        alert('Address not found!');
                    }
                })
                .catch(error => {
                    alert('Error: ' + error.message);
                });
        }, function (error) {
            alert('Error getting location: ' + error.message);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});