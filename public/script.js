const schedule = {
    mon: [
        ["6:00 AM", "Strength Training", "Coach Aditya", "All levels"],
        ["7:30 AM", "Yoga", "Coach Sneha", "Beginner"],
        ["6:00 PM", "HIIT", "Coach Rahul", "Intermediate"],
        ["7:15 PM", "Zumba", "Coach Meera", "All levels"],
    ],
    tue: [
        ["6:00 AM", "HIIT", "Coach Rahul", "Intermediate"],
        ["7:30 AM", "Strength Training", "Coach Aditya", "All levels"],
        ["6:00 PM", "Yoga", "Coach Sneha", "All levels"],
        ["7:15 PM", "Zumba", "Coach Meera", "Beginner"],
    ],
    wed: [
        ["6:00 AM", "Zumba", "Coach Meera", "All levels"],
        ["7:30 AM", "Yoga", "Coach Sneha", "Beginner"],
        ["6:00 PM", "Strength Training", "Coach Aditya", "Advanced"],
        ["7:15 PM", "HIIT", "Coach Rahul", "Intermediate"],
    ],
    thu: [
        ["6:00 AM", "Strength Training", "Coach Aditya", "All levels"],
        ["7:30 AM", "HIIT", "Coach Rahul", "Intermediate"],
        ["6:00 PM", "Zumba", "Coach Meera", "All levels"],
        ["7:15 PM", "Yoga", "Coach Sneha", "All levels"],
    ],
    fri: [
        ["6:00 AM", "Yoga", "Coach Sneha", "All levels"],
        ["7:30 AM", "Zumba", "Coach Meera", "Beginner"],
        ["6:00 PM", "HIIT", "Coach Rahul", "Advanced"],
        ["7:15 PM", "Strength Training", "Coach Aditya", "All levels"],
    ],
};

function renderDay(day) {
    const body = document.getElementById('timetable-body');
    body.innerHTML = '';
    schedule[day].forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td><span class="tag">${row[3]}</span></td>`;
        body.appendChild(tr);
    });
}
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDay(btn.dataset.day);
    });
});
renderDay('mon');

// Gallery slider
(function () {
    const slides = document.querySelectorAll('#gallery-slider .slide');
    const dots = document.querySelectorAll('.slider-dots button');
    let i = 0, timer;

    function show(n) {
        slides[i].classList.remove('active');
        dots[i].classList.remove('active');
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('active');
        dots[i].classList.add('active');
    }
    function next() { show(i + 1); }
    function prev() { show(i - 1); }
    function startAuto() {
        timer = setInterval(next, 5500);
    }
    function resetAuto() {
        clearInterval(timer);
        startAuto();
    }

    document.getElementById('slide-next').addEventListener('click', () => { next(); resetAuto(); });
    document.getElementById('slide-prev').addEventListener('click', () => { prev(); resetAuto(); });
    dots.forEach(d => d.addEventListener('click', () => { show(parseInt(d.dataset.i)); resetAuto(); }));

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        startAuto();
    }
})();

// Contact form submission
const contactForm = document.getElementById('contact-form');
const formMsg = document.getElementById('form-msg');
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
    };
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Request failed');
        contactForm.reset();
        formMsg.textContent = "Thanks — we'll get back to you within a day.";
        formMsg.style.display = 'block';
    } catch (err) {
        formMsg.textContent = "Something went wrong. Please call us instead at +91 90906 39005.";
        formMsg.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    }
});

// Membership checkout — Razorpay
(function () {
    const overlay = document.getElementById('checkout-overlay');
    const modal = overlay.querySelector('.checkout-modal');
    const closeBtn = document.getElementById('checkout-close');
    const planNameEl = document.getElementById('checkout-plan-name');
    const planPriceEl = document.getElementById('checkout-plan-price');
    const form = document.getElementById('checkout-form');
    const msg = document.getElementById('checkout-msg');

    let selectedPlan = null;
    let selectedPrice = null;

    function openModal(plan, price) {
        selectedPlan = plan;
        selectedPrice = price;
        planNameEl.textContent = plan;
        planPriceEl.textContent = '₹' + price;
        msg.style.display = 'none';
        msg.textContent = '';
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.getElementById('checkout-name').focus();
    }

    function closeModal() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('[data-plan]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(btn.dataset.plan, btn.dataset.price);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const payload = {
            name: document.getElementById('checkout-name').value,
            phone: document.getElementById('checkout-phone').value,
            email: document.getElementById('checkout-email').value,
            plan: selectedPlan,
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Starting payment...';
        msg.style.display = 'none';

        try {
            // Step 1: create a Razorpay order on the server
            const orderRes = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const order = await orderRes.json();
            if (!orderRes.ok || !order.ok) {
                throw new Error(order.error || 'Could not start payment.');
            }

            // Step 2: open Razorpay Checkout with that order
            const rzp = new Razorpay({
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'Fitness Arena',
                description: `${selectedPlan} membership`,
                order_id: order.orderId,
                prefill: {
                    name: payload.name,
                    email: payload.email,
                    contact: payload.phone,
                },
                theme: { color: '#D6161E' },
                handler: async function (response) {
                    // Step 3: verify the payment signature on the server before
                    // treating it as successful — never trust the client alone.
                    try {
                        const verifyRes = await fetch('/api/payments/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });
                        const verify = await verifyRes.json();
                        if (verifyRes.ok && verify.ok) {
                            msg.textContent = verify.message || "Payment received — welcome to Fitness Arena!";
                            form.reset();
                        } else {
                            msg.textContent = verify.error || "We couldn't confirm that payment. Please contact us.";
                        }
                    } catch (err) {
                        msg.textContent = "Payment made, but we couldn't confirm it automatically. Please contact us with your payment ID.";
                    }
                    msg.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Pay & Join';
                },
                modal: {
                    ondismiss: function () {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Pay & Join';
                    },
                },
            });

            rzp.on('payment.failed', function (response) {
                msg.textContent = 'Payment failed: ' + (response.error && response.error.description ? response.error.description : 'please try again.');
                msg.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Pay & Join';
            });

            rzp.open();
            submitBtn.textContent = 'Pay & Join';
        } catch (err) {
            msg.textContent = err.message || 'Something went wrong starting the payment.';
            msg.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Pay & Join';
        }
    });
})();

// Scroll-triggered fade-ins for section headings and cards
(function () {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // No IntersectionObserver support, or the user prefers reduced motion —
        // just show everything immediately rather than leaving it invisible.
        revealEls.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
})();