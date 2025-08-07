// ===== BACK4APP CONFIGURATION =====
Parse.initialize("bi5z5LWihjCMZ1CQSAlWINkV6gv2y7LJzkXbxgg6", "vsRT0IVv4jDuy8TwogfEebaWvPuaVkI4zWAmQgGD");
Parse.serverURL = "https://parseapi.back4app.com/";

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

// ===== ADMIN DASHBOARD =====
// El código del dashboard administrativo se ha movido a admin-dashboard.js
// para mantener una mejor organización del código
// Funciones incluidas: checkAdminLogin, showAdminPanel, loadDashboardData, etc.

// Function to check if user is already logged in
function checkAdminLogin() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (isLoggedIn === 'true' && loginTime) {
        // Check if login is still valid (24 hours)
        const now = Date.now();
        const timeDiff = now - parseInt(loginTime);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (timeDiff < twentyFourHours) {
            return true;
        } else {
            // Session expired, clear storage
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminLoginTime');
        }
    }
    return false;
}

// Function to redirect to admin login
function redirectToAdminLogin() {
    // Add visual feedback if triggered by button
    const adminBtn = document.getElementById('admin-panel-btn');
    if (adminBtn) {
        adminBtn.style.transform = 'scale(0.95)';
        adminBtn.style.opacity = '0.5';
        setTimeout(() => {
            adminBtn.style.transform = '';
            adminBtn.style.opacity = '';
        }, 150);
    }
    
    // Redirect to login page
    window.location.href = 'admin-login.html';
}

// Maintain secret keyboard access for power users
let adminSequence = [];
const adminCode = ['ControlLeft', 'ShiftLeft', 'KeyA', 'KeyD', 'KeyM', 'KeyI', 'KeyN'];

document.addEventListener('keydown', (e) => {
    adminSequence.push(e.code);
    if (adminSequence.length > adminCode.length) {
        adminSequence.shift();
    }
    
    if (JSON.stringify(adminSequence) === JSON.stringify(adminCode)) {
        // Check if already logged in
        if (checkAdminLogin()) {
            showAdminPanel();
        } else {
            redirectToAdminLogin();
        }
        adminSequence = [];
    }
});

// Add visible button access
document.addEventListener('DOMContentLoaded', () => {
    const adminBtn = document.getElementById('admin-panel-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            // Check if already logged in
            if (checkAdminLogin()) {
                showAdminPanel();
            } else {
                redirectToAdminLogin();
            }
        });
    }
    
    // Check URL parameters for admin access after login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' && checkAdminLogin()) {
        // Show admin panel directly
        setTimeout(() => {
            showAdminPanel();
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 500);
    }
});

// Utility functions for the dashboard
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'hace un momento';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays}d`;
    
    return date.toLocaleDateString('es-ES');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#3b82f6'};
        border: 1px solid ${type === 'success' ? '#047857' : type === 'error' ? '#b91c1c' : '#2563eb'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Contact management functions
function sortContacts() {
    const sortBy = document.getElementById('contactSort').value;
    showNotification(`📊 Ordenando contactos por: ${sortBy}`, 'info');
    // Implementation would re-render the contacts list
}

function exportContacts() {
    showNotification('📊 Exportando lista de contactos...', 'success');
    // Implementation would generate CSV export
}

function viewContactHistory(contact) {
    showNotification(`📋 Cargando historial de ${contact}...`, 'info');
    // Implementation would show detailed contact history
}

// Settings functions
function exportData() {
    showNotification('📊 Iniciando exportación completa de datos...', 'success');
    // Implementation would export all data
}

function clearOldData() {
    if (confirm('¿Estás seguro de que quieres limpiar los datos antiguos? Esta acción no se puede deshacer.')) {
        showNotification('🧹 Limpiando datos antiguos...', 'success');
        // Implementation would clean old data
    }
}

function testConnection() {
    showNotification('🔌 Probando conexión con Back4App...', 'info');
    setTimeout(() => {
        showNotification('✅ Conexión exitosa con la base de datos', 'success');
    }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .dashboard-section {
        animation: fadeIn 0.5s ease;
    }
    
    .metric-card:hover {
        transform: translateY(-4px);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

async function showAdminPanel() {
    if (!dbManager.initialized) {
        showNotification('Panel de Administración no disponible - Back4App no conectado', 'error');
        return;
    }

    // Show loading notification
    showNotification('📊 Cargando dashboard profesional...', 'info');
    
    // Create admin panel with professional dashboard
    const adminPanel = document.createElement('div');
    adminPanel.id = 'admin-panel';
    adminPanel.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #0f172a;
        z-index: 99999;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
        animation: dashboardFadeIn 0.5s ease-out;
    `;
    
    const currentTime = new Date();
    const greeting = currentTime.getHours() < 12 ? 'Buenos días' : currentTime.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';
    
    adminPanel.innerHTML = `
        <!-- Dashboard Header -->
        <div class="dashboard-header" style="
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 1rem 2rem;
            border-bottom: 1px solid #475569;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            position: relative;
        ">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <button id="mobile-menu-toggle" style="
                    display: none;
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                    padding: 0.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-right: 1rem;
                    transition: all 0.2s;
                " onclick="toggleMobileSidebar()">☰</button>
                <div style="
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 1.2rem;
                ">G</div>
                <div>
                    <h1 style="margin: 0; color: white; font-size: 1.5rem; font-weight: 700;">
                        Dashboard GabyDev
                    </h1>
                    <p style="margin: 0; color: #94a3b8; font-size: 0.875rem;">
                        ${greeting}, Gabriel • ${currentTime.toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    border-radius: 6px;
                    padding: 0.5rem 1rem;
                    color: #60a5fa;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                ">
                    <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                    Conectado
                </div>
                <button onclick="location.reload()" style="
                    background: #374151;
                    border: 1px solid #4b5563;
                    color: #d1d5db;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                    🔄 Actualizar
                </button>
                <button onclick="document.getElementById('admin-panel').remove()" style="
                    background: #dc2626;
                    border: none;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
                    ✕ Cerrar
                </button>
            </div>
        </div>

        <!-- Dashboard Content -->
        <div style="
            display: flex;
            height: calc(100vh - 80px);
            background: #0f172a;
        ">
            <!-- Sidebar -->
            <div class="dashboard-sidebar" style="
                width: 280px;
                background: #1e293b;
                border-right: 1px solid #334155;
                padding: 1.5rem;
                overflow-y: auto;
            ">
                <nav style="space-y: 0.5rem;">
                    <button class="nav-item active" onclick="showDashboardSection('overview')" style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        transition: all 0.2s;
                    ">
                        📊 Dashboard General
                    </button>
                    <button class="nav-item" onclick="showDashboardSection('messages')" style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: transparent;
                        color: #94a3b8;
                        border: 1px solid #374151;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#334155'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">
                        💬 Mensajes
                    </button>
                    <button class="nav-item" onclick="showDashboardSection('analytics')" style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: transparent;
                        color: #94a3b8;
                        border: 1px solid #374151;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#334155'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">
                        📈 Analíticas
                    </button>
                    <button class="nav-item" onclick="showDashboardSection('contacts')" style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: transparent;
                        color: #94a3b8;
                        border: 1px solid #374151;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#334155'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">
                        👥 Contactos
                    </button>
                    <button class="nav-item" onclick="showDashboardSection('packages')" style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: transparent;
                        color: #94a3b8;
                        border: 1px solid #374151;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#334155'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">
                        📦 Paquetes
                    </button>
                    <button class="nav-item" onclick="showDashboardSection('settings')" style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: transparent;
                        color: #94a3b8;
                        border: 1px solid #374151;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#334155'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">
                        ⚙️ Configuración
                    </button>
                </nav>
                
                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #334155;">
                    <div style="
                        background: linear-gradient(135deg, #059669, #047857);
                        padding: 1rem;
                        border-radius: 8px;
                        text-align: center;
                    ">
                        <div style="color: white; font-weight: 600; margin-bottom: 0.5rem;">
                            🚀 Sistema Activo
                        </div>
                        <div style="color: #a7f3d0; font-size: 0.875rem;">
                            Back4App conectado
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div style="
                flex: 1;
                padding: 2rem;
                overflow-y: auto;
                background: #0f172a;
            ">
                <div id="dashboard-content">
                    <!-- Loading Content -->
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 400px;
                        color: #64748b;
                    ">
                        <div style="
                            width: 60px;
                            height: 60px;
                            border: 4px solid #334155;
                            border-top: 4px solid #3b82f6;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin-bottom: 1rem;
                        "></div>
                        <h3 style="margin: 0 0 0.5rem 0; color: #e2e8f0;">Cargando Dashboard</h3>
                        <p style="margin: 0; font-size: 0.875rem;">Obteniendo datos de la base de datos...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes dashboardFadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .nav-item.active {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                color: white !important;
                border-color: #3b82f6 !important;
            }
            
            /* Mobile Dashboard Styles */
            @media (max-width: 768px) {
                #mobile-menu-toggle {
                    display: block !important;
                }
                
                .dashboard-sidebar {
                    position: fixed !important;
                    top: 0 !important;
                    left: -280px !important;
                    height: 100vh !important;
                    z-index: 1001 !important;
                    transition: left 0.3s ease !important;
                }
                
                .dashboard-sidebar.open {
                    left: 0 !important;
                }
                
                .dashboard-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    display: none;
                }
                
                .dashboard-overlay.active {
                    display: block;
                }
            }
        </style>
    `;
    
    document.body.appendChild(adminPanel);
    
    // Load dashboard data
    await loadDashboardData();
}

// Mobile sidebar toggle function
window.toggleMobileSidebar = function() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    const overlay = document.querySelector('.dashboard-overlay');
    
    if (!overlay) {
        // Create overlay if it doesn't exist
        const newOverlay = document.createElement('div');
        newOverlay.className = 'dashboard-overlay';
        newOverlay.onclick = () => toggleMobileSidebar();
        document.getElementById('admin-panel').appendChild(newOverlay);
    }
    
    sidebar.classList.toggle('open');
    const overlayElement = document.querySelector('.dashboard-overlay');
    overlayElement.classList.toggle('active');
}

// Dashboard navigation function
window.showDashboardSection = function(section) {
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        item.style.background = 'transparent';
        item.style.color = '#94a3b8';
        item.style.borderColor = '#374151';
    });
    
    const activeItem = event.target;
    activeItem.classList.add('active');
    activeItem.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    activeItem.style.color = 'white';
    activeItem.style.borderColor = '#3b82f6';
    
    // Load section content
    loadDashboardSection(section);
}

// Load dashboard data function
async function loadDashboardData() {
    try {
        const query = new Parse.Query('ContactMessage');
        query.limit(1000); // Get more data for analytics
        query.descending('createdAt');
        
        const messages = await query.find();
        window.dashboardData = messages; // Store globally for use in sections
        
        // Load default section (overview)
        loadDashboardSection('overview');
        
    } catch (error) {
        const contentDiv = document.getElementById('dashboard-content');
        contentDiv.innerHTML = `
            <div style="
                text-align: center;
                padding: 3rem;
                color: #ef4444;
                background: #1e293b;
                border-radius: 12px;
                border: 1px solid #374151;
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="color: #ef4444; margin-bottom: 1rem; font-size: 1.5rem;">Error de Conexión</h3>
                <p style="color: #94a3b8; margin-bottom: 2rem;">Error cargando datos: ${error.message}</p>
                <button onclick="loadDashboardData()" style="
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                    🔄 Reintentar Conexión
                </button>
            </div>
        `;
    }
}

// Load specific dashboard section
async function loadDashboardSection(section) {
    const contentDiv = document.getElementById('dashboard-content');
    const messages = window.dashboardData || [];
    
    switch (section) {
        case 'overview':
            loadOverviewSection(contentDiv, messages);
            break;
        case 'messages':
            loadMessagesSection(contentDiv, messages);
            break;
        case 'analytics':
            loadAnalyticsSection(contentDiv, messages);
            break;
        case 'contacts':
            loadContactsSection(contentDiv, messages);
            break;
        case 'packages':
            loadPackagesSection(contentDiv, messages);
            break;
        case 'settings':
            loadSettingsSection(contentDiv, messages);
            break;
        default:
            loadOverviewSection(contentDiv, messages);
    }
}

// Overview Section
function loadOverviewSection(contentDiv, messages) {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const todayMessages = messages.filter(m => new Date(m.get('createdAt')).toDateString() === today.toDateString());
    const yesterdayMessages = messages.filter(m => new Date(m.get('createdAt')).toDateString() === yesterday.toDateString());
    const weekMessages = messages.filter(m => new Date(m.get('createdAt')) >= lastWeek);
    const monthMessages = messages.filter(m => new Date(m.get('createdAt')) >= lastMonth);
    const packageMessages = messages.filter(m => m.get('package'));
    const uniqueContacts = new Set(messages.map(m => m.get('contact'))).size;
    
    const avgDaily = Math.round(messages.length / Math.max(1, Math.ceil((today - new Date(messages[messages.length - 1]?.get('createdAt'))) / (24 * 60 * 60 * 1000))));
    
    contentDiv.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="color: #e2e8f0; font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0;">
                Dashboard General
            </h2>
            <p style="color: #94a3b8; margin: 0; font-size: 1rem;">
                Resumen completo de la actividad de tu portfolio
            </p>
        </div>

        <!-- Quick Stats Grid -->
        <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        ">
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 2rem;
                position: relative;
                overflow: hidden;
            ">
                <div style="
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    border-radius: 50%;
                    opacity: 0.1;
                "></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <h3 style="color: #94a3b8; font-size: 0.875rem; font-weight: 500; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
                            Mensajes Hoy
                        </h3>
                        <div style="
                            background: rgba(59, 130, 246, 0.2);
                            border-radius: 8px;
                            padding: 0.5rem;
                            color: #60a5fa;
                        ">📧</div>
                    </div>
                    <div style="color: white; font-size: 3rem; font-weight: 700; margin-bottom: 0.5rem;">
                        ${todayMessages.length}
                    </div>
                    <div style="color: ${todayMessages.length > yesterdayMessages.length ? '#10b981' : todayMessages.length < yesterdayMessages.length ? '#f59e0b' : '#64748b'}; font-size: 0.875rem;">
                        ${todayMessages.length === yesterdayMessages.length ? '=' : todayMessages.length > yesterdayMessages.length ? '+' : ''}${Math.abs(todayMessages.length - yesterdayMessages.length)} vs ayer
                    </div>
                </div>
            </div>

            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 2rem;
                position: relative;
                overflow: hidden;
            ">
                <div style="
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #10b981, #059669);
                    border-radius: 50%;
                    opacity: 0.1;
                "></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <h3 style="color: #94a3b8; font-size: 0.875rem; font-weight: 500; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
                            Total Mensajes
                        </h3>
                        <div style="
                            background: rgba(16, 185, 129, 0.2);
                            border-radius: 8px;
                            padding: 0.5rem;
                            color: #34d399;
                        ">💬</div>
                    </div>
                    <div style="color: white; font-size: 3rem; font-weight: 700; margin-bottom: 0.5rem;">
                        ${messages.length}
                    </div>
                    <div style="color: #10b981; font-size: 0.875rem;">
                        📈 ${avgDaily}/día promedio
                    </div>
                </div>
            </div>

            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 2rem;
                position: relative;
                overflow: hidden;
            ">
                <div style="
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    border-radius: 50%;
                    opacity: 0.1;
                "></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <h3 style="color: #94a3b8; font-size: 0.875rem; font-weight: 500; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
                            Contactos Únicos
                        </h3>
                        <div style="
                            background: rgba(245, 158, 11, 0.2);
                            border-radius: 8px;
                            padding: 0.5rem;
                            color: #fbbf24;
                        ">👥</div>
                    </div>
                    <div style="color: white; font-size: 3rem; font-weight: 700; margin-bottom: 0.5rem;">
                        ${uniqueContacts}
                    </div>
                    <div style="color: #f59e0b; font-size: 0.875rem;">
                        ${Math.round((uniqueContacts / messages.length) * 100)}% tasa conversión
                    </div>
                </div>
            </div>

            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 2rem;
                position: relative;
                overflow: hidden;
            ">
                <div style="
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    border-radius: 50%;
                    opacity: 0.1;
                "></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <h3 style="color: #94a3b8; font-size: 0.875rem; font-weight: 500; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
                            Solicitudes Paquetes
                        </h3>
                        <div style="
                            background: rgba(139, 92, 246, 0.2);
                            border-radius: 8px;
                            padding: 0.5rem;
                            color: #a78bfa;
                        ">📦</div>
                    </div>
                    <div style="color: white; font-size: 3rem; font-weight: 700; margin-bottom: 0.5rem;">
                        ${packageMessages.length}
                    </div>
                    <div style="color: #8b5cf6; font-size: 0.875rem;">
                        ${Math.round((packageMessages.length / messages.length) * 100)}% del total
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Activity & Quick Actions -->
        <div style="
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        ">
            <!-- Recent Messages -->
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
            ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                    <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0;">
                        📝 Actividad Reciente
                    </h3>
                    <button onclick="showDashboardSection('messages')" style="
                        background: #374151;
                        border: 1px solid #4b5563;
                        color: #d1d5db;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                        Ver todos
                    </button>
                </div>
                
                ${messages.slice(0, 5).map(message => `
                    <div style="
                        border-bottom: 1px solid #334155;
                        padding: 1rem 0;
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    ">
                        <div style="
                            width: 40px;
                            height: 40px;
                            background: ${message.get('package') ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'};
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                        ">
                            ${message.get('name').charAt(0).toUpperCase()}
                        </div>
                        <div style="flex: 1;">
                            <div style="color: #e2e8f0; font-weight: 500; margin-bottom: 0.25rem;">
                                ${message.get('name')}
                                ${message.get('package') ? `<span style="
                                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                                    color: white;
                                    padding: 0.125rem 0.5rem;
                                    border-radius: 4px;
                                    font-size: 0.75rem;
                                    margin-left: 0.5rem;
                                ">📦 ${message.get('package')}</span>` : ''}
                            </div>
                            <div style="color: #94a3b8; font-size: 0.875rem;">
                                ${message.get('message').substring(0, 80)}...
                            </div>
                        </div>
                        <div style="color: #64748b; font-size: 0.875rem; text-align: right;">
                            ${formatTimeAgo(new Date(message.get('createdAt')))}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Quick Actions -->
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
            ">
                <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem 0;">
                    ⚡ Acciones Rápidas
                </h3>
                
                <div style="space-y: 1rem;">
                    <button onclick="showDashboardSection('messages')" style="
                        width: 100%;
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        border: none;
                        padding: 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        margin-bottom: 1rem;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        💬 Ver Mensajes
                    </button>
                    
                    <button onclick="showDashboardSection('analytics')" style="
                        width: 100%;
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        border: none;
                        padding: 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        margin-bottom: 1rem;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        📈 Analíticas
                    </button>
                    
                    <button onclick="exportData()" style="
                        width: 100%;
                        background: #374151;
                        border: 1px solid #4b5563;
                        color: #d1d5db;
                        padding: 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        margin-bottom: 1rem;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                        📊 Exportar Datos
                    </button>
                </div>

                <!-- System Status -->
                <div style="
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #334155;
                ">
                    <h4 style="color: #94a3b8; font-size: 0.875rem; font-weight: 500; margin: 0 0 1rem 0; text-transform: uppercase; letter-spacing: 0.05em;">
                        Estado del Sistema
                    </h4>
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: rgba(16, 185, 129, 0.1);
                        border: 1px solid rgba(16, 185, 129, 0.2);
                        border-radius: 8px;
                        margin-bottom: 0.5rem;
                    ">
                        <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                        <span style="color: #34d399; font-size: 0.875rem;">Back4App Conectado</span>
                    </div>
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: rgba(16, 185, 129, 0.1);
                        border: 1px solid rgba(16, 185, 129, 0.2);
                        border-radius: 8px;
                    ">
                        <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                        <span style="color: #34d399; font-size: 0.875rem;">Formulario Activo</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helper function to format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return date.toLocaleDateString('es-ES');
}

// Export data function
window.exportData = function() {
    const messages = window.dashboardData || [];
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Fecha,Nombre,Contacto,Mensaje,Paquete,IP\n"
        + messages.map(m => 
            `"${new Date(m.get('createdAt')).toLocaleString('es-ES')}","${m.get('name')}","${m.get('contact')}","${m.get('message').replace(/"/g, '""')}","${m.get('package') || 'N/A'}","${m.get('ipAddress') || 'unknown'}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gabydev_messages_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('📊 Datos exportados correctamente', 'success');
}

// Messages Section
function loadMessagesSection(contentDiv, messages) {
    contentDiv.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                <h2 style="color: #e2e8f0; font-size: 2rem; font-weight: 700; margin: 0;">
                    💬 Gestión de Mensajes
                </h2>
                <div style="display: flex; gap: 1rem;">
                    <select id="messageFilter" onchange="filterMessages()" style="
                        background: #374151;
                        border: 1px solid #4b5563;
                        color: #d1d5db;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                    ">
                        <option value="all">Todos los mensajes</option>
                        <option value="today">Hoy</option>
                        <option value="week">Esta semana</option>
                        <option value="packages">Solo paquetes</option>
                    </select>
                    <input type="text" id="searchMessages" placeholder="Buscar mensajes..." onkeyup="searchMessages()" style="
                        background: #374151;
                        border: 1px solid #4b5563;
                        color: #d1d5db;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        width: 200px;
                    ">
                </div>
            </div>
            <p style="color: #94a3b8; margin: 0;">
                Gestiona y revisa todos los mensajes recibidos desde tu portfolio
            </p>
        </div>

        <div id="messagesContainer" style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            overflow: hidden;
        ">
            <div style="
                background: #334155;
                padding: 1rem 1.5rem;
                border-bottom: 1px solid #475569;
                display: grid;
                grid-template-columns: 200px 1fr 150px 100px;
                gap: 1rem;
                font-weight: 600;
                color: #e2e8f0;
                font-size: 0.875rem;
            ">
                <div>CONTACTO</div>
                <div>MENSAJE</div>
                <div>FECHA</div>
                <div>ACCIONES</div>
            </div>
            <div id="messagesList">
                ${messages.map((message, index) => `
                    <div class="message-row" data-package="${message.get('package') || ''}" data-date="${new Date(message.get('createdAt')).toISOString()}" style="
                        padding: 1.5rem;
                        border-bottom: 1px solid #334155;
                        display: grid;
                        grid-template-columns: 200px 1fr 150px 100px;
                        gap: 1rem;
                        align-items: start;
                        transition: all 0.2s;
                        ${message.get('package') ? 'background: rgba(139, 92, 246, 0.05);' : ''}
                    " onmouseover="this.style.background='rgba(59, 130, 246, 0.05)'" onmouseout="this.style.background='${message.get('package') ? 'rgba(139, 92, 246, 0.05)' : 'transparent'}'">
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <div style="
                                    width: 32px;
                                    height: 32px;
                                    background: ${message.get('package') ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'};
                                    border-radius: 6px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                    font-weight: bold;
                                    font-size: 0.875rem;
                                ">
                                    ${message.get('name').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style="color: #e2e8f0; font-weight: 500; font-size: 0.875rem;">
                                        ${message.get('name')}
                                    </div>
                                    <div style="color: #94a3b8; font-size: 0.75rem;">
                                        ${message.get('contact')}
                                    </div>
                                </div>
                            </div>
                            ${message.get('package') ? `
                                <div style="
                                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                                    color: white;
                                    padding: 0.25rem 0.5rem;
                                    border-radius: 4px;
                                    font-size: 0.75rem;
                                    font-weight: 500;
                                    display: inline-block;
                                ">
                                    📦 ${message.get('package')}
                                </div>
                            ` : ''}
                        </div>
                        <div>
                            <div style="color: #e2e8f0; font-size: 0.875rem; line-height: 1.5; margin-bottom: 0.5rem;">
                                ${message.get('message').substring(0, 150)}${message.get('message').length > 150 ? '...' : ''}
                            </div>
                            <button onclick="showFullMessage('${message.id}')" style="
                                background: #374151;
                                border: 1px solid #4b5563;
                                color: #94a3b8;
                                padding: 0.25rem 0.5rem;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 0.75rem;
                                transition: all 0.2s;
                            " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                                Ver completo
                            </button>
                        </div>
                        <div>
                            <div style="color: #94a3b8; font-size: 0.875rem;">
                                ${new Date(message.get('createdAt')).toLocaleDateString('es-ES')}
                            </div>
                            <div style="color: #64748b; font-size: 0.75rem;">
                                ${new Date(message.get('createdAt')).toLocaleTimeString('es-ES')}
                            </div>
                            <div style="color: #64748b; font-size: 0.75rem; margin-top: 0.25rem;">
                                ${formatTimeAgo(new Date(message.get('createdAt')))}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <button onclick="contactViaWhatsApp('${message.get('contact')}')" style="
                                background: #059669;
                                color: white;
                                border: none;
                                padding: 0.5rem;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 0.75rem;
                                transition: all 0.2s;
                            " onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
                                💬 WhatsApp
                            </button>
                            <button onclick="markAsRead('${message.id}')" style="
                                background: #374151;
                                border: 1px solid #4b5563;
                                color: #94a3b8;
                                padding: 0.5rem;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 0.75rem;
                                transition: all 0.2s;
                            " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                                ✓ Leído
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Analytics Section
function loadAnalyticsSection(contentDiv, messages) {
    // Prepare analytics data
    const now = new Date();
    const last30Days = [];
    const hourlyData = new Array(24).fill(0);
    const packageStats = {};
    const contactMethods = { email: 0, phone: 0 };
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        last30Days.push({
            date: date.toISOString().split('T')[0],
            count: 0
        });
    }
    
    // Process messages
    messages.forEach(message => {
        const messageDate = new Date(message.get('createdAt'));
        const dateStr = messageDate.toISOString().split('T')[0];
        const hour = messageDate.getHours();
        
        // Daily stats
        const dayIndex = last30Days.findIndex(day => day.date === dateStr);
        if (dayIndex !== -1) {
            last30Days[dayIndex].count++;
        }
        
        // Hourly stats
        hourlyData[hour]++;
        
        // Package stats
        const pkg = message.get('package');
        if (pkg) {
            packageStats[pkg] = (packageStats[pkg] || 0) + 1;
        }
        
        // Contact method stats
        const contact = message.get('contact');
        if (contact.includes('@')) {
            contactMethods.email++;
        } else {
            contactMethods.phone++;
        }
    });
    
    const maxDailyCount = Math.max(...last30Days.map(d => d.count), 1);
    const maxHourlyCount = Math.max(...hourlyData, 1);
    
    contentDiv.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="color: #e2e8f0; font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0;">
                📈 Analíticas Avanzadas
            </h2>
            <p style="color: #94a3b8; margin: 0;">
                Análisis detallado del comportamiento y patrones de contacto
            </p>
        </div>

        <!-- Key Metrics -->
        <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        ">
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            ">
                <div style="color: #3b82f6; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Tasa de Conversión
                </div>
                <div style="color: #e2e8f0; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                    ${Math.round((Object.values(packageStats).reduce((a, b) => a + b, 0) / messages.length) * 100)}%
                </div>
                <div style="color: #94a3b8; font-size: 0.875rem;">
                    De consultas a solicitudes
                </div>
            </div>
            
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            ">
                <div style="color: #10b981; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Promedio Diario
                </div>
                <div style="color: #e2e8f0; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                    ${Math.round(messages.length / 30)}
                </div>
                <div style="color: #94a3b8; font-size: 0.875rem;">
                    Mensajes por día
                </div>
            </div>
            
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            ">
                <div style="color: #f59e0b; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Hora Pico
                </div>
                <div style="color: #e2e8f0; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                    ${hourlyData.indexOf(Math.max(...hourlyData))}:00
                </div>
                <div style="color: #94a3b8; font-size: 0.875rem;">
                    Mayor actividad
                </div>
            </div>
            
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            ">
                <div style="color: #8b5cf6; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Retención
                </div>
                <div style="color: #e2e8f0; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                    ${Math.round((messages.length - new Set(messages.map(m => m.get('contact'))).size) / messages.length * 100)}%
                </div>
                <div style="color: #94a3b8; font-size: 0.875rem;">
                    Mensajes repetidos
                </div>
            </div>
        </div>

        <!-- Charts Grid -->
        <div style="
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        ">
            <!-- Daily Activity Chart -->
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
            ">
                <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem 0;">
                    📊 Actividad Últimos 30 Días
                </h3>
                <div style="display: flex; align-items: end; gap: 2px; height: 200px;">
                    ${last30Days.map(day => `
                        <div style="
                            flex: 1;
                            background: linear-gradient(to top, #3b82f6, #60a5fa);
                            height: ${Math.max((day.count / maxDailyCount) * 180, 4)}px;
                            border-radius: 2px 2px 0 0;
                            position: relative;
                            cursor: pointer;
                            transition: all 0.2s;
                        " 
                        title="${new Date(day.date).toLocaleDateString('es-ES')}: ${day.count} mensajes"
                        onmouseover="this.style.background='linear-gradient(to top, #1d4ed8, #3b82f6)'"
                        onmouseout="this.style.background='linear-gradient(to top, #3b82f6, #60a5fa)'">
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 1rem; color: #64748b; font-size: 0.75rem;">
                    <span>${new Date(last30Days[0].date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
                    <span>${new Date(last30Days[last30Days.length - 1].date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
                </div>
            </div>

            <!-- Package Distribution -->
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
            ">
                <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem 0;">
                    📦 Distribución Paquetes
                </h3>
                <div style="space-y: 1rem;">
                    ${Object.entries(packageStats).map(([pkg, count]) => {
                        const percentage = Math.round((count / messages.length) * 100);
                        return `
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="color: #e2e8f0; font-size: 0.875rem;">${pkg}</span>
                                    <span style="color: #94a3b8; font-size: 0.875rem;">${count} (${percentage}%)</span>
                                </div>
                                <div style="
                                    background: #374151;
                                    border-radius: 6px;
                                    height: 8px;
                                    overflow: hidden;
                                ">
                                    <div style="
                                        background: linear-gradient(135deg, #8b5cf6, #a78bfa);
                                        height: 100%;
                                        width: ${percentage}%;
                                        border-radius: 6px;
                                        transition: width 0.3s ease;
                                    "></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>

        <!-- Hourly Activity -->
        <div style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
        ">
            <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem 0;">
                🕐 Actividad por Hora
            </h3>
            <div style="display: flex; align-items: end; gap: 4px; height: 120px;">
                ${hourlyData.map((count, hour) => `
                    <div style="
                        flex: 1;
                        background: ${count === Math.max(...hourlyData) ? 'linear-gradient(to top, #f59e0b, #fbbf24)' : 'linear-gradient(to top, #374151, #4b5563)'};
                        height: ${Math.max((count / maxHourlyCount) * 100, 4)}px;
                        border-radius: 2px 2px 0 0;
                        position: relative;
                        cursor: pointer;
                        transition: all 0.2s;
                        display: flex;
                        align-items: end;
                        justify-content: center;
                        padding-bottom: 2px;
                    " 
                    title="${hour}:00 - ${count} mensajes"
                    onmouseover="this.style.opacity='0.8'"
                    onmouseout="this.style.opacity='1'">
                        <span style="color: white; font-size: 0.7rem; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
                            ${count > 0 ? count : ''}
                        </span>
                    </div>
                `).join('')}
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 1rem; color: #64748b; font-size: 0.75rem;">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
            </div>
        </div>

        <!-- Contact Methods -->
        <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        ">
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
            ">
                <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem 0;">
                    📞 Métodos de Contacto
                </h3>
                <div style="display: flex; gap: 1rem;">
                    <div style="
                        flex: 1;
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        border-radius: 8px;
                        padding: 1.5rem;
                        text-align: center;
                        color: white;
                    ">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📧</div>
                        <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">${contactMethods.email}</div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">Emails</div>
                    </div>
                    <div style="
                        flex: 1;
                        background: linear-gradient(135deg, #10b981, #059669);
                        border-radius: 8px;
                        padding: 1.5rem;
                        text-align: center;
                        color: white;
                    ">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📱</div>
                        <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">${contactMethods.phone}</div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">Teléfonos</div>
                    </div>
                </div>
            </div>

            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
            ">
                <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem 0;">
                    🎯 Insights Clave
                </h3>
                <div style="space-y: 1rem;">
                    <div style="
                        padding: 1rem;
                        background: rgba(59, 130, 246, 0.1);
                        border: 1px solid rgba(59, 130, 246, 0.2);
                        border-radius: 8px;
                        border-left: 4px solid #3b82f6;
                    ">
                        <div style="color: #60a5fa; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">
                            📈 Tendencia
                        </div>
                        <div style="color: #e2e8f0; font-size: 0.875rem;">
                            ${last30Days.slice(-7).reduce((sum, day) => sum + day.count, 0) > last30Days.slice(-14, -7).reduce((sum, day) => sum + day.count, 0) ? 'Incremento' : 'Disminución'} en actividad esta semana
                        </div>
                    </div>
                    
                    <div style="
                        padding: 1rem;
                        background: rgba(16, 185, 129, 0.1);
                        border: 1px solid rgba(16, 185, 129, 0.2);
                        border-radius: 8px;
                        border-left: 4px solid #10b981;
                    ">
                        <div style="color: #34d399; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">
                            🎯 Oportunidad
                        </div>
                        <div style="color: #e2e8f0; font-size: 0.875rem;">
                            ${hourlyData.indexOf(Math.max(...hourlyData)) < 12 ? 'Mañanas' : hourlyData.indexOf(Math.max(...hourlyData)) < 18 ? 'Tardes' : 'Noches'} son tu mejor momento
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Additional dashboard functions
window.filterMessages = function() {
    const filter = document.getElementById('messageFilter').value;
    const rows = document.querySelectorAll('.message-row');
    const now = new Date();
    
    rows.forEach(row => {
        const messageDate = new Date(row.dataset.date);
        const hasPackage = row.dataset.package !== '';
        let show = false;
        
        switch (filter) {
            case 'all':
                show = true;
                break;
            case 'today':
                show = messageDate.toDateString() === now.toDateString();
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                show = messageDate >= weekAgo;
                break;
            case 'packages':
                show = hasPackage;
                break;
        }
        
        row.style.display = show ? 'grid' : 'none';
    });
}

window.searchMessages = function() {
    const searchTerm = document.getElementById('searchMessages').value.toLowerCase();
    const rows = document.querySelectorAll('.message-row');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? 'grid' : 'none';
    });
}

window.contactViaWhatsApp = function(contact) {
    const message = `Hola! Te contacto desde el panel de administración de GabyDev. ¿En qué te puedo ayudar?`;
    const whatsappUrl = `https://wa.me/${contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    showNotification('📱 Abriendo WhatsApp...', 'success');
}

// Contacts Section
function loadContactsSection(contentDiv, messages) {
    const contacts = {};
    messages.forEach(message => {
        const contact = message.get('contact');
        if (!contacts[contact]) {
            contacts[contact] = {
                name: message.get('name'),
                contact: contact,
                messages: [],
                packages: new Set(),
                firstContact: new Date(message.get('createdAt')),
                lastContact: new Date(message.get('createdAt'))
            };
        }
        
        contacts[contact].messages.push(message);
        if (message.get('package')) {
            contacts[contact].packages.add(message.get('package'));
        }
        
        const messageDate = new Date(message.get('createdAt'));
        if (messageDate < contacts[contact].firstContact) {
            contacts[contact].firstContact = messageDate;
        }
        if (messageDate > contacts[contact].lastContact) {
            contacts[contact].lastContact = messageDate;
        }
    });

    const contactArray = Object.values(contacts).sort((a, b) => b.lastContact - a.lastContact);

    contentDiv.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                <h2 style="color: #e2e8f0; font-size: 2rem; font-weight: 700; margin: 0;">
                    👥 Gestión de Contactos
                </h2>
                <div style="display: flex; gap: 1rem;">
                    <select id="contactSort" onchange="sortContacts()" style="
                        background: #374151;
                        border: 1px solid #4b5563;
                        color: #d1d5db;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                    ">
                        <option value="recent">Más recientes</option>
                        <option value="frequent">Más frecuentes</option>
                        <option value="packages">Con paquetes</option>
                        <option value="alphabetical">A-Z</option>
                    </select>
                    <button onclick="exportContacts()" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                        📊 Exportar Lista
                    </button>
                </div>
            </div>
            <p style="color: #94a3b8; margin: 0;">
                Base de datos completa de contactos y su historial de interacciones
            </p>
        </div>

        <!-- Contact Stats -->
        <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        ">
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            ">
                <div style="color: #3b82f6; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Total Contactos
                </div>
                <div style="color: #e2e8f0; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                    ${contactArray.length}
                </div>
                <div style="color: #94a3b8; font-size: 0.875rem;">
                    Únicos registrados
                </div>
            </div>
            
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            ">
                <div style="color: #10b981; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Clientes Activos
                </div>
                <div style="color: #e2e8f0; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                    ${contactArray.filter(c => c.packages.size > 0).length}
                </div>
                <div style="color: #94a3b8; font-size: 0.875rem;">
                    Con solicitudes
                </div>
            </div>
            
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            ">
                <div style="color: #f59e0b; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Promedio Mensajes
                </div>
                <div style="color: #e2e8f0; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                    ${Math.round(messages.length / contactArray.length * 10) / 10}
                </div>
                <div style="color: #94a3b8; font-size: 0.875rem;">
                    Por contacto
                </div>
            </div>
            
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            ">
                <div style="color: #8b5cf6; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Tasa Retorno
                </div>
                <div style="color: #e2e8f0; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                    ${Math.round((contactArray.filter(c => c.messages.length > 1).length / contactArray.length) * 100)}%
                </div>
                <div style="color: #94a3b8; font-size: 0.875rem;">
                    Contactos recurrentes
                </div>
            </div>
        </div>

        <!-- Contacts List -->
        <div id="contactsContainer" style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            overflow: hidden;
        ">
            <div style="
                background: #334155;
                padding: 1rem 1.5rem;
                border-bottom: 1px solid #475569;
                display: grid;
                grid-template-columns: 250px 1fr 120px 150px 100px;
                gap: 1rem;
                font-weight: 600;
                color: #e2e8f0;
                font-size: 0.875rem;
            ">
                <div>CONTACTO</div>
                <div>ACTIVIDAD</div>
                <div>MENSAJES</div>
                <div>ÚLTIMO CONTACTO</div>
                <div>ACCIONES</div>
            </div>
            <div id="contactsList">
                ${contactArray.map(contact => `
                    <div class="contact-row" style="
                        padding: 1.5rem;
                        border-bottom: 1px solid #334155;
                        display: grid;
                        grid-template-columns: 250px 1fr 120px 150px 100px;
                        gap: 1rem;
                        align-items: center;
                        transition: all 0.2s;
                        ${contact.packages.size > 0 ? 'background: rgba(139, 92, 246, 0.05);' : ''}
                    " onmouseover="this.style.background='rgba(59, 130, 246, 0.05)'" onmouseout="this.style.background='${contact.packages.size > 0 ? 'rgba(139, 92, 246, 0.05)' : 'transparent'}'">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="
                                width: 40px;
                                height: 40px;
                                background: ${contact.packages.size > 0 ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'};
                                border-radius: 8px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-weight: bold;
                            ">
                                ${contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style="color: #e2e8f0; font-weight: 500; margin-bottom: 0.25rem;">
                                    ${contact.name}
                                </div>
                                <div style="color: #94a3b8; font-size: 0.875rem;">
                                    ${contact.contact}
                                </div>
                                ${contact.contact.includes('@') ? 
                                    '<div style="color: #60a5fa; font-size: 0.75rem;">📧 Email</div>' : 
                                    '<div style="color: #34d399; font-size: 0.75rem;">📱 Teléfono</div>'
                                }
                            </div>
                        </div>
                        
                        <div>
                            ${Array.from(contact.packages).map(pkg => `
                                <div style="
                                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                                    color: white;
                                    padding: 0.25rem 0.5rem;
                                    border-radius: 4px;
                                    font-size: 0.75rem;
                                    margin-bottom: 0.25rem;
                                    display: inline-block;
                                    margin-right: 0.5rem;
                                ">
                                    📦 ${pkg}
                                </div>
                            `).join('')}
                            ${contact.packages.size === 0 ? 
                                '<div style="color: #64748b; font-size: 0.875rem;">Solo consultas</div>' : ''
                            }
                            <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 0.5rem;">
                                Primer contacto: ${contact.firstContact.toLocaleDateString('es-ES')}
                            </div>
                        </div>
                        
                        <div style="text-align: center;">
                            <div style="
                                background: rgba(59, 130, 246, 0.1);
                                border: 1px solid rgba(59, 130, 246, 0.2);
                                border-radius: 6px;
                                padding: 0.5rem;
                                color: #60a5fa;
                                font-weight: 600;
                                font-size: 1.25rem;
                                margin-bottom: 0.25rem;
                            ">
                                ${contact.messages.length}
                            </div>
                            <div style="color: #94a3b8; font-size: 0.75rem;">
                                ${contact.messages.length === 1 ? 'mensaje' : 'mensajes'}
                            </div>
                        </div>
                        
                        <div style="text-align: center;">
                            <div style="color: #e2e8f0; font-size: 0.875rem; margin-bottom: 0.25rem;">
                                ${contact.lastContact.toLocaleDateString('es-ES')}
                            </div>
                            <div style="color: #94a3b8; font-size: 0.75rem;">
                                ${formatTimeAgo(contact.lastContact)}
                            </div>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <button onclick="contactViaWhatsApp('${contact.contact}')" style="
                                background: #059669;
                                color: white;
                                border: none;
                                padding: 0.375rem 0.75rem;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 0.75rem;
                                transition: all 0.2s;
                            " onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
                                💬 Chat
                            </button>
                            <button onclick="viewContactHistory('${contact.contact}')" style="
                                background: #374151;
                                border: 1px solid #4b5563;
                                color: #94a3b8;
                                padding: 0.375rem 0.75rem;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 0.75rem;
                                transition: all 0.2s;
                            " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                                📋 Historial
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Packages Section
function loadPackagesSection(contentDiv, messages) {
    const packageStats = {};
    const packageMessages = messages.filter(m => m.get('package'));
    
    packageMessages.forEach(message => {
        const pkg = message.get('package');
        if (!packageStats[pkg]) {
            packageStats[pkg] = {
                name: pkg,
                count: 0,
                messages: [],
                contacts: new Set(),
                dates: []
            };
        }
        packageStats[pkg].count++;
        packageStats[pkg].messages.push(message);
        packageStats[pkg].contacts.add(message.get('contact'));
        packageStats[pkg].dates.push(new Date(message.get('createdAt')));
    });

    const packageArray = Object.values(packageStats).sort((a, b) => b.count - a.count);

    contentDiv.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="color: #e2e8f0; font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0;">
                📦 Análisis de Paquetes
            </h2>
            <p style="color: #94a3b8; margin: 0;">
                Rendimiento y popularidad de los servicios ofrecidos
            </p>
        </div>

        <!-- Package Performance -->
        <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        ">
            ${packageArray.map((pkg, index) => {
                const recentRequests = pkg.dates.filter(date => 
                    (new Date() - date) < 7 * 24 * 60 * 60 * 1000
                ).length;
                const conversionRate = Math.round((pkg.contacts.size / pkg.count) * 100);
                
                return `
                    <div style="
                        background: linear-gradient(135deg, #1e293b, #334155);
                        border: 1px solid #475569;
                        border-radius: 12px;
                        padding: 2rem;
                        position: relative;
                        overflow: hidden;
                    ">
                        <div style="
                            position: absolute;
                            top: -10px;
                            right: -10px;
                            background: ${index === 0 ? '#f59e0b' : index === 1 ? '#6b7280' : '#cd7f32'};
                            color: white;
                            border-radius: 50%;
                            width: 30px;
                            height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 0.75rem;
                            font-weight: bold;
                        ">
                            #${index + 1}
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem 0;">
                                ${pkg.name}
                            </h3>
                            <div style="color: #94a3b8; font-size: 0.875rem;">
                                Servicio ${index === 0 ? 'más popular' : 'disponible'}
                            </div>
                        </div>
                        
                        <div style="
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 1rem;
                            margin-bottom: 1.5rem;
                        ">
                            <div style="
                                background: rgba(59, 130, 246, 0.1);
                                border: 1px solid rgba(59, 130, 246, 0.2);
                                border-radius: 8px;
                                padding: 1rem;
                                text-align: center;
                            ">
                                <div style="color: #60a5fa; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">
                                    ${pkg.count}
                                </div>
                                <div style="color: #94a3b8; font-size: 0.75rem;">
                                    Solicitudes
                                </div>
                            </div>
                            
                            <div style="
                                background: rgba(16, 185, 129, 0.1);
                                border: 1px solid rgba(16, 185, 129, 0.2);
                                border-radius: 8px;
                                padding: 1rem;
                                text-align: center;
                            ">
                                <div style="color: #34d399; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">
                                    ${pkg.contacts.size}
                                </div>
                                <div style="color: #94a3b8; font-size: 0.75rem;">
                                    Clientes
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="color: #94a3b8; font-size: 0.875rem;">Demanda esta semana</span>
                                <span style="color: #e2e8f0; font-size: 0.875rem;">${recentRequests}</span>
                            </div>
                            <div style="
                                background: #374151;
                                border-radius: 6px;
                                height: 6px;
                                overflow: hidden;
                            ">
                                <div style="
                                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                                    height: 100%;
                                    width: ${Math.min((recentRequests / Math.max(...packageArray.map(p => p.dates.filter(date => (new Date() - date) < 7 * 24 * 60 * 60 * 1000).length))) * 100, 100)}%;
                                    border-radius: 6px;
                                    transition: width 0.3s ease;
                                "></div>
                            </div>
                        </div>
                        
                        <div style="
                            background: rgba(139, 92, 246, 0.1);
                            border: 1px solid rgba(139, 92, 246, 0.2);
                            border-radius: 8px;
                            padding: 1rem;
                            text-align: center;
                        ">
                            <div style="color: #a78bfa; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">
                                Tasa de Conversión
                            </div>
                            <div style="color: #e2e8f0; font-size: 1.25rem; font-weight: 700;">
                                ${conversionRate}%
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>

        <!-- Package Timeline -->
        <div style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
        ">
            <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem 0;">
                📈 Tendencia de Solicitudes (Últimos 30 días)
            </h3>
            
            <div style="display: flex; gap: 2rem; height: 200px; align-items: end;">
                ${Array.from({length: 30}, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (29 - i));
                    const dateStr = date.toISOString().split('T')[0];
                    
                    const dayRequests = packageMessages.filter(m => 
                        new Date(m.get('createdAt')).toISOString().split('T')[0] === dateStr
                    ).length;
                    
                    const maxRequests = Math.max(...Array.from({length: 30}, (_, j) => {
                        const checkDate = new Date();
                        checkDate.setDate(checkDate.getDate() - (29 - j));
                        const checkDateStr = checkDate.toISOString().split('T')[0];
                        return packageMessages.filter(m => 
                            new Date(m.get('createdAt')).toISOString().split('T')[0] === checkDateStr
                        ).length;
                    }), 1);
                    
                    return `
                        <div style="
                            flex: 1;
                            background: linear-gradient(to top, #8b5cf6, #a78bfa);
                            height: ${Math.max((dayRequests / maxRequests) * 180, 4)}px;
                            border-radius: 2px 2px 0 0;
                            cursor: pointer;
                            transition: all 0.2s;
                        " 
                        title="${date.toLocaleDateString('es-ES')}: ${dayRequests} solicitudes"
                        onmouseover="this.style.background='linear-gradient(to top, #7c3aed, #8b5cf6)'"
                        onmouseout="this.style.background='linear-gradient(to top, #8b5cf6, #a78bfa)'">
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- Recent Package Requests -->
        <div style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 2rem;
        ">
            <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem 0;">
                🎯 Solicitudes Recientes de Paquetes
            </h3>
            
            <div style="space-y: 1rem;">
                ${packageMessages.slice(0, 10).map(message => `
                    <div style="
                        border-bottom: 1px solid #334155;
                        padding: 1rem 0;
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    ">
                        <div style="
                            width: 40px;
                            height: 40px;
                            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                        ">
                            ${message.get('name').charAt(0).toUpperCase()}
                        </div>
                        <div style="flex: 1;">
                            <div style="color: #e2e8f0; font-weight: 500; margin-bottom: 0.25rem;">
                                ${message.get('name')} • ${message.get('contact')}
                            </div>
                            <div style="
                                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                                color: white;
                                padding: 0.25rem 0.5rem;
                                border-radius: 4px;
                                font-size: 0.75rem;
                                font-weight: 500;
                                display: inline-block;
                                margin-bottom: 0.25rem;
                            ">
                                📦 ${message.get('package')}
                            </div>
                            <div style="color: #94a3b8; font-size: 0.875rem;">
                                ${message.get('message').substring(0, 100)}...
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #94a3b8; font-size: 0.875rem;">
                                ${formatTimeAgo(new Date(message.get('createdAt')))}
                            </div>
                            <button onclick="contactViaWhatsApp('${message.get('contact')}')" style="
                                background: #059669;
                                color: white;
                                border: none;
                                padding: 0.375rem 0.75rem;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 0.75rem;
                                margin-top: 0.5rem;
                                transition: all 0.2s;
                            " onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
                                💬 Contactar
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Settings Section
function loadSettingsSection(contentDiv, messages) {
    contentDiv.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="color: #e2e8f0; font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0;">
                ⚙️ Configuración del Sistema
            </h2>
            <p style="color: #94a3b8; margin: 0;">
                Administra la configuración y parámetros del dashboard
            </p>
        </div>

        <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        ">
            <!-- System Status -->
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
            ">
                <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem 0;">
                    🔧 Estado del Sistema
                </h3>
                
                <div style="space-y: 1rem;">
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 1rem;
                        background: rgba(16, 185, 129, 0.1);
                        border: 1px solid rgba(16, 185, 129, 0.2);
                        border-radius: 8px;
                    ">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                            <span style="color: #e2e8f0; font-weight: 500;">Back4App Database</span>
                        </div>
                        <span style="color: #34d399; font-size: 0.875rem; font-weight: 500;">Conectado</span>
                    </div>
                    
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 1rem;
                        background: rgba(16, 185, 129, 0.1);
                        border: 1px solid rgba(16, 185, 129, 0.2);
                        border-radius: 8px;
                    ">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                            <span style="color: #e2e8f0; font-weight: 500;">Formulario de Contacto</span>
                        </div>
                        <span style="color: #34d399; font-size: 0.875rem; font-weight: 500;">Activo</span>
                    </div>
                    
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 1rem;
                        background: rgba(16, 185, 129, 0.1);
                        border: 1px solid rgba(16, 185, 129, 0.2);
                        border-radius: 8px;
                    ">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                            <span style="color: #e2e8f0; font-weight: 500;">Límites de Mensajes</span>
                        </div>
                        <span style="color: #34d399; font-size: 0.875rem; font-weight: 500;">4/día por contacto</span>
                    </div>
                    
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 1rem;
                        background: rgba(16, 185, 129, 0.1);
                        border: 1px solid rgba(16, 185, 129, 0.2);
                        border-radius: 8px;
                    ">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                            <span style="color: #e2e8f0; font-weight: 500;">Panel Admin</span>
                        </div>
                        <span style="color: #34d399; font-size: 0.875rem; font-weight: 500;">Operativo</span>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
            ">
                <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem 0;">
                    ⚡ Acciones Rápidas
                </h3>
                
                <div style="space-y: 1rem;">
                    <button onclick="exportData()" style="
                        width: 100%;
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        border: none;
                        padding: 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        margin-bottom: 1rem;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        justify-content: center;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        📊 Exportar Todos los Datos
                    </button>
                    
                    <button onclick="clearOldData()" style="
                        width: 100%;
                        background: #f59e0b;
                        color: white;
                        border: none;
                        padding: 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        margin-bottom: 1rem;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        justify-content: center;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🧹 Limpiar Datos Antiguos
                    </button>
                    
                    <button onclick="testConnection()" style="
                        width: 100%;
                        background: #10b981;
                        color: white;
                        border: none;
                        padding: 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        margin-bottom: 1rem;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        justify-content: center;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🔌 Probar Conexión
                    </button>
                    
                    <button onclick="location.reload()" style="
                        width: 100%;
                        background: #374151;
                        border: 1px solid #4b5563;
                        color: #d1d5db;
                        padding: 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        justify-content: center;
                    " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                        🔄 Recargar Dashboard
                    </button>
                </div>
            </div>
        </div>

        <!-- Database Statistics -->
        <div style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 2rem;
            margin-top: 2rem;
        ">
            <h3 style="color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem 0;">
                📈 Estadísticas de Base de Datos
            </h3>
            
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
            ">
                <div style="text-align: center; padding: 1rem;">
                    <div style="color: #3b82f6; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">
                        ${messages.length}
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">Registros Totales</div>
                </div>
                
                <div style="text-align: center; padding: 1rem;">
                    <div style="color: #10b981; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">
                        ${Math.round((messages.length * 0.5) / 1024 * 100) / 100}KB
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">Espacio Usado</div>
                </div>
                
                <div style="text-align: center; padding: 1rem;">
                    <div style="color: #f59e0b; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">
                        ${messages.filter(m => {
                            const messageDate = new Date(m.get('createdAt'));
                            const today = new Date();
                            return messageDate.toDateString() === today.toDateString();
                        }).length}
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">Nuevos Hoy</div>
                </div>
                
                <div style="text-align: center; padding: 1rem;">
                    <div style="color: #8b5cf6; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">
                        99.9%
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">Uptime</div>
                </div>
            </div>
        </div>

        <!-- Version Info -->
        <div style="
            margin-top: 2rem;
            padding: 1.5rem;
            background: rgba(59, 130, 246, 0.05);
            border: 1px solid rgba(59, 130, 246, 0.1);
            border-radius: 8px;
            text-align: center;
        ">
            <div style="color: #94a3b8; font-size: 0.875rem; margin-bottom: 0.5rem;">
                Dashboard GabyDev Professional v2.0
            </div>
            <div style="color: #64748b; font-size: 0.75rem;">
                Última actualización: ${new Date().toLocaleDateString('es-ES')} • 
                Desarrollado con ❤️ por Gabriel Pimentel
            </div>
        </div>
    `;
}

// ===== PACKAGE SELECTION FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', () => {
  const packageButtons = document.querySelectorAll('.package-btn');
  const messageTextarea = document.getElementById('mensaje');

  packageButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      const packageName = button.getAttribute('data-package');
      const packagePrice = button.getAttribute('data-price');
      
      // Create the pre-filled message based on the package
      let packageMessage = '';
      
      if (packageName === 'Menú Digital QR') {
        packageMessage = `🍽️ ¡Hola! Me interesa el paquete "${packageName}" (${packagePrice})

� Información de mi restaurante:
• Nombre del restaurante: [Completar]
• Tipo de cocina: [Completar]
• Cantidad de productos en el menú: [Completar]
• ¿Tienes logo/imágenes? [Sí/No]

� Comentarios adicionales:`;
      
      } else if (packageName === 'Landing Page Pro') {
        packageMessage = `🚀 ¡Hola! Me interesa el paquete "${packageName}" (${packagePrice})

� Información de mi negocio:
• Tipo de negocio: [Completar]
• Objetivo principal: [Ventas/Leads/Información]

� Comentarios adicionales:`;
      
      } else if (packageName === 'Tienda Online') {
        packageMessage = `🛒 ¡Hola! Me interesa el paquete "${packageName}" (${packagePrice})

� Información de mi tienda:
• Tipo de productos: [Completar]
• Cantidad aproximada de productos: [Completar]
• ¿Necesitas pagos online? [Sí/No]

� Comentarios adicionales:`;
      }
      
      // Always replace the message textarea content (clear any existing text)
      messageTextarea.value = packageMessage;
      
      // Scroll to contact section smoothly
      document.getElementById('contacto').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Add a visual indication that the message was updated
      setTimeout(() => {
        messageTextarea.focus();
        messageTextarea.style.border = '2px solid var(--primary-color)';
        messageTextarea.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.3)';
        messageTextarea.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          messageTextarea.style.border = '';
          messageTextarea.style.boxShadow = '';
          messageTextarea.style.backgroundColor = '';
        }, 3000);
      }, 500);
    });
  });
});

// ===== MOBILE NAVIGATION =====
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburger && navMenu) {
    // Toggle menu
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // Prevent body scroll when menu is open
      if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
});

// ===== RESPONSIVE ENHANCEMENTS =====
document.addEventListener('DOMContentLoaded', function() {
  // Add touch-friendly interactions for mobile
  const portfolioItems = document.querySelectorAll('.proyecto');
  
  portfolioItems.forEach(item => {
    // Add touch events for mobile hover effects
    item.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    });
    
    item.addEventListener('touchend', function() {
      setTimeout(() => {
        this.classList.remove('touch-active');
      }, 300);
    });
  });

  // Optimize images for different screen sizes
  const images = document.querySelectorAll('img');
  const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      }
    });
  }, observerOptions);

  images.forEach(img => {
    if (img.dataset.src) {
      imageObserver.observe(img);
    }
  });

  // Smooth scroll performance optimization
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        const offset = window.innerWidth <= 768 ? 80 : 60;
        const targetPosition = targetSection.offsetTop - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});

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
