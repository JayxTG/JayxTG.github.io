// ===== Navigation Functionality =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll effect for navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// ===== Project Filtering =====
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        const filter = button.dataset.filter;

        projectCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                const categories = card.dataset.category.split(' ');
                if (categories.includes(filter)) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            }
        });
    });
});

// ===== Scroll Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.section-title, .project-card, .skill-category, .timeline-item, .education-card, .cert-card, .leadership-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// ===== Smooth Scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Particle Background Effect =====
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';

        // Random size
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        // Random opacity
        particle.style.opacity = Math.random() * 0.5 + 0.1;

        // Random animation delay
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = Math.random() * 10 + 10 + 's';

        // Style
        particle.style.position = 'absolute';
        particle.style.background = 'rgba(99, 102, 241, 0.6)';
        particle.style.borderRadius = '50%';
        particle.style.animation = 'float ' + (Math.random() * 10 + 10) + 's ease-in-out infinite';

        particlesContainer.appendChild(particle);
    }
}

// Add floating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0) translateX(0);
        }
        25% {
            transform: translateY(-20px) translateX(10px);
        }
        50% {
            transform: translateY(-10px) translateX(-10px);
        }
        75% {
            transform: translateY(-30px) translateX(5px);
        }
    }
`;
document.head.appendChild(style);

// Initialize particles
createParticles();

// ===== Typing Effect for Code Window =====
function typeCode() {
    const codeContent = document.querySelector('.code-content code');
    if (!codeContent) return;

    const originalHTML = codeContent.innerHTML;
    codeContent.innerHTML = '';

    let i = 0;
    const speed = 15;

    function type() {
        if (i < originalHTML.length) {
            // Handle HTML tags
            if (originalHTML[i] === '<') {
                let tag = '';
                while (originalHTML[i] !== '>' && i < originalHTML.length) {
                    tag += originalHTML[i];
                    i++;
                }
                tag += '>';
                i++;
                codeContent.innerHTML += tag;
                setTimeout(type, 0);
            } else {
                codeContent.innerHTML += originalHTML[i];
                i++;
                setTimeout(type, speed);
            }
        }
    }

    // Start typing after a delay
    setTimeout(type, 1500);
}

// Uncomment to enable typing effect (can be intensive)
// typeCode();

// ===== Active Navigation Link on Scroll =====
const sections = document.querySelectorAll('section[id]');

function highlightNavOnScroll() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightNavOnScroll);

// ===== Counter Animation for Stats =====
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
        start += increment;
        if (start < target) {
            if (target === 3.71) {
                element.textContent = start.toFixed(2);
            } else if (target >= 10) {
                element.textContent = Math.floor(start) + '+';
            } else {
                element.textContent = Math.floor(start);
            }
            requestAnimationFrame(updateCounter);
        } else {
            if (target === 3.71) {
                element.textContent = target.toFixed(2);
            } else if (target >= 10) {
                element.textContent = target + '+';
            } else {
                element.textContent = target;
            }
        }
    }

    updateCounter();
}

// Observe stats for animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                let target;
                if (text.includes('.')) {
                    target = parseFloat(text);
                } else {
                    target = parseInt(text.replace('+', ''));
                }
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ===== Console Easter Egg =====
console.log('%c👋 Hey there, curious developer!', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cCheck out my GitHub: https://github.com/JayxTG', 'font-size: 14px; color: #8b5cf6;');
console.log('%c🤖 Building the future of biomedical robotics!', 'font-size: 14px; color: #a855f7;');

// ===== Page Load Animation =====
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
});
