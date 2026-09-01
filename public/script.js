const modal = document.querySelector('#booking-modal');
const form = document.querySelector('#booking-form');
const interest = form.querySelector('[name="interest"]');
const title = document.querySelector('#modal-title');
const modalText = document.querySelector('#modal-text');

function openModal(type, plan) {
    const isJoin = type === 'join';
    title.innerHTML = isJoin ? 'JOIN THE <em>ARENA.</em>' : 'START YOUR <em>JOURNEY.</em>';
    modalText.textContent = isJoin ? 'Tell us a little about yourself and we’ll help you choose your membership.' : 'Claim your free trial and we’ll find the best session for you.';
    interest.value = plan || (isJoin ? 'Monthly Membership' : 'Free trial session');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => form.querySelector('input').focus(), 200);
}

document.querySelectorAll('.open-trial').forEach(button => button.addEventListener('click', () => openModal('trial')));
document.querySelectorAll('.open-join').forEach(button => button.addEventListener('click', () => openModal('join')));
document.querySelectorAll('.plan-select').forEach(button => button.addEventListener('click', () => openModal('join', button.dataset.plan)));
document.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
function closeModal() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); }

form.addEventListener('submit', event => {
    event.preventDefault();
    const member = new FormData(form).get('name');
    form.querySelector('.form-success').textContent = `Thanks, ${member}! Our Fitness Arena team will contact you shortly.`;
    form.reset();
});

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuButton.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuButton.setAttribute('aria-expanded', open); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }));