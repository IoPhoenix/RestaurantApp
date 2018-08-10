// toggle menu on smaller screens
class ToggleMenu {
    constructor() {
        this.menuToggler = document.getElementById('menu-toggler');
        this.isMenuOpen = false;
    }

    toggleMenu() {
        this.menuToggler.addEventListener('click', () => {
            this.isMenuOpen = !this.isMenuOpen;
            this.menuToggler.setAttribute('aria-expanded', this.isMenuOpen);
        });
    }
}

export default ToggleMenu;