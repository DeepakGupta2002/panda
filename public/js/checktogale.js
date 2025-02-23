
document.getElementById('toggleLoginPassword').addEventListener('click', function (e) {
    const loginPasswordInput = document.getElementById('loginPassword');
    const icon = e.target;

    if (loginPasswordInput.type === 'password') {
        loginPasswordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        loginPasswordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

document.getElementById('toggleRegisterPassword').addEventListener('click', function (e) {
    const registerPasswordInput = document.getElementById('registerPassword');
    const icon = e.target;

    if (registerPasswordInput.type === 'password') {
        registerPasswordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        registerPasswordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});
