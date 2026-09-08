// Auto-fill secret key if provided in URL parameter
const urlParams = new URLSearchParams(window.location.search);
const keyFromUrl = urlParams.get('key');
if (keyFromUrl) {
  document.getElementById('registrationKey').value = keyFromUrl;
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.innerText = 'Creating account...';
  msg.className = '';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const registrationKey = document.getElementById('registrationKey').value;

  const result = await API.register(email, password, registrationKey);

  if (result.success) {
    msg.className = 'success';
    msg.innerText = 'Account created! Redirecting to login...';
    setTimeout(() => window.location.href = 'login.html', 1500);
  } else {
    msg.className = 'error';
    msg.innerText = result.error || 'Failed to create account.';
  }
});