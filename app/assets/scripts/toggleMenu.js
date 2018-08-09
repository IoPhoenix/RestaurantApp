// toggle menu on smaller screens
class ToggleMenu {
    constructor() {
        this.menuToggler = document.getElementById('menu-toggler');
        this.isMenuOpen = false;
    }

    toggleMenu() {
        this.menuToggler.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            this.menuToggler.setAttribute('aria-expanded', isMenuOpen);
        });
    }
}

export default ToggleMenu;