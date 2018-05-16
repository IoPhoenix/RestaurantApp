const body = document.querySelector('body');
const menu = document.getElementById('primary-menu');
const navbarToggler = document.getElementById('navbar-toggler');

toggleMenu = () => {
    console.log('test');
    if (menu.classList.contains('collapsed')) {
        body.classList.remove('navbar-toggler-active');
        menu.classList.remove('collapsed')
    } else {
        menu.classList.add('collapsed');
        body.classList.add('navbar-toggler-active');
    }
}

document.getElementById('navbar-toggler').addEventListener('click', toggleMenu);

