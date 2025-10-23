// Frank Gehry Digital Art Piece - Interactive JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Frank Gehry Digital Art Piece loaded successfully!');
    
    // Initialize the interactive art piece
    initializeArtPiece();
});

// Initialize the interactive art piece
function initializeArtPiece() {
    setupShapeInteractions();
    setupKeyboardControls();
    setupResetFunctionality();
}

// Set up click interactions for all shapes
function setupShapeInteractions() {
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach(shape => {
        // Add click event listener
        shape.addEventListener('click', function() {
            moveShapeOut(this);
        });
        
        // Add keyboard support for accessibility
        shape.setAttribute('tabindex', '0');
        shape.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                moveShapeOut(this);
            }
        });
        
        // Add hover effects
        shape.addEventListener('mouseenter', function() {
            this.style.transform = this.style.transform + ' scale(1.05)';
        });
        
        shape.addEventListener('mouseleave', function() {
            this.style.transform = this.style.transform.replace(' scale(1.05)', '');
        });
    });
}

// Move shape out of the window based on its direction
function moveShapeOut(shape) {
    if (shape.classList.contains('moved-out')) {
        return; // Already moved out
    }
    
    const direction = shape.getAttribute('data-direction');
    const originalTransform = shape.style.transform;
    
    // Add the moved-out class to trigger CSS animation
    shape.classList.add('moved-out');
    
    // Add a subtle sound effect (optional - can be removed if not desired)
    playClickSound();
    
    // Log the interaction for debugging
    console.log(`Shape moved out in direction: ${direction}`);
    
    // Optional: Add a small delay before making the shape completely invisible
    setTimeout(() => {
        shape.style.pointerEvents = 'none';
    }, 800);
}

// Set up keyboard controls
function setupKeyboardControls() {
    document.addEventListener('keydown', function(e) {
        // Press 'R' to reset all shapes
        if (e.key === 'r' || e.key === 'R') {
            resetAllShapes();
        }
        
        // Press 'Escape' to reset all shapes
        if (e.key === 'Escape') {
            resetAllShapes();
        }
        
        // Press '1-5' to move specific shapes
        const shapeNumbers = ['1', '2', '3', '4', '5'];
        if (shapeNumbers.includes(e.key)) {
            const shapes = document.querySelectorAll('.shape');
            const index = parseInt(e.key) - 1;
            if (shapes[index]) {
                moveShapeOut(shapes[index]);
            }
        }
    });
}

// Set up reset functionality
function setupResetFunctionality() {
    // Add reset button (optional - can be removed if not desired)
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset (R)';
    resetButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
    `;
    
    resetButton.addEventListener('click', resetAllShapes);
    document.body.appendChild(resetButton);
}

// Reset all shapes to their original positions
function resetAllShapes() {
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach(shape => {
        shape.classList.remove('moved-out');
        shape.style.pointerEvents = 'auto';
        shape.style.transform = shape.style.transform.replace(' scale(1.05)', '');
    });
    
    console.log('All shapes reset to original positions');
}

// Play a subtle click sound (optional)
function playClickSound() {
    // Create a simple click sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Silently fail if Web Audio API is not supported
        console.log('Audio not supported');
    }
}

// Add some visual feedback when shapes are clicked
function addVisualFeedback(shape) {
    // Create a ripple effect
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1000;
    `;
    
    // Add ripple animation to the page if it doesn't exist
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    shape.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

// Enhanced moveShapeOut function with visual feedback
function moveShapeOut(shape) {
    if (shape.classList.contains('moved-out')) {
        return;
    }
    
    // Add visual feedback
    addVisualFeedback(shape);
    
    const direction = shape.getAttribute('data-direction');
    shape.classList.add('moved-out');
    
    playClickSound();
    console.log(`Shape moved out in direction: ${direction}`);
    
    setTimeout(() => {
        shape.style.pointerEvents = 'none';
    }, 800);
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeArtPiece,
        moveShapeOut,
        resetAllShapes,
        setupShapeInteractions
    };
}
