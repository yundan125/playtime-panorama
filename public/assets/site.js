const toggle = document.querySelector('[data-nav-toggle]');
const links = document.querySelector('[data-nav-links]');
const header = toggle?.closest('.site-header');

function setMenuOpen(open) {
  links?.classList.toggle('open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? '关闭工具导航菜单' : '打开工具导航菜单');
}

toggle?.addEventListener('click', () => setMenuOpen(!links?.classList.contains('open')));
links?.addEventListener('click', () => setMenuOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && links?.classList.contains('open')) {
    setMenuOpen(false);
    toggle?.focus();
  }
});
document.addEventListener('click', (event) => {
  if (links?.classList.contains('open') && event.target instanceof Node && !header?.contains(event.target)) setMenuOpen(false);
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 720) setMenuOpen(false);
});