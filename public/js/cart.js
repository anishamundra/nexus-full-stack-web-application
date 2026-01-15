// Enhanced cart functionality for Nine Cards Commerce
document.addEventListener('DOMContentLoaded', function () {
    console.log('Cart.js loaded - enhancing user experience');

    // Add smooth animation to Add to Cart buttons
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');

    addToCartForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            const button = this.querySelector('button');
            const originalText = button.textContent;
            const originalBackground = button.style.background;

            // Show loading state
            button.textContent = 'Adding...';
            button.disabled = true;
            button.style.opacity = '0.8';

            // Add pulse animation
            button.style.animation = 'pulse 0.5s infinite';

            // Re-enable after 3 seconds in case of error
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
                button.style.opacity = '1';
                button.style.animation = 'none';
            }, 3000);
        });
    });

    // Auto-hide success message after 4 seconds with smooth animation
    const successMessage = document.querySelector('.success-message');
    if (successMessage) {
        // Add entrance animation
        successMessage.style.animation = 'slideDown 0.5s ease-out';

        setTimeout(() => {
            successMessage.style.transition = 'all 0.5s ease-out';
            successMessage.style.opacity = '0';
            successMessage.style.transform = 'translateY(-20px)';
            successMessage.style.marginBottom = '0';
            successMessage.style.padding = '0';
            successMessage.style.height = '0';
            successMessage.style.overflow = 'hidden';

            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.remove();
                }
            }, 500);
        }, 4000);
    }

    // Add hover effects to product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Enhance quantity inputs in cart page
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'scale(1.05)';
            this.style.borderColor = '#3498db';
        });

        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'scale(1)';
            this.style.borderColor = '#e9ecef';
        });

        // Validate quantity on change
        input.addEventListener('change', function () {
            const value = parseInt(this.value);
            if (value < 1) {
                this.value = 1;
            } else if (value > 10) {
                this.value = 10;
            }
        });
    });

    // Add confirmation for remove buttons in cart
    const removeButtons = document.querySelectorAll('.btn-danger');
    removeButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            if (!confirm('Are you sure you want to remove this item from your cart?')) {
                e.preventDefault();
            }
        });
    });

    // Smooth scroll to top when success message appears
    if (successMessage) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Update cart count with animation when it changes
    function animateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.style.animation = 'bounce 0.5s ease-out';
            setTimeout(() => {
                cartCount.style.animation = 'none';
            }, 500);
        }
    }

    // Listen for cart count changes (this would be used with AJAX in a more advanced implementation)
    if (typeof cartCount !== 'undefined' && cartCount > 0) {
        animateCartCount();
    }
});

// Additional CSS animations that we'll inject
const additionalStyles = `
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0) scale(1);
    }
    40% {
        transform: translateY(-5px) scale(1.1);
    }
    60% {
        transform: translateY(-3px) scale(1.05);
    }
}

.success-message {
    animation: slideDown 0.5s ease-out;
}

.cart-count {
    animation: bounce 0.5s ease-out;
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Utility function to show temporary message (could be used for other notifications)
function showTempMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `temp-message ${type}-message`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 500);
    }, 3000);
}

// Add slide animations for temp messages
const tempMessageStyles = `
@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideOutRight {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}
`;

const tempStyleSheet = document.createElement('style');
tempStyleSheet.textContent = tempMessageStyles;
document.head.appendChild(tempStyleSheet);

console.log('Cart enhancement script loaded successfully');