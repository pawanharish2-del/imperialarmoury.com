// Initialize Lenis Smooth Scroll Engine for ultra-responsive, zero-lag 60-120fps scrolling
if (typeof Lenis !== 'undefined') {
    window.lenis = new Lenis({
        lerp: 0.1, // Snappy & instant response without sluggish delay
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.0,
        syncTouch: false, // Allows hardware native touch/trackpad momentum with zero latency
        autoResize: true,
    });

    function raf(time) {
        window.lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

document.addEventListener('DOMContentLoaded', () => {
    // Smooth anchor link scrolling with Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            if (targetId === '#top') {
                e.preventDefault();
                if (window.lenis) {
                    window.lenis.scrollTo(0, { lerp: 0.1 });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
            }
            try {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    if (window.lenis) {
                        window.lenis.scrollTo(targetEl, { offset: -60, lerp: 0.1 });
                    } else {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            } catch (err) {}
        });
    });

    // Ensure hero video plays immediately with zero lag
    const heroVideo = document.querySelector('.hero-bg-video');
    if (heroVideo) {
        heroVideo.play().catch(() => {});
    }

    // Elements
    const navItems = document.querySelectorAll('.nav-item.has-mega-menu');
    const megaMenusWrapper = document.getElementById('mega-menus-wrapper');
    const megaMenus = document.querySelectorAll('.mega-menu');
    const closeMenuBtn = document.getElementById('close-mega-menu');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const body = document.body;

    // Mega Menu State
    let activeMenuId = null;

    // --- MEGA MENU LOGIC (DESKTOP) ---

    function openMegaMenu(menuId) {
        // Close currently open if different
        if (activeMenuId && activeMenuId !== menuId) {
            document.getElementById(activeMenuId).classList.remove('active');
            document.querySelector(`[data-target="${activeMenuId}"]`).classList.remove('active');
        }

        // Open new
        const targetMenu = document.getElementById(menuId);
        const targetNav = document.querySelector(`[data-target="${menuId}"]`);
        
        if (targetMenu && targetNav) {
            targetMenu.classList.add('active');
            targetNav.classList.add('active');
            megaMenusWrapper.classList.add('open');
            closeMenuBtn.style.display = 'block';
            body.classList.add('menu-open');
            if (window.lenis) window.lenis.stop();
            activeMenuId = menuId;
        }
    }

    function closeMegaMenu() {
        if (activeMenuId) {
            document.getElementById(activeMenuId).classList.remove('active');
            document.querySelector(`[data-target="${activeMenuId}"]`).classList.remove('active');
            megaMenusWrapper.classList.remove('open');
            closeMenuBtn.style.display = 'none';
            body.classList.remove('menu-open');
            if (window.lenis) window.lenis.start();
            activeMenuId = null;
        }
    }

    // Toggle menu on click
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            if (activeMenuId === targetId) {
                closeMegaMenu();
            } else {
                openMegaMenu(targetId);
            }
        });
    });

    // Close button
    closeMenuBtn.addEventListener('click', closeMegaMenu);


    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMegaMenu();
            if (mobileDrawer && mobileDrawer.classList.contains('open')) {
                toggleMobileMenu();
            }
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (activeMenuId && 
            megaMenusWrapper && 
            !megaMenusWrapper.contains(e.target) && 
            !e.target.closest('.nav-item.has-mega-menu')) {
            closeMegaMenu();
        }
    });




    // --- MOBILE MENU LOGIC ---

    function toggleMobileMenu() {
        if (!mobileDrawer || !mobileToggle) return;
        const isOpen = mobileDrawer.classList.contains('open');
        
        if (isOpen) {
            mobileDrawer.classList.remove('open');
            mobileToggle.classList.remove('active');
            body.classList.remove('menu-open');
            if (window.lenis) window.lenis.start();
        } else {
            // Close mega menu if open
            if (activeMenuId) closeMegaMenu();
            
            mobileDrawer.classList.add('open');
            mobileToggle.classList.add('active');
            body.classList.add('menu-open');
            if (window.lenis) window.lenis.stop();
        }
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }

    // Mobile Accordion
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item.has-submenu > .mobile-nav-link');
    
    mobileNavItems.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const parentLi = link.parentElement;
            parentLi.classList.toggle('open');
        });
    });

    // Close mobile drawer when clicking a navigation destination link
    if (mobileDrawer) {
        mobileDrawer.querySelectorAll('a:not(.has-submenu > .mobile-nav-link)').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileDrawer.classList.contains('open')) {
                    toggleMobileMenu();
                }
            });
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileDrawer && mobileDrawer.classList.contains('open') && mobileToggle) {
            if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
                toggleMobileMenu();
            }
        }
    });

    // --- LANGUAGE SWITCHER ---
    const langLinks = document.querySelectorAll('.lang');
    
    langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            langLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // --- SCROLL ANIMATIONS ---
    const scrollObserverOptions = {
        root: null,
        rootMargin: '50px 0px 0px 0px',
        threshold: 0.05
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, scrollObserverOptions);

    const animatedElements = document.querySelectorAll('.scroll-animate-left, .scroll-animate-right, .scroll-animate-up, [class*="scroll-animate"]');
    animatedElements.forEach(el => scrollObserver.observe(el));
    // Immediate check on page load for elements in viewport
    window.addEventListener('load', () => {
        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    });
});

