// ========================================
// MY JOURNEY - LIFE PORTFOLIO
// Interactive JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initNavigation();
    initScrollAnimations();
    initParallax();
    init3DCards();
    initFormHandling();
    initSmoothScroll();
    initVideoCarousel();
});


function initVideoCarousel() {
    const carousels = document.querySelectorAll('.video-carousel');

    carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.video-slide');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        const dots = carousel.querySelectorAll('.dot');
        let currentIndex = 0;

        function updateSlide(index) {
            // Remove active classes
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            // Handle wrapping
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            currentIndex = index;

            // Add active classes
            slides[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');

            // Pause iframe in previous slide (optional but good for UX)
            slides.forEach((slide, i) => {
                if (i !== currentIndex) {
                    const iframe = slide.querySelector('iframe');
                    // Resetting src is a simple way to stop video
                    const src = iframe.src;
                    iframe.src = src;
                }
            });
        }

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card interaction
            updateSlide(currentIndex - 1);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateSlide(currentIndex + 1);
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                updateSlide(index);
            });
        });
    });
}

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
    // ... existing navigation code ...
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    mobileMenuBtn?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');

        // Animate hamburger to X
        const spans = mobileMenuBtn.querySelectorAll('span');
        if (mobileMenuBtn.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close mobile menu when clicking a link
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn?.classList.remove('active');
        });
    });

    // Navbar background on scroll
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        // Navbar background logic removed for transparency
        navbar.style.background = 'transparent';
        navbar.style.boxShadow = 'none';

        lastScroll = currentScroll;
    });

    // Active nav link based on scroll position
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinkItems.forEach(link => link.classList.remove('active'));
                navLink?.classList.add('active');
            }
        });
    });
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add animation classes to elements
    const animateElements = document.querySelectorAll(
        '.about-content, .passion-card, .timeline-item, .contact-wrapper, .stat-card'
    );

    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        fadeInObserver.observe(el);
    });

    // CSS class for animated elements
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// PARALLAX EFFECTS
// ========================================
function initParallax() {
    const world3d = document.querySelector('.world-3d');
    const destinations = document.querySelectorAll('.destination');

    // Mouse move parallax on hero section
    document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;

        if (world3d) {
            world3d.style.transform = `
                rotateX(${15 + yPercent * 5}deg) 
                rotateY(${xPercent * 10}deg)
                translateY(${yPercent * -10}px)
            `;
        }

        destinations.forEach((dest, index) => {
            const speed = 1 + index * 0.2;
            dest.style.transform = `
                translate(${xPercent * 10 * speed}px, ${yPercent * 10 * speed}px)
            `;
        });
    });

    // Reset on mouse leave
    document.querySelector('.hero')?.addEventListener('mouseleave', () => {
        if (world3d) {
            world3d.style.transform = 'rotateX(15deg) translateY(0)';
        }
        destinations.forEach(dest => {
            dest.style.transform = 'translate(0, 0)';
        });
    });

    // Floating clouds parallax on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const clouds = document.querySelectorAll('.cloud');

        clouds.forEach((cloud, index) => {
            const speed = 0.1 + index * 0.05;
            cloud.style.transform = `translateX(${scrolled * speed}px)`;
        });
    });
}

// ========================================
// 3D CARD EFFECTS
// ========================================
function init3DCards() {
    const cards = document.querySelectorAll('.passion-card');

    cards.forEach(card => {
        const container = card.querySelector('.card-3d-container');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            container.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(20px)
            `;
        });

        card.addEventListener('mouseleave', () => {
            container.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    // Timeline items stagger animation
    const timelineItems = document.querySelectorAll('.timeline-item');

    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 150);
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = item.classList.contains('timeline-left')
            ? 'translateX(-50px)'
            : 'translateX(50px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        timelineObserver.observe(item);
    });
}

// ========================================
// FORM HANDLING
// ========================================
function initFormHandling() {
    const form = document.getElementById('contactForm');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = `
            <span>Sending...</span>
            <svg class="btn-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32"/>
            </svg>
        `;
        submitBtn.disabled = true;

        // Add spinning animation
        const style = document.createElement('style');
        style.textContent = `
            .spinning {
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Show success state
        submitBtn.innerHTML = `
            <span>Message Sent! ✈️</span>
        `;
        submitBtn.style.background = 'linear-gradient(135deg, #10B981 0%, #34D399 100%)';

        // Reset form
        setTimeout(() => {
            form.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 3000);
    });

    // Input focus effects
    const inputs = document.querySelectorAll('.form-group input, .form-group textarea');

    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
}

// ========================================
// SMOOTH SCROLL
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const offsetTop = target.offsetTop - 80;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// DESTINATION CLICK INTERACTIONS
// ========================================
document.querySelectorAll('.destination').forEach(dest => {
    dest.addEventListener('click', () => {
        const label = dest.dataset.label?.toLowerCase();
        const section = document.getElementById('passions');

        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });

            // Highlight the corresponding card
            setTimeout(() => {
                const card = document.querySelector(`.passion-${label}`);
                if (card) {
                    card.style.animation = 'highlightPulse 1s ease-in-out 2';
                    setTimeout(() => {
                        card.style.animation = '';
                    }, 2000);
                }
            }, 800);
        }
    });
});

// Add highlight animation
const highlightStyle = document.createElement('style');
highlightStyle.textContent = `
    @keyframes highlightPulse {
        0%, 100% { 
            transform: scale(1);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        50% { 
            transform: scale(1.02);
            box-shadow: 0 16px 48px rgba(78, 205, 196, 0.4);
        }
    }
`;
document.head.appendChild(highlightStyle);

// ========================================
// TYPING EFFECT FOR CODE SNIPPET
// ========================================
function initTypingEffect() {
    const codeLines = document.querySelectorAll('.code-line');

    codeLines.forEach((line, index) => {
        const text = line.textContent;
        line.textContent = '';
        line.style.opacity = '1';

        let charIndex = 0;

        setTimeout(() => {
            const typeInterval = setInterval(() => {
                if (charIndex < text.length) {
                    line.textContent += text[charIndex];
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                }
            }, 100);
        }, index * 500);
    });
}

// Trigger typing effect when tech card is visible
const techCard = document.querySelector('.passion-tech');
if (techCard) {
    const typingObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            initTypingEffect();
            typingObserver.disconnect();
        }
    }, { threshold: 0.5 });

    typingObserver.observe(techCard);
}

// ========================================
// EASTER EGG - Konami Code
// ========================================
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateRainbowMode();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateRainbowMode() {
    document.body.style.animation = 'rainbowBackground 5s linear infinite';

    const rainbowStyle = document.createElement('style');
    rainbowStyle.textContent = `
        @keyframes rainbowBackground {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(rainbowStyle);

    // Show celebration
    const celebration = document.createElement('div');
    celebration.innerHTML = '🎮 ACHIEVEMENT UNLOCKED: Gamer Mode! 🎮';
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
        color: white;
        padding: 2rem 3rem;
        border-radius: 20px;
        font-size: 1.5rem;
        font-weight: bold;
        z-index: 10000;
        animation: celebrationPop 0.5s ease;
    `;
    document.body.appendChild(celebration);

    setTimeout(() => {
        celebration.remove();
        document.body.style.animation = '';
    }, 3000);
}

console.log('🛫 Welcome to My Journey Portfolio!');
console.log('💡 Tip: Try the Konami Code for a surprise!');
