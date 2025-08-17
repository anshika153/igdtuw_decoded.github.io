const toggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.navbar-links');

toggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});
