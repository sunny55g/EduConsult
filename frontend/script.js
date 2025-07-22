// Smooth scrolling for navigation links
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

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Contact form submission
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form elements
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    const messageField = document.getElementById('message');
    const submitBtn = document.querySelector('.submit-btn');
    
    // Disable submit button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    const formData = {
        name: nameField.value,
        email: emailField.value,
        phone: phoneField.value,
        message: messageField.value,
        timestamp: new Date().toISOString()
    };

    // WhatsApp number (with country code, no + or spaces)
    const whatsappNumber = '919587322021';
    // Create WhatsApp message
    const whatsappMessage = `Name: ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0AMessage: ${formData.message}`;
    // WhatsApp URL
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    // Open WhatsApp in a new tab
    window.open(whatsappURL, '_blank');

    try {
        const response = await fetch('https://educonsult.onrender.com/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // Show success message
            showSuccessMessage();
            // Reset form
            document.getElementById('contactForm').reset();
        } else {
            throw new Error('Failed to submit form');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting your message. Please try again or contact us directly.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    }
});

// Function to show success message
function showSuccessMessage() {
    // Create success message element if it doesn't exist
    let successMessage = document.getElementById('successMessage');
    if (!successMessage) {
        successMessage = document.createElement('div');
        successMessage.id = 'successMessage';
        successMessage.className = 'success-message';
        successMessage.innerHTML = '<p>Thank you! Your message has been sent successfully.</p>';
        document.body.appendChild(successMessage);
    }
    
    // Show the message
    successMessage.classList.add('show');
    
    // Hide success message after 5 seconds
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
}

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all service cards and testimonial cards
document.querySelectorAll('.service-card, .testimonial-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});
