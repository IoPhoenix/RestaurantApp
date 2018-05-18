const menuToggler = document.getElementById('menu-toggler');
let isMenuOpen = false;

menuToggler.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    menuToggler.setAttribute('aria-expanded', isMenuOpen);
});

