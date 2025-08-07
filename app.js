// ===== BACK4APP CONFIGURATION =====
Parse.initialize("bi5z5LWihjCMZ1CQSAlWINkV6gv2y7LJzkXbxgg6", "vsRT0IVv4jDuy8TwogfEebaWvPuaVkI4zWAmQgGD");
Parse.serverURL = "https://parseapi.back4app.com/";

// ====== SOCIAL MEDIA ADVANCED EFFECTS ======
// Efecto de seguimiento del mouse en redes sociales
document.addEventListener('DOMContentLoaded', function() {
  const socialLinks = document.querySelectorAll('.footer-link[data-social]');
  
  // Aplicar animación de entrada solo al cargar
  socialLinks.forEach((link, index) => {
    link.classList.add('loading');
    setTimeout(() => {
      link.classList.remove('loading');
    }, 600 + (index * 100)); // Remover después de que termine la animación
  });
  
  socialLinks.forEach(link => {
    // Efecto de seguimiento del mouse
    link.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      this.style.setProperty('--mouse-x', `${x}%`);
      this.style.setProperty('--mouse-y', `${y}%`);
    });
    
    // Efecto de ondas al hacer click
    link.addEventListener('click', function(e) {
      const ripple = this.querySelector('.social-ripple');
      if (ripple) {
        ripple.style.animation = 'none';
        ripple.offsetHeight; // Trigger reflow
        ripple.style.animation = 'pulse-wave 0.6s ease-out';
      }
    });
    
    // Efecto de vibración en hover (solo en dispositivos que lo soporten)
    if ('vibrate' in navigator) {
      link.addEventListener('mouseenter', function() {
        navigator.vibrate(50); // Vibración sutil de 50ms
      });
    }
    
    // Efecto de partículas flotantes
    link.addEventListener('mouseenter', function() {
      createFloatingParticles(this);
    });
  });
  
  // Función para crear partículas flotantes
  function createFloatingParticles(element) {
    const rect = element.getBoundingClientRect();
    const particleCount = 6;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: currentColor;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.7;
        left: ${rect.left + Math.random() * rect.width}px;
        top: ${rect.top + Math.random() * rect.height}px;
        animation: float-up 2s ease-out forwards;
      `;
      
      document.body.appendChild(particle);
      
      // Remover partícula después de la animación
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 2000);
    }
  }
  
  // Agregar estilos CSS para las partículas flotantes
  const particleStyles = document.createElement('style');
  particleStyles.textContent = `
    @keyframes float-up {
      0% {
        transform: translateY(0) scale(1);
        opacity: 0.7;
      }
      50% {
        transform: translateY(-20px) scale(1.2);
        opacity: 1;
      }
      100% {
        transform: translateY(-40px) scale(0);
        opacity: 0;
      }
    }
    
    .floating-particle {
      filter: blur(0.5px);
      box-shadow: 0 0 6px currentColor;
    }
  `;
  document.head.appendChild(particleStyles);
  
  // Efecto de escritura animada en tooltips
  const tooltips = document.querySelectorAll('.social-tooltip');
  tooltips.forEach(tooltip => {
    const text = tooltip.textContent;
    tooltip.textContent = '';
    
    tooltip.parentElement.addEventListener('mouseenter', function() {
      let i = 0;
      tooltip.textContent = '';
      
      const typeWriter = setInterval(() => {
        if (i < text.length) {
          tooltip.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(typeWriter);
        }
      }, 50);
    });
    
    tooltip.parentElement.addEventListener('mouseleave', function() {
      tooltip.textContent = text;
    });
  });
  
  // Efecto de ondas de sonido visual para WhatsApp
  const whatsappLink = document.querySelector('.social-whatsapp');
  if (whatsappLink) {
    whatsappLink.addEventListener('mouseenter', function() {
      createSoundWaves(this.querySelector('.social-icon-wrapper'));
    });
  }
  
  function createSoundWaves(element) {
    const waves = 3;
    for (let i = 0; i < waves; i++) {
      const wave = document.createElement('div');
      wave.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        border: 2px solid currentColor;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        animation: sound-wave 1.5s ease-out infinite ${i * 0.3}s;
      `;
      element.appendChild(wave);
      
      setTimeout(() => {
        if (wave.parentNode) {
          wave.parentNode.removeChild(wave);
        }
      }, 1500);
    }
  }
  
  // Efecto de matriz digital para GitHub
  const githubLink = document.querySelector('.social-github');
  if (githubLink) {
    githubLink.addEventListener('mouseenter', function() {
      createMatrixEffect(this);
    });
  }
  
  function createMatrixEffect(element) {
    const chars = '01';
    const matrixContainer = document.createElement('div');
    matrixContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 1;
    `;
    
    for (let i = 0; i < 20; i++) {
      const char = document.createElement('span');
      char.textContent = chars[Math.floor(Math.random() * chars.length)];
      char.style.cssText = `
        position: absolute;
        font-family: monospace;
        font-size: 8px;
        color: #00ff00;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: 0;
        animation: matrix-fall 1s ease-out forwards ${Math.random() * 0.5}s;
      `;
      matrixContainer.appendChild(char);
    }
    
    element.appendChild(matrixContainer);
    
    setTimeout(() => {
      if (matrixContainer.parentNode) {
        matrixContainer.parentNode.removeChild(matrixContainer);
      }
    }, 1500);
  }
  
  // Agregar todos los estilos dinámicos
  const advancedStyles = document.createElement('style');
  advancedStyles.textContent = `
    @keyframes sound-wave {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(3);
        opacity: 0;
      }
    }
    
    @keyframes matrix-fall {
      0% {
        opacity: 0;
        transform: translateY(-10px);
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: translateY(50px);
      }
    }
  `;
  document.head.appendChild(advancedStyles);
});

// ===== DATABASE MANAGER =====
class DatabaseManager {
  constructor() {
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      // Test connection
      const testQuery = new Parse.Query('ContactMessage');
      testQuery.limit(1);
      await testQuery.find();
      this.initialized = true;
      console.log('✅ Back4App conectado exitosamente');
    } catch (error) {
      console.warn('⚠️ Back4App no disponible, funcionando en modo offline:', error.message);
      this.initialized = false;
    }
  }

  async checkMessageLimit(contact) {
    if (!this.initialized) return { allowed: true, count: 0 };

    try {
      const query = new Parse.Query('ContactMessage');
      query.equalTo('contact', contact.toLowerCase().trim());
      
      // Buscar mensajes en las últimas 24 horas
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      query.greaterThan('createdAt', yesterday);
      
      const messages = await query.find();
      const count = messages.length;
      
      return {
        allowed: count < 4,
        count: count,
        remainingAttempts: Math.max(0, 4 - count)
      };
    } catch (error) {
      console.error('Error checking message limit:', error);
      return { allowed: true, count: 0 };
    }
  }

  async saveMessage(messageData) {
    if (!this.initialized) {
      console.log('📝 Mensaje guardado localmente (Back4App no disponible)');
      return { success: true, offline: true };
    }

    try {
      const ContactMessage = Parse.Object.extend('ContactMessage');
      const message = new ContactMessage();

      message.set('name', messageData.name);
      message.set('contact', messageData.contact.toLowerCase().trim());
      message.set('message', messageData.message);
      message.set('package', messageData.package || null);
      message.set('ipAddress', await this.getClientIP());
      message.set('userAgent', navigator.userAgent);
      message.set('source', 'portfolio_contact_form');

      const result = await message.save();
      console.log('✅ Mensaje guardado en Back4App:', result.id);
      
      return { 
        success: true, 
        id: result.id,
        offline: false 
      };
    } catch (error) {
      console.error('Error saving message to Back4App:', error);
      return { success: false, error: error.message };
    }
  }

  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  async getMessageHistory(contact) {
    if (!this.initialized) return [];

    try {
      const query = new Parse.Query('ContactMessage');
      query.equalTo('contact', contact.toLowerCase().trim());
      query.descending('createdAt');
      query.limit(10);
      
      const messages = await query.find();
      return messages.map(msg => ({
        id: msg.id,
        name: msg.get('name'),
        message: msg.get('message'),
        package: msg.get('package'),
        createdAt: msg.get('createdAt'),
        ipAddress: msg.get('ipAddress')
      }));
    } catch (error) {
      console.error('Error fetching message history:', error);
      return [];
    }
  }
}

// Initialize Database Manager
const dbManager = new DatabaseManager();

// ===== SCROLL PROGRESS LINE =====
function updateScrollProgress() {
  const scrollProgress = document.getElementById('scroll-progress');
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrollPercentage = (scrollTop / scrollHeight) * 100;
  
  scrollProgress.style.width = scrollPercentage + '%';
}

// Update progress on scroll
window.addEventListener('scroll', updateScrollProgress);

// Initial call to set the progress
updateScrollProgress();

// ===== SCROLL ANIMATIONS =====
const scrollObserverOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, scrollObserverOptions);

// Observe all animated elements
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.service-card, .proyecto, .plan, .timeline-item, .hero-stats .stat');
  animatedElements.forEach(el => {
    el.classList.add('fade-in-element');
    scrollObserver.observe(el);
  });
});

// ===== PARALLAX EFFECTS =====
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.parallax-element');
  
  parallaxElements.forEach(element => {
    const speed = element.dataset.speed || 0.5;
    const yPos = -(scrolled * speed);
    element.style.transform = `translateY(${yPos}px)`;
  });
});

// ===== FLOATING CARDS INTERACTIVE =====
document.addEventListener('DOMContentLoaded', () => {
  const floatingCards = document.querySelectorAll('.card');
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  floatingCards.forEach((card, index) => {
    setInterval(() => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;
      
      const deltaX = (mouseX - cardCenterX) * 0.02;
      const deltaY = (mouseY - cardCenterY) * 0.02;
      
      card.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px)`;
    }, 50);
  });
});

// ===== INTERACTIVE SERVICE CARDS =====
document.addEventListener('DOMContentLoaded', () => {
  const serviceCards = document.querySelectorAll('.service-card');
  
  serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-12px) rotateX(5deg)';
      card.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateX(0deg)';
      card.style.boxShadow = '';
    });
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 15;
      
      card.style.transform = `translateY(-12px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  });
});

// ===== TYPING ANIMATION =====
class TypeWriter {
  constructor(element, words, wait = 3000) {
    this.element = element;
    this.words = words;
    this.wait = parseInt(wait, 10);
    this.wordIndex = 0;
    this.currentWord = '';
    this.isDeleting = false;
    this.isPaused = false;
    this.timeoutId = null;
    
    // Configurar el Intersection Observer
    this.setupVisibilityObserver();
    
    // Iniciar la animación
    this.type();
  }

  setupVisibilityObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1 // Se activa cuando al menos 10% del elemento es visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // El elemento es visible, reanudar animación
          this.resume();
        } else {
          // El elemento no es visible, pausar animación
          this.pause();
        }
      });
    }, options);

    // Observar el elemento
    this.observer.observe(this.element);
  }

  pause() {
    this.isPaused = true;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.type();
    }
  }

  type() {
    // Si está pausado, no continuar
    if (this.isPaused) return;

    const current = this.wordIndex % this.words.length;
    const fullWord = this.words[current];

    if (this.isDeleting) {
      this.currentWord = fullWord.substring(0, this.currentWord.length - 1);
    } else {
      this.currentWord = fullWord.substring(0, this.currentWord.length + 1);
    }

    this.element.innerHTML = `<span class="typing-text">${this.currentWord}</span><span class="cursor">|</span>`;

    let typeSpeed = 100;

    if (this.isDeleting) {
      typeSpeed /= 2;
    }

    if (!this.isDeleting && this.currentWord === fullWord) {
      typeSpeed = this.wait;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentWord === '') {
      this.isDeleting = false;
      this.wordIndex++;
      typeSpeed = 500;
    }

    // Guardar el ID del timeout para poder cancelarlo
    this.timeoutId = setTimeout(() => this.type(), typeSpeed);
  }

  // Método para limpiar el observer cuando sea necesario
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

// Initialize typing animation
document.addEventListener('DOMContentLoaded', () => {
  const typeElement = document.querySelector('.typing-element');
  if (typeElement) {
    const words = ['sitios web profesionales', 'experiencias digitales únicas', 'soluciones web innovadoras', 'plataformas escalables'];
    new TypeWriter(typeElement, words, 2000);
  }
});

// ===== PARTICLE SYSTEM =====
class ParticleSystem {
  constructor(container, count = 50) {
    this.container = container;
    this.particles = [];
    this.createParticles(count);
    this.animate();
  }

  createParticles(count) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
      this.container.appendChild(particle);
      this.particles.push(particle);
    }
  }

  animate() {
    this.particles.forEach(particle => {
      particle.addEventListener('animationiteration', () => {
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
      });
    });
  }
}

// Initialize particles in hero section
document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    new ParticleSystem(heroSection, 30);
  }
});

// ===== MAGNETIC BUTTONS =====
document.addEventListener('DOMContentLoaded', () => {
  // Deshabilitar efectos magnéticos en elementos de proyecto para evitar interferencia con clics
  const magneticElements = document.querySelectorAll('.btn-primary, .service-card');
  
  magneticElements.forEach(element => {
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = Math.max(rect.width, rect.height) / 2;
      
      if (distance < maxDistance) {
        const strength = (maxDistance - distance) / maxDistance;
        const moveX = (x / maxDistance) * 20 * strength;
        const moveY = (y / maxDistance) * 20 * strength;
        
        element.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = '';
    });
  });
});

// ===== SUBTLE HOVER EFFECTS =====
document.addEventListener('DOMContentLoaded', () => {
  // Efectos suaves para elementos interactivos (excepto proyectos)
  const interactiveElements = document.querySelectorAll('a, button, .service-card, .plan');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      element.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    });
  });
});

// ===== SOUND EFFECTS & HAPTIC FEEDBACK =====
class SoundManager {
  constructor() {
    this.context = null;
    this.enabled = false;
    this.init();
  }

  init() {
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      this.context = new (AudioContext || webkitAudioContext)();
      this.enabled = true;
    }
  }

  playTone(frequency = 800, duration = 100, type = 'sine') {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

    gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration / 1000);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration / 1000);
  }

  hover() {
    this.playTone(600, 50);
    if (navigator.vibrate) navigator.vibrate(10);
  }

  click() {
    this.playTone(800, 100);
    if (navigator.vibrate) navigator.vibrate([30, 10, 30]);
  }
}

const soundManager = new SoundManager();

// ===== ENHANCED INTERACTIONS =====
document.addEventListener('DOMContentLoaded', () => {
  // Add sound effects to interactive elements
  const interactiveElements = document.querySelectorAll('.btn, .service-card, .proyecto, .plan, .nav-link');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      soundManager.hover();
      element.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    element.addEventListener('click', () => {
      soundManager.click();
    });
  });

  // Scroll-triggered animations with staggered timing
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const staggeredObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animate-in');
          soundManager.playTone(400 + (index * 50), 30);
        }, index * 100);
      }
    });
  }, observerOptions);

  // Observe elements with staggered animation
  const staggeredElements = document.querySelectorAll('.service-card, .proyecto, .plan');
  staggeredElements.forEach(el => {
    el.classList.add('fade-in-element');
    staggeredObserver.observe(el);
  });
});

// ===== EASTER EGG - KONAMI CODE =====
let konamiCode = [];
const konamiSequence = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.code);
  if (konamiCode.length > konamiSequence.length) {
    konamiCode.shift();
  }
  
  if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
    activateEasterEgg();
    konamiCode = [];
  }
});

function activateEasterEgg() {
  const body = document.body;
  body.style.animation = 'rainbow 2s linear infinite';
  
  // Add disco particles
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      createDiscoParticle();
    }, i * 50);
  }
  
  // Play celebration sound
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      soundManager.playTone(400 + (i * 100), 200);
    }, i * 100);
  }
  
  // Reset after 5 seconds
  setTimeout(() => {
    body.style.animation = '';
    document.querySelectorAll('.disco-particle').forEach(p => p.remove());
  }, 5000);
}

function createDiscoParticle() {
  const particle = document.createElement('div');
  particle.className = 'disco-particle';
  particle.style.cssText = `
    position: fixed;
    width: 10px;
    height: 10px;
    background: hsl(${Math.random() * 360}, 70%, 60%);
    border-radius: 50%;
    left: ${Math.random() * 100}vw;
    top: ${Math.random() * 100}vh;
    pointer-events: none;
    z-index: 9999;
    animation: disco-fall 3s linear forwards;
  `;
  document.body.appendChild(particle);
}

// ===== PERFORMANCE MONITOR =====
class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.monitor();
  }

  monitor() {
    const now = performance.now();
    this.frameCount++;
    
    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
      
      // Adjust animation quality based on performance
      if (this.fps < 30) {
        document.body.classList.add('low-performance');
      } else {
        document.body.classList.remove('low-performance');
      }
    }
    
    requestAnimationFrame(() => this.monitor());
  }
}

// Initialize performance monitoring
new PerformanceMonitor();

// ===== MOBILE NAVIGATION =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  }
});

// ===== SMOOTH SCROLLING =====
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

// ===== CONTACT FORM =====
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-contacto');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar formulario
            if (!validateContactForm(form)) {
                return;
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Obtener datos del formulario
            const nombre = form.nombre.value.trim();
            const contacto = form.contacto.value.trim();
            const mensaje = form.mensaje.value.trim();
            
            // Mostrar estado de verificación
            submitBtn.innerHTML = `
                <span>Verificando...</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
            `;
            submitBtn.disabled = true;
            
            try {
                // Verificar límite de mensajes
                const limitCheck = await dbManager.checkMessageLimit(contacto);
                
                if (!limitCheck.allowed) {
                    showNotification(
                        `Has alcanzado el límite diario de mensajes (4/4). Intenta mañana o contáctame directamente por WhatsApp.`, 
                        'warning'
                    );
                    
                    // Restaurar botón
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }
                
                // Mostrar intentos restantes si ya tiene algunos
                if (limitCheck.count > 0) {
                    showNotification(
                        `Mensaje ${limitCheck.count + 1}/4 enviado. Te quedan ${limitCheck.remainingAttempts - 1} intentos hoy.`, 
                        'info'
                    );
                }
                
                // Mostrar estado de envío
                submitBtn.innerHTML = `
                    <span>Enviando...</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                `;
                
                // Detectar si el mensaje viene de un paquete
                const isPackageMessage = mensaje.includes('Me interesa el paquete');
                let packageName = null;
                if (isPackageMessage) {
                    const packageMatch = mensaje.match(/Me interesa el paquete "([^"]+)"/);
                    packageName = packageMatch ? packageMatch[1] : null;
                }
                
                // Guardar en base de datos
                const saveResult = await dbManager.saveMessage({
                    name: nombre,
                    contact: contacto,
                    message: mensaje,
                    package: packageName
                });
                
                if (saveResult.success) {
                    console.log('✅ Mensaje guardado:', saveResult.offline ? 'offline' : `ID: ${saveResult.id}`);
                } else {
                    console.error('❌ Error guardando mensaje:', saveResult.error);
                }
                
                // Crear mensaje para WhatsApp/Email
                const whatsappMessage = `Hola! Soy ${nombre}.

Mi contacto: ${contacto}

${isPackageMessage ? 'SOLICITUD DE PAQUETE:\n' : 'CONSULTA GENERAL:\n'}${mensaje}

${saveResult.success && !saveResult.offline ? `\n🔍 ID de seguimiento: ${saveResult.id}` : ''}
📅 Fecha: ${new Date().toLocaleDateString('es-ES')}
🕐 Hora: ${new Date().toLocaleTimeString('es-ES')}

Enviado desde GabyDev Portfolio`;
                
                // Mostrar mensaje de éxito
                showNotification('¡Perfecto! Te estoy redirigiendo a WhatsApp 📱', 'success');
                
                // Limpiar formulario
                form.reset();
                
                // Restaurar botón con mensaje de éxito temporal
                submitBtn.innerHTML = `
                    <span>¡Enviado! 🎉</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                `;
                
                // Enviar a WhatsApp después de un breve delay
                setTimeout(() => {
                    const whatsappURL = `https://wa.me/18295639556?text=${encodeURIComponent(whatsappMessage)}`;
                    window.open(whatsappURL, '_blank');
                }, 1000);
                
                // Mostrar información adicional sobre límites
                if (limitCheck.remainingAttempts - 1 <= 1) {
                    setTimeout(() => {
                        showNotification(
                            `⚠️ Solo te queda ${limitCheck.remainingAttempts - 1} intento más hoy. Para consultas adicionales, contáctame directamente por WhatsApp.`, 
                            'warning'
                        );
                    }, 3000);
                }
                
            } catch (error) {
                console.error('Error processing form:', error);
                showNotification('Error al procesar el mensaje. Intenta nuevamente o contáctame directamente.', 'error');
            } finally {
                // Restaurar botón original después de 3 segundos
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }
});

// ===== FORM VALIDATION =====
function validateContactForm(form) {
    let isValid = true;
    
    // Limpiar errores previos
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
    
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.style.borderColor = '';
    });
    
    // Validar nombre
    const nombre = form.nombre.value.trim();
    if (!nombre) {
        showFieldError(form.nombre, 'Por favor, ingresa tu nombre');
        isValid = false;
    } else if (nombre.length < 2) {
        showFieldError(form.nombre, 'El nombre debe tener al menos 2 caracteres');
        isValid = false;
    }
    
    // Validar contacto (email o teléfono)
    const contacto = form.contacto.value.trim();
    if (!contacto) {
        showFieldError(form.contacto, 'Ingresa tu email o número de WhatsApp');
        isValid = false;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
        
        if (!emailRegex.test(contacto) && !phoneRegex.test(contacto)) {
            showFieldError(form.contacto, 'Ingresa un email válido o número de teléfono');
            isValid = false;
        }
    }
    
    // Validar mensaje
    const mensaje = form.mensaje.value.trim();
    if (!mensaje) {
        showFieldError(form.mensaje, 'Por favor, describe tu proyecto');
        isValid = false;
    } else if (mensaje.length < 10) {
        showFieldError(form.mensaje, 'Por favor, describe tu proyecto con más detalle (mínimo 10 caracteres)');
        isValid = false;
    }
    
    return isValid;
}

// ===== CONTACT LIMIT CHECKER =====
document.addEventListener('DOMContentLoaded', () => {
    const contactField = document.getElementById('contacto');
    let checkTimeout;
    
    if (contactField) {
        contactField.addEventListener('input', async function() {
            const contact = this.value.trim();
            
            // Clear previous timeout
            clearTimeout(checkTimeout);
            
            // Remove existing limit warnings
            const existingWarning = document.querySelector('.limit-warning');
            if (existingWarning) {
                existingWarning.remove();
            }
            
            // Only check if contact looks valid
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
            
            if (contact.length > 5 && (emailRegex.test(contact) || phoneRegex.test(contact))) {
                // Debounce the check
                checkTimeout = setTimeout(async () => {
                    try {
                        const limitCheck = await dbManager.checkMessageLimit(contact);
                        
                        if (limitCheck.count > 0) {
                            const warningDiv = document.createElement('div');
                            warningDiv.className = 'limit-warning';
                            
                            if (!limitCheck.allowed) {
                                warningDiv.innerHTML = `
                                    <div style="color: #ef4444; font-size: 0.875rem; margin-top: 0.5rem; padding: 0.75rem; background: rgba(239, 68, 68, 0.1); border-radius: 0.375rem; border-left: 3px solid #ef4444;">
                                        <strong>⚠️ Límite alcanzado:</strong> Has enviado 4 mensajes hoy. Para consultas adicionales, contáctame directamente por WhatsApp.
                                    </div>
                                `;
                            } else if (limitCheck.remainingAttempts <= 2) {
                                warningDiv.innerHTML = `
                                    <div style="color: #f59e0b; font-size: 0.875rem; margin-top: 0.5rem; padding: 0.75rem; background: rgba(245, 158, 11, 0.1); border-radius: 0.375rem; border-left: 3px solid #f59e0b;">
                                        <strong>📝 Intentos restantes:</strong> ${limitCheck.remainingAttempts} mensajes más hoy (${limitCheck.count}/4 enviados)
                                    </div>
                                `;
                            } else {
                                warningDiv.innerHTML = `
                                    <div style="color: #3b82f6; font-size: 0.875rem; margin-top: 0.5rem; padding: 0.75rem; background: rgba(59, 130, 246, 0.1); border-radius: 0.375rem; border-left: 3px solid #3b82f6;">
                                        <strong>✅ Bienvenido de vuelta:</strong> Has enviado ${limitCheck.count} mensaje${limitCheck.count > 1 ? 's' : ''} hoy. Te quedan ${limitCheck.remainingAttempts} intentos.
                                    </div>
                                `;
                            }
                            
                            contactField.parentElement.appendChild(warningDiv);
                        }
                    } catch (error) {
                        console.error('Error checking limit:', error);
                    }
                }, 1000);
            }
        });
    }
});

function showFieldError(field, message) {
    // Agregar borde rojo al campo
    field.style.borderColor = '#ef4444';
    
    // Crear mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        animation: shake 0.3s ease-in-out;
    `;
    
    // Agregar ícono de error
    errorDiv.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>${message}</span>
    `;
    
    // Insertar después del campo
    field.parentElement.appendChild(errorDiv);
    
    // Remover error cuando el usuario empiece a escribir
    field.addEventListener('input', function() {
        field.style.borderColor = '';
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, { once: true });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remover notificaciones existentes
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-weight: 600;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    // Agregar ícono según el tipo
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    
    notification.innerHTML = `
        ${icons[type] || icons.info}
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; margin-left: auto;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe elements for fade-in animation
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.service-card, .proyecto, .timeline-item, .plan, .hero-stats .stat');
  elements.forEach(el => {
    el.classList.add('fade-in-element');
    observer.observe(el);
  });
});

// ===== NAVBAR BACKGROUND ON SCROLL =====
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== TYPING ANIMATION FOR HERO TITLE =====
document.addEventListener('DOMContentLoaded', () => {
  const gradientText = document.querySelector('.gradient-text');
  if (gradientText) {
    const text = gradientText.textContent;
    gradientText.textContent = '';
    gradientText.style.borderRight = '2px solid var(--secondary)';
    
    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        gradientText.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      } else {
        // Remove cursor after typing is complete
        setTimeout(() => {
          gradientText.style.borderRight = 'none';
        }, 1000);
      }
    };
    
    // Start typing animation after a short delay
    setTimeout(typeWriter, 1000);
  }
});

// ===== PERFORMANCE OPTIMIZATIONS =====
// Lazy load images when they come into view
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
});

// ===== SUCCESS MESSAGE =====
console.log('🚀 GabyDev Portfolio loaded successfully!');
console.log('📱 Contact form ready - messages will be sent to WhatsApp!');
console.log('✨ Form includes validation and professional message formatting');
console.log('🗄️ Back4App integration active - message limits and storage enabled');

// ===== DYNAMIC LOGO EFFECTS - SENIOR LEVEL =====
document.addEventListener('DOMContentLoaded', function() {
  const navLogo = document.querySelector('.nav-logo');
  const logoText = document.querySelector('.logo-text');
  const logoAccent = document.querySelector('.logo-accent');
  
  if (!navLogo || !logoText || !logoAccent) return;
  
  // Efecto de typing al cargar la página
  setTimeout(() => {
    navLogo.classList.add('loading');
    setTimeout(() => {
      navLogo.classList.remove('loading');
    }, 3000);
  }, 500);
  
  // Efectos avanzados en hover
  navLogo.addEventListener('mouseenter', function() {
    this.style.setProperty('--glow-intensity', '1');
    createLogoParticles(this);
  });
  
  navLogo.addEventListener('mouseleave', function() {
    this.style.setProperty('--glow-intensity', '0');
  });
  
  // Efecto de glitch/hologram al hacer click
  navLogo.addEventListener('click', function(e) {
    e.preventDefault();
    this.classList.add('glitch-effect');
    
    // Crear efecto de ondas expansivas
    createLogoRippleEffect(e, this);
    
    // Remover efecto después de la animación
    setTimeout(() => {
      this.classList.remove('glitch-effect');
    }, 300);
    
    // Vibración si está disponible
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  });
  
  // Efecto de seguimiento del mouse
  navLogo.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    this.style.setProperty('--mouse-x', `${x}%`);
    this.style.setProperty('--mouse-y', `${y}%`);
    
    // Efecto de inclinación 3D sutil
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const rotateX = ((mouseY - centerY) / centerY) * 5;
    const rotateY = ((mouseX - centerX) / centerX) * 5;
    
    this.style.transform = `translateY(-2px) scale(1.05) perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
  });
  
  // Resetear transformación al salir
  navLogo.addEventListener('mouseleave', function() {
    this.style.transform = '';
  });
  
  // Efecto de cristal al presionar
  navLogo.addEventListener('mousedown', function() {
    this.style.transform = 'translateY(-1px) scale(0.98) perspective(1000px) rotateX(5deg)';
  });
  
  navLogo.addEventListener('mouseup', function() {
    this.style.transform = '';
  });
  
  // Animación continua de letras individuales
  setInterval(() => {
    if (!navLogo.matches(':hover')) {
      triggerLetterAnimation();
    }
  }, 5000);
  
  // Soporte para teclado (accesibilidad)
  navLogo.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  });
  
  // Efecto de foco para accesibilidad
  navLogo.addEventListener('focus', function() {
    this.style.outline = '2px solid var(--accent)';
    this.style.outlineOffset = '4px';
    createLogoParticles(this);
  });
  
  navLogo.addEventListener('blur', function() {
    this.style.outline = '';
    this.style.outlineOffset = '';
  });
  
  // Efecto de double-click para easter egg
  let clickCount = 0;
  navLogo.addEventListener('click', function() {
    clickCount++;
    setTimeout(() => {
      if (clickCount === 1) {
        // Single click normal
      } else if (clickCount === 2) {
        // Double click - efectos especiales
        triggerEasterEggEffect(this);
      }
      clickCount = 0;
    }, 300);
  });
  
  // Easter egg effect
  function triggerEasterEggEffect(element) {
    element.style.animation = 'logoSuperGlow 2s ease-in-out';
    createLogoParticles(element);
    
    // Crear múltiples ondas
    setTimeout(() => createLogoParticles(element), 200);
    setTimeout(() => createLogoParticles(element), 400);
    
    // Mensaje en consola
    console.log('🎉 ¡Easter Egg Activado! - Logo Super Efectos');
    
    setTimeout(() => {
      element.style.animation = '';
    }, 2000);
  }
  
  // Función para crear partículas del logo
  function createLogoParticles(element) {
    const rect = element.getBoundingClientRect();
    const particleContainer = element.querySelector('.logo-particles-container');
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'logo-particle';
      
      const angle = (360 / particleCount) * i;
      const radius = 30 + Math.random() * 20;
      const x = Math.cos(angle * Math.PI / 180) * radius;
      const y = Math.sin(angle * Math.PI / 180) * radius;
      
      particle.style.cssText = `
        position: absolute;
        width: 3px;
        height: 3px;
        background: linear-gradient(45deg, #6366f1, #ec4899, #f59e0b);
        border-radius: 50%;
        pointer-events: none;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        animation: logoParticleOrbit 2s ease-out forwards;
        --end-x: ${x}px;
        --end-y: ${y}px;
        box-shadow: 0 0 6px currentColor;
      `;
      
      if (particleContainer) {
        particleContainer.appendChild(particle);
      } else {
        element.appendChild(particle);
      }
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 2000);
    }
  }
  
  // Función para crear efecto de ondas
  function createLogoRippleEffect(event, element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      transform: scale(0);
      animation: logoRipple 0.6s ease-out;
      pointer-events: none;
      z-index: 1;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }
  
  // Función para animar letras individuales
  function triggerLetterAnimation() {
    logoText.style.animation = 'none';
    logoAccent.style.animation = 'none';
    
    logoText.offsetHeight; // Trigger reflow
    logoAccent.offsetHeight; // Trigger reflow
    
    logoText.style.animation = 'logoGlow 1s ease-in-out, logoShimmer 3s ease-in-out infinite';
    logoAccent.style.animation = 'logoAccentGlow 1s ease-in-out, logoAccentShimmer 2.5s ease-in-out infinite reverse';
  }
  
  console.log('✨ Logo dinámico inicializado con efectos de nivel senior');
});

// Estilos CSS dinámicos para partículas del logo
const logoParticleStyles = document.createElement('style');
logoParticleStyles.textContent = `
  .logo-particles-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
  }
  
  @keyframes logoParticleFloat {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-50px) scale(0);
    }
  }
  
  @keyframes logoParticleOrbit {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0);
    }
    20% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(calc(-50% + var(--end-x)), calc(-50% + var(--end-y))) scale(0);
    }
  }
  
  @keyframes logoRipple {
    0% {
      transform: scale(0);
      opacity: 0.8;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }
  
  /* Efecto de texto holográfico */
  .logo-text[data-text]::before,
  .logo-accent[data-text]::before {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    color: #00ffff;
    text-shadow: 0 0 10px #00ffff;
    transition: opacity 0.3s ease;
    z-index: -1;
  }
  
  .nav-logo.glitch-effect .logo-text[data-text]::before,
  .nav-logo.glitch-effect .logo-accent[data-text]::before {
    opacity: 0.7;
    animation: hologramFlicker 0.3s ease-in-out;
  }
  
  @keyframes hologramFlicker {
    0%, 100% { opacity: 0.7; transform: translateX(0); }
    25% { opacity: 0.3; transform: translateX(-2px); }
    50% { opacity: 0.9; transform: translateX(1px); }
    75% { opacity: 0.5; transform: translateX(-1px); }
  }
  
  @keyframes logoSuperGlow {
    0%, 100% { 
      filter: brightness(1) saturate(1) hue-rotate(0deg);
      transform: scale(1);
    }
    25% { 
      filter: brightness(1.3) saturate(1.5) hue-rotate(90deg);
      transform: scale(1.1);
    }
    50% { 
      filter: brightness(1.5) saturate(2) hue-rotate(180deg);
      transform: scale(1.15);
    }
    75% { 
      filter: brightness(1.3) saturate(1.5) hue-rotate(270deg);
      transform: scale(1.1);
    }
  }
`;
document.head.appendChild(logoParticleStyles);

// ===== ADMIN DASHBOARD =====
// El código del dashboard administrativo se ha movido a admin-dashboard.js
// para mantener una mejor organización del código
// Funciones incluidas: checkAdminLogin, showAdminPanel, loadDashboardData, etc.
     

// ===== FORCE PROJECT CLICKS =====
document.addEventListener('DOMContentLoaded', () => {
  // Asegurar que los clics en proyectos funcionen correctamente
  const projectElements = document.querySelectorAll('.demo-placeholder[onclick]');
  
  projectElements.forEach(element => {
    // Forzar pointer-events
    element.style.pointerEvents = 'auto';
    element.style.cursor = 'pointer';
    
    // Asegurar que los divs internos no bloqueen
    const innerDivs = element.querySelectorAll('div, svg, span');
    innerDivs.forEach(inner => {
      inner.style.pointerEvents = 'none';
    });
    
    // Agregar event listener adicional como respaldo
    element.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Ejecutar el onclick original
      const onclickAttr = this.getAttribute('onclick');
      if (onclickAttr) {
        try {
          eval(onclickAttr);
        } catch (error) {
          console.warn('Error ejecutando onclick:', error);
        }
      }
    }, true);
  });
  
  console.log('✅ Project click handlers configurados para', projectElements.length, 'elementos');
});

// ==========================================
// FUNCIONALIDAD DE AUTO-COMPLETADO DE FORMULARIO 
// DESDE BOTONES DE PRECIOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 Iniciando sistema de auto-completado de formulario...');
  
  // Seleccionar todos los botones de paquetes
  const packageButtons = document.querySelectorAll('.package-btn');
  
  // Plantillas de mensajes personalizados por paquete
  const messageTemplates = {
    'Menú Digital QR': `¡Hola! Me interesa el Menú Digital QR por RD$5,000.

Mi restaurante/negocio: [Nombre y tipo de comida]
Productos aproximados: [Ej: 30 platos, 15 bebidas]
Timeline: [¿Para cuándo lo necesitas?]

¡Listo para modernizar mi menú! 🍽️`,

    'Landing Page Pro': `¡Hola! Me interesa la Landing Page Pro por RD$8,000.

Mi negocio/servicio: [¿Qué ofreces?]
Objetivo: [Captar leads, vender producto, etc.]
Timeline: [¿Para cuándo la necesitas?]

¡Vamos a convertir más visitantes! �`,

    'Tienda Online': `¡Hola! Me interesa la Tienda Online por RD$13,000.

Mi negocio: [¿Qué vendes?]
Productos: [Cantidad aproximada]
Timeline: [¿Cuándo quieres lanzar?]

¡Listo para vender online! �💰`
  };
  
  // Función para generar mensaje personalizado
  function generateMessage(packageName, price) {
    return messageTemplates[packageName] || `¡Hola! Me interesa el paquete "${packageName}" por ${price}.

Mi proyecto: [Describe tu idea]
Timeline: [¿Para cuándo lo necesitas?]

¡Empezamos! 🚀`;
  }
  
  // Función para scroll suave hacia el formulario
  function smoothScrollToForm() {
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Pequeño delay para asegurar que el scroll termine antes de enfocar
      setTimeout(() => {
        const messageField = document.getElementById('mensaje');
        if (messageField) {
          messageField.focus();
          // Colocar cursor al final del texto
          messageField.setSelectionRange(messageField.value.length, messageField.value.length);
        }
      }, 800);
    }
  }
  
  // Agregar event listeners a cada botón
  packageButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault(); // Prevenir navegación automática
      
      const packageName = button.getAttribute('data-package');
      const price = button.getAttribute('data-price');
      
      console.log(`🎯 Botón clickeado: ${packageName} - ${price}`);
      
      // Generar mensaje personalizado
      const personalizedMessage = generateMessage(packageName, price);
      
      // Llenar el formulario
      const messageField = document.getElementById('mensaje');
      if (messageField) {
        messageField.value = personalizedMessage;
        console.log('✅ Formulario auto-completado');
        
        // Agregar una pequeña animación visual
        messageField.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))';
        messageField.style.border = '2px solid rgba(99, 102, 241, 0.3)';
        
        setTimeout(() => {
          messageField.style.background = '';
          messageField.style.border = '';
        }, 2000);
      }
      
      // Scroll suave hacia el formulario
      smoothScrollToForm();
    });
  });
  
  console.log('✅ Auto-completado de formulario configurado para', packageButtons.length, 'botones de paquetes');
});
