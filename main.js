// Frank Gehry Digital Art Piece - Interactive JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Frank Gehry Digital Art Piece loaded successfully!');
    
    // Initialize the interactive art piece
    initializeArtPiece();
    // Freeze positions to pixel values and set up scaling after layout
    setTimeout(() => {
        freezeCompositionPositions();
        setupStageScaling();
    }, 0);
});

// Also ensure everything is finalized after images/fonts load
window.addEventListener('load', () => {
    freezeCompositionPositions();
    setupStageScaling();
});

// Removal order tracking
let removalOrder = [
    'dark-red-trapezoid',
    'main-orange-triangle',
    'dark-green-quarter-circle',
    'bright-blue-rectangle',
    'orange-polygon',
    'red-triangle',
    'green-square'
];
let currentRemovalIndex = 0;

// Initialize the interactive art piece
function initializeArtPiece() {
    setupShapeInteractions();
    setupKeyboardControls();
    setupResetFunctionality();
    setupBackgroundShapeDragging();
}

// Capture current layout and convert to pixel-based absolute positioning within the stage
function freezeCompositionPositions() {
    const stage = document.querySelector('.art-container');
    if (!stage) return;
    const base = stage.getBoundingClientRect();

    // Exclude images - they should stay positioned relative to their parent shapes
    const elements = stage.querySelectorAll('.shape, .award-text, .name-text, .main-text');
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Position relative to the closest positioned ancestor (offsetParent)
        const parent = el.offsetParent || stage;
        const pref = parent.getBoundingClientRect();
        const left = rect.left - pref.left;
        const top = rect.top - pref.top;
        // Preserve existing transform; only lock box metrics
        el.style.position = 'absolute';
        el.style.left = left + 'px';
        el.style.top = top + 'px';
        el.style.width = rect.width + 'px';
        el.style.height = rect.height + 'px';
    });
    
    // Don't freeze images - let them use their CSS-defined positions
    // Images are already positioned absolutely relative to their parent shapes via CSS
    // The freeze function would break this relationship, especially with rotated shapes
}

// Scale the fixed-size stage to fit the current viewport while preserving aspect ratio
function setupStageScaling() {
    const stage = document.getElementById('composition-stage');
    if (!stage) return;
    // Match the CSS #composition-stage baseline size
    const DESIGN_WIDTH = 1480; // was 1280; updated to reflect current CSS
    const DESIGN_HEIGHT = 800;

    const rescale = () => {
        // Contain the composition but never scale above 1 (no zoom-in on large screens)
        const raw = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
        const scale = Math.min(raw, 1);
        stage.style.transform = `scale(${scale})`;
    };

    window.addEventListener('resize', rescale);
    rescale();
}

// Set up click interactions for all shapes
function setupShapeInteractions() {
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach(shape => {
        // Add click event listener
        shape.addEventListener('click', function() {
            // Check if this shape is next in the removal order
            const shapeClass = Array.from(this.classList).find(cls => removalOrder.includes(cls));
            if (shapeClass && removalOrder.indexOf(shapeClass) === currentRemovalIndex) {
                moveShapeOut(this);
                // Move to next shape in order
                currentRemovalIndex++;
            }
            // If not the right shape, do nothing (no visual feedback)
        });
        
        // Add keyboard support for accessibility
        shape.setAttribute('tabindex', '0');
        shape.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Check if this shape is next in the removal order
                const shapeClass = Array.from(this.classList).find(cls => removalOrder.includes(cls));
                if (shapeClass && removalOrder.indexOf(shapeClass) === currentRemovalIndex) {
                    moveShapeOut(this);
                    currentRemovalIndex++;
                }
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
    resetButton.textContent = 'Reset';
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
    
    // Reset removal order
    currentRemovalIndex = 0;
    
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

// Set up dragging for background shapes
function setupBackgroundShapeDragging() {
    const backgroundShapes = document.querySelectorAll('.background-shape');
    let draggedElement = null;
    let offset = { x: 0, y: 0 };
    let isDragging = false;
    let maxZIndex = 2; // Start at 2 (above default 1, below interactive shapes at 10)

    backgroundShapes.forEach(shape => {
        // Enable pointer events for dragging
        shape.style.pointerEvents = 'auto';
        shape.style.cursor = 'move';

        shape.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = true;
            draggedElement = this;
            
            // Get the current computed position
            const computedStyle = window.getComputedStyle(this);
            const currentLeft = parseFloat(computedStyle.left) || 0;
            const currentTop = parseFloat(computedStyle.top) || 0;
            
            const stage = document.getElementById('composition-stage');
            const stageRect = stage.getBoundingClientRect();
            
            // Calculate offset from mouse position to element's current position
            offset.x = e.clientX - stageRect.left - currentLeft;
            offset.y = e.clientY - stageRect.top - currentTop;
            
            // Add dragging class for visual feedback
            this.style.opacity = '0.7';
            this.style.zIndex = '100';
        });
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging || !draggedElement) return;
        
        e.preventDefault();
        
        const stage = document.getElementById('composition-stage');
        const stageRect = stage.getBoundingClientRect();
        
        // Calculate new position relative to the stage
        const newLeft = e.clientX - stageRect.left - offset.x;
        const newTop = e.clientY - stageRect.top - offset.y;
        
        // Update element position
        draggedElement.style.left = newLeft + 'px';
        draggedElement.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', function(e) {
        if (isDragging && draggedElement) {
            // Increment z-index counter and keep shape on top
            maxZIndex++;
            // Keep it below interactive shapes (z-index 10) but above other background shapes
            if (maxZIndex >= 10) {
                maxZIndex = 2; // Reset if we reach the limit
            }
            
            // Reset visual feedback but keep elevated z-index
            draggedElement.style.opacity = '0.85';
            draggedElement.style.zIndex = maxZIndex.toString();
            
            draggedElement = null;
            isDragging = false;
        }
    });

    // Also handle touch events for mobile
    backgroundShapes.forEach(shape => {
        shape.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const touch = e.touches[0];
            isDragging = true;
            draggedElement = this;
            
            // Get the current computed position
            const computedStyle = window.getComputedStyle(this);
            const currentLeft = parseFloat(computedStyle.left) || 0;
            const currentTop = parseFloat(computedStyle.top) || 0;
            
            const stage = document.getElementById('composition-stage');
            const stageRect = stage.getBoundingClientRect();
            
            // Calculate offset from touch position to element's current position
            offset.x = touch.clientX - stageRect.left - currentLeft;
            offset.y = touch.clientY - stageRect.top - currentTop;
            
            this.style.opacity = '0.7';
            this.style.zIndex = '100';
        });
    });

    document.addEventListener('touchmove', function(e) {
        if (!isDragging || !draggedElement) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        const stage = document.getElementById('composition-stage');
        const stageRect = stage.getBoundingClientRect();
        
        const newLeft = touch.clientX - stageRect.left - offset.x;
        const newTop = touch.clientY - stageRect.top - offset.y;
        
        draggedElement.style.left = newLeft + 'px';
        draggedElement.style.top = newTop + 'px';
    });

    document.addEventListener('touchend', function(e) {
        if (isDragging && draggedElement) {
            // Increment z-index counter and keep shape on top
            maxZIndex++;
            // Keep it below interactive shapes (z-index 10) but above other background shapes
            if (maxZIndex >= 10) {
                maxZIndex = 2; // Reset if we reach the limit
            }
            
            // Reset visual feedback but keep elevated z-index
            draggedElement.style.opacity = '0.85';
            draggedElement.style.zIndex = maxZIndex.toString();
            
            draggedElement = null;
            isDragging = false;
        }
    });
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
