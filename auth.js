// --- Backend URL ---
const API_BASE = "https://newfinal-jbm08tvyp-bibeknayak078-8105s-projects.vercel.app";

// Elements
const authForm = document.getElementById('combinedAuthForm');
const submitBtn = document.getElementById('authSubmitBtn');
const toggleLink = document.getElementById('toggleAuthMode');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const toggleText = document.getElementById('toggleText');

let isLoginMode = true; // Start with login

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.innerText = "Processing...";

    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    const endpoint = isLoginMode ? '/api/login' : '/api/register';

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        console.log("API response:", data); // Debug

        if (response.ok) {
            // Save user info
            localStorage.setItem('user', JSON.stringify(data.user));

            alert(isLoginMode ? "Login successful!" : "Account created!");
            window.location.href = "index.html"; // Redirect to homepage
        } else {
            alert(data.msg || data.error || "Error occurred");
            submitBtn.innerText = isLoginMode ? "Sign In" : "Sign Up";
        }
    } catch (err) {
        console.error("Connection error:", err);
        alert("Backend offline or network error!");
        submitBtn.innerText = isLoginMode ? "Sign In" : "Sign Up";
    }
});

// --- Toggle between login and signup ---
toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;

    if (isLoginMode) {
        authTitle.innerText = "Welcome Back";
        authSubtitle.innerText = "Sign in to manage your moves";
        submitBtn.innerText = "Sign In";
        toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggleAuthMode">Create one</a>';
    } else {
        authTitle.innerText = "Create your account";
        authSubtitle.innerText = "Sign up to manage your moves";
        submitBtn.innerText = "Sign Up";
        toggleText.innerHTML = 'Already have an account? <a href="#" id="toggleAuthMode">Log In</a>';
    }

    // Re-assign the toggle event after innerHTML change
    document.getElementById('toggleAuthMode').addEventListener('click', toggleLink.onclick);
});