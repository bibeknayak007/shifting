document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SCROLL ANIMATIONS ---
    const animatedItems = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    animatedItems.forEach(item => observer.observe(item));

    // --- 2. DYNAMIC PRICE CALCULATOR ---
    const houseSize = document.getElementById('houseSize');
    const priceDisplay = document.getElementById('priceDisplay');
    const priceValue = document.getElementById('priceValue');

    if (houseSize) {
        houseSize.addEventListener('change', () => {
            if (houseSize.value) {
                priceDisplay.style.display = 'block';
                priceValue.textContent = `Rs ${parseInt(houseSize.value).toLocaleString()}`;
            } else {
                priceDisplay.style.display = 'none';
            }
        });
    }

    // --- 3. CORE ELEMENTS ---
    const authOverlay = document.getElementById('authOverlay');
    const dashboardOverlay = document.getElementById('dashboardOverlay');
    const navAuthSection = document.getElementById('navAuthSection');
    const quoteForm = document.getElementById('quoteForm');
    const authForm = document.getElementById('combinedAuthForm');
    const submitBtn = document.getElementById('authSubmitBtn');
    const authTitle = document.querySelector('.auth-header h2');
    const toggleLink = document.getElementById('toggleAuthMode');

    let isLoginMode = true;

    // --- 4. DATA FETCHING (MOVE HISTORY) ---
    const loadMoveHistory = async (userId) => {
        const historyContainer = document.getElementById('history');
        if (!historyContainer) return;

        try {
            const response = await fetch(`http://localhost:5000/api/my-bookings/${userId}`);
            const bookings = await response.json();

            if (bookings.length > 0) {
                // Generate HTML for each booking
                historyContainer.innerHTML = bookings.map(b => {
                    const paymentStatusColor = b.paymentStatus === 'paid' ? '#39d353' : '#fbbf24';
                    const paymentStatusText = b.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending';
                    const paymentMethodText = b.paymentMethod === 'cash' ? '💵 Cash' : '📱 Online';
                    
                    return `
                    <div class="booking-card" style="...">
                      <div style="font-weight: bold; color: #58a6ff; margin-bottom: 8px;">${b.houseSize}</div>
                      <div style="font-size: 0.8rem; color: #8b949e; margin-top: 5px;">
                          <i class="fa-solid fa-location-dot"></i> From: ${b.pickupAddress}<br>
                          <i class="fa-solid fa-flag-checkered"></i> To: ${b.destinationAddress}
                      </div>
                      <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                          <div style="color: #39d353;">${b.price}</div>
                          <div style="display: flex; gap: 10px; font-size: 0.75rem;">
                              <span style="background: rgba(251, 191, 36, 0.2); color: ${paymentStatusColor}; padding: 4px 8px; border-radius: 6px; border: 1px solid ${paymentStatusColor};">${paymentStatusText}</span>
                              <span style="background: rgba(88, 166, 255, 0.2); color: #58a6ff; padding: 4px 8px; border-radius: 6px; border: 1px solid #58a6ff;">${paymentMethodText}</span>
                          </div>
                      </div>
                    </div>
                    `;
                }).join('');
            } else {
                historyContainer.innerHTML = `
                    <div style="text-align: center; color: #8b949e; padding: 40px 0;">
                        <i class="fa-solid fa-box-open" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        <p>No past moves found.</p>
                    </div>`;
            }
        } catch (err) {
            console.error("Error loading history:", err);
        }
    };

    // --- 5. LOGIN STATUS & NAV UPDATE ---
    const checkLoginStatus = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (user && navAuthSection) {
            navAuthSection.innerHTML = `
                <div class="user-avatar-nav" id="profileTrigger" title="View Account">
                <i class="fa-solid fa-user"></i>
            </div>`;

            if(document.getElementById('dashUserEmail')) {
                document.getElementById('dashUserEmail').innerText = user.email;
            }
            if(document.getElementById('infoEmail')) {
                document.getElementById('infoEmail').innerText = user.email;
            }

            document.getElementById('profileTrigger').onclick = () => {
                dashboardOverlay.style.display = 'flex';
                openTab(null, 'history'); // Reset to history tab
                loadMoveHistory(user.id); // Fetch fresh data from DB
            };
        }
    };

    checkLoginStatus();

    // --- 6. BOOKING FORM SUBMISSION ---
    const paymentOverlay = document.getElementById('paymentOverlay');
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentRadios = document.querySelectorAll('.payment-radio');
    const qrContainer = document.getElementById('qrContainer');
    const qrAmount = document.getElementById('qrAmount');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    
    let bookingDataTemp = null;
    let selectedPaymentMethod = 'cash'; // Track selected payment method

if (quoteForm) {
    quoteForm.onsubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));

        if (!user) {
            alert("Please login first.");
            authOverlay.style.display = 'flex';
            return;
        }

        try {
            // Get values safely
            const hSize = document.getElementById('houseSize').selectedOptions[0].text;
            const mDate = document.querySelector('input[type="date"]').value;
            const pPrice = document.getElementById('priceValue').innerText;
            const pAddr = document.getElementById('pickupAddress').value;
            const dAddr = document.getElementById('destinationAddress').value;

            bookingDataTemp = {
                userId: user.id,
                userEmail: user.email,
                houseSize: hSize,
                moveDate: mDate,
                price: pPrice,
                pickupAddress: pAddr,
                destinationAddress: dAddr
            };
            
            // Update QR amount display
            qrAmount.innerText = pPrice;
            
            // Reset payment selection - set Cash as default
            const cashRadio = document.querySelector('input[value="cash"]');
            const cashOption = document.getElementById('cashOption');
            cashRadio.checked = true;
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            cashOption.classList.add('selected');
            qrContainer.style.display = 'none';
            
            // Show payment modal
            paymentOverlay.style.display = 'flex';
        } catch (err) {
            console.error("Frontend Error:", err);
            alert("Error: Check if all fields are filled correctly.");
        }
    };
}

    // Handle payment option selection
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            selectedPaymentMethod = radio.value;
            
            console.log("Selected payment method:", selectedPaymentMethod);
            
            if (radio.value === 'online') {
                qrContainer.style.display = 'block';
            } else {
                qrContainer.style.display = 'none';
            }
        });
    });

    // Confirm payment and complete booking
    if (confirmPaymentBtn) {
        confirmPaymentBtn.onclick = async () => {
            const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
            
            if (!selectedPayment && !selectedPaymentMethod) {
                alert("Please select a payment method");
                return;
            }

            confirmPaymentBtn.innerText = "Processing...";
            confirmPaymentBtn.disabled = true;

            try {
                const finalPaymentMethod = selectedPayment?.value || selectedPaymentMethod;
                bookingDataTemp.paymentMethod = finalPaymentMethod;
                
                console.log("Selected Payment Method:", finalPaymentMethod);
                console.log("Full Booking Data:", bookingDataTemp);
                const response = await fetch('http://localhost:5000/api/book-move', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingDataTemp)
                });

                if (response.ok) {
                    alert("🎉 Booking confirmed! Payment method: " + finalPaymentMethod.toUpperCase());
                    const adminPhone = "9779705600529"; 
                    const message = `*New Booking*%0A*Payment:* ${finalPaymentMethod.toUpperCase()}%0A*From:* ${bookingDataTemp.pickupAddress}%0A*To:* ${bookingDataTemp.destinationAddress}%0A*Size:* ${bookingDataTemp.houseSize}`;
                    window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
                    location.reload(); 
                } else {
                    const errorData = await response.json();
                    alert("Server Error: " + (errorData.error || "Unknown error"));
                    confirmPaymentBtn.innerText = "Confirm & Complete Booking";
                    confirmPaymentBtn.disabled = false;
                }
            } catch (err) {
                console.error("Frontend Error:", err);
                alert("Error: Check if all fields are filled correctly.");
                confirmPaymentBtn.innerText = "Confirm & Complete Booking";
                confirmPaymentBtn.disabled = false;
            }
        };
    }

    // --- 7. AUTH FORM (LOGIN/SIGNUP) ---
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            submitBtn.innerText = "Processing...";
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const endpoint = isLoginMode ? '/api/login' : '/api/register';
            
            try {
                const response = await fetch(`http://localhost:5000${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                
                if(response.ok) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    location.reload(); 
                } else {
                    alert(data.msg || "Error occurred");
                    submitBtn.innerText = isLoginMode ? "Continue" : "Sign Up";
                }
            } catch(err) {
                alert("Backend offline!");
                submitBtn.innerText = isLoginMode ? "Continue" : "Sign Up";
            }
        };
    }

    if (toggleLink) {
        toggleLink.onclick = (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            authTitle.innerText = isLoginMode ? "Log in or sign up" : "Create your account";
            submitBtn.innerText = isLoginMode ? "Continue" : "Sign Up";
            toggleLink.innerText = isLoginMode ? "Sign Up" : "Log In";
        };
    }

    // --- 8. TAB SWITCHING LOGIC ---
    window.openTab = function(evt, tabName) {
        let i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tab-link");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
        }
        document.getElementById(tabName).style.display = "block";
        if (evt) {
            evt.currentTarget.classList.add("active");
        } else {
            // Highlight history tab by default
            document.querySelector('.tab-link').classList.add("active");
        }
    };

    // --- 9. GLOBAL CLICK HANDLER (CLOSE & LOGOUT) ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-btn') || 
            e.target.id === 'closeAuthBtn' || 
            e.target.id === 'closeDashBtn' || 
            e.target.id === 'closePaymentBtn' ||
            e.target.closest('.close-btn')) {
            authOverlay.style.display = 'none';
            dashboardOverlay.style.display = 'none';
            paymentOverlay.style.display = 'none';
        }
        if (e.target.id === 'openAuthBtn' || e.target.closest('#openAuthBtn')) {
        authOverlay.style.display = 'flex';
    }
        if (e.target === authOverlay || e.target === dashboardOverlay || e.target === paymentOverlay) {
            authOverlay.style.display = 'none';
            dashboardOverlay.style.display = 'none';
            paymentOverlay.style.display = 'none';
        }

        if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
            localStorage.removeItem('user');
            location.reload();
        }
    });
});