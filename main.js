// Frank Gehry Digital Art Piece - Interactive JavaScript

// Track if positions have been frozen to prevent double-freezing
let positionsFrozen = false;

// Wait for all images to load before freezing positions
function waitForImages(callback) {
    const images = document.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = images.length;
    
    if (totalImages === 0) {
        callback();
        return;
    }
    
    const checkComplete = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
            // Small delay to ensure layout has settled after images load
            setTimeout(callback, 50);
        }
    };
    
    images.forEach(img => {
        if (img.complete && img.naturalHeight !== 0) {
            // Image already loaded
            checkComplete();
        } else {
            // Wait for image to load
            img.addEventListener('load', checkComplete);
            img.addEventListener('error', checkComplete); // Count errors as "loaded" to not block forever
        }
    });
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Frank Gehry Digital Art Piece loaded successfully!');
    
    // Initialize the interactive art piece
    initializeArtPiece();
    // Freeze positions to pixel values and set up scaling after images load
    waitForImages(() => {
        freezeCompositionPositions();
        setupStageScaling();
    });
    
    // Hide instructions area after 6 seconds with smooth fade-out
    setTimeout(() => {
        const instructionsArea = document.getElementById('instructions-area');
        if (instructionsArea) {
            // Start fade-out transition
            instructionsArea.style.opacity = '0';
            // Hide completely after transition completes (0.8s)
            setTimeout(() => {
                // instructionsArea.style.display = 'none';
                instructionsArea.style.opacity = "0";
            }, 800);
        }
    }, 6000);
});

// Also ensure everything is finalized after images/fonts load
window.addEventListener('load', () => {
    waitForImages(() => {
        freezeCompositionPositions();
        setupStageScaling();
    });
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
    setupTitleClick();
}

// Set up title click to reset
function setupTitleClick() {
    const title = document.getElementById('title');
    if (title) {
        title.style.cursor = 'pointer';
        title.addEventListener('click', resetAllShapes);
    }
}

// Capture current layout and convert to pixel-based absolute positioning within the stage
function freezeCompositionPositions() {
    // Prevent double-freezing
    if (positionsFrozen) return;
    
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
    
    positionsFrozen = true;
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
        // Store original CSS transform on initialization
        if (!shape.dataset.originalTransform) {
            const computedStyle = window.getComputedStyle(shape);
            // Try to get the transform from the stylesheet, or use computed
            // For now, we'll work with what we have - store that this shape has a CSS transform
            shape.dataset.hasCssTransform = computedStyle.transform !== 'none';
            // We'll read the actual CSS transform value when needed
        }
        // Add click event listener
        shape.addEventListener('click', function() {
            // Check if this shape is next in the removal order
            const shapeClass = Array.from(this.classList).find(cls => removalOrder.includes(cls));
            if (shapeClass && removalOrder.indexOf(shapeClass) === currentRemovalIndex) {
                moveShapeOut(this);
                // Move to next shape in order
                currentRemovalIndex++;
                // Check if all shapes are removed
                if (currentRemovalIndex >= removalOrder.length) {
                    showArchitectTitle();
                }
                // Update which shape can expand (next shape in order)
                updateExpandableShape();
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
                    // Check if all shapes are removed
                    if (currentRemovalIndex >= removalOrder.length) {
                        showArchitectTitle();
                    }
                    // Update which shape can expand
                    updateExpandableShape();
                }
            }
        });
        
        // Store original transform on first hover
        if (!shape.dataset.originalTransform) {
            // Get original CSS transform from stylesheet
            const sheets = document.styleSheets;
            for (let sheet of sheets) {
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    for (let rule of rules) {
                        if (rule.selectorText && shape.matches(rule.selectorText)) {
                            const transformValue = rule.style.transform;
                            if (transformValue) {
                                shape.dataset.originalTransform = transformValue;
                                break;
                            }
                        }
                    }
                } catch (e) {
                    // Cross-origin stylesheet, skip
                }
            }
        }
        
        // Add hover effect - all shapes rotate, only top shape expands
        shape.addEventListener('mouseenter', function() {
            // Check if this is the next shape in removal order
            const shapeClass = Array.from(this.classList).find(cls => removalOrder.includes(cls));
            const isNextShape = shapeClass && removalOrder.indexOf(shapeClass) === currentRemovalIndex;
            
            // Get original transform
            let originalTransform = this.dataset.originalTransform || '';
            
            // If we don't have it stored yet, try to get it now
            if (!originalTransform) {
                const sheets = document.styleSheets;
                for (let sheet of sheets) {
                    try {
                        const rules = sheet.cssRules || sheet.rules;
                        for (let rule of rules) {
                            if (rule.selectorText && this.matches(rule.selectorText)) {
                                const transformValue = rule.style.transform;
                                if (transformValue) {
                                    this.dataset.originalTransform = transformValue;
                                    originalTransform = transformValue;
                                    break;
                                }
                            }
                        }
                    } catch (e) {
                        // Cross-origin stylesheet, skip
                    }
                }
            }
            
            // Build the hover transform: rotate to 0deg (into place) + scale if top shape
            let hoverTransform = 'rotate(0deg)';
            
            if (isNextShape) {
                // Top shape also expands
                hoverTransform += ' scale(1.05)';
            }
            
            this.style.transform = hoverTransform;
        });
        
        shape.addEventListener('mouseleave', function() {
            // Keep rotation at 0deg, only remove scale if it was applied
            const currentTransform = this.style.transform || '';
            if (currentTransform.includes('scale(1.05)')) {
                // Remove scale but keep rotation at 0deg
                this.style.transform = 'rotate(0deg)';
            }
            // If no scale was applied, transform stays as rotate(0deg) - no change needed
        });
    });
    
    // Initial update of which shape can expand
    updateExpandableShape();
}

// Update which shape can expand on hover
// This function ensures any lingering scale transforms are removed from shapes that are no longer next
function updateExpandableShape() {
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach(shape => {
        // Check if this shape is still the next one
        const shapeClass = Array.from(shape.classList).find(cls => removalOrder.includes(cls));
        const isNextShape = shapeClass && removalOrder.indexOf(shapeClass) === currentRemovalIndex;
        
        // If this shape is no longer the next one, remove any scale transform but keep rotation
        if (!isNextShape) {
            const currentTransform = shape.style.transform || '';
            if (currentTransform.includes('scale(1.05)')) {
                // Remove scale but preserve rotation (should be rotate(0deg) if shape was hovered)
                if (currentTransform.includes('rotate(0deg)')) {
                    shape.style.transform = 'rotate(0deg)';
                } else {
                    const withoutScale = currentTransform.replace(/\s*scale\(1\.05\)/g, '').trim();
                    shape.style.transform = withoutScale || '';
                }
            }
        }
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
        // Restore original transform (rotation)
        const originalTransform = shape.dataset.originalTransform || '';
        if (originalTransform) {
            shape.style.transform = originalTransform;
        } else {
            // Clear inline style to restore CSS transform
            shape.style.transform = '';
        }
    });
    
    // Reset removal order
    currentRemovalIndex = 0;
    
    // Hide the architect title
    hideArchitectTitle();
    
    // Update which shape can expand
    updateExpandableShape();
    
    console.log('All shapes reset to original positions');
}

// Show the architect title when all shapes are removed
function showArchitectTitle() {
    let titleElement = document.getElementById('architect-title');
    if (!titleElement) {
        // Create the title element
        titleElement = document.createElement('h1');
        titleElement.id = 'architect-title';
        titleElement.textContent = 'Now you can be the architect. Fit the pieces together.';
        titleElement.className = 'architect-title';
        
        // Find the first background shape and insert title before it
        const firstBackgroundShape = document.querySelector('.background-shape');
        const artContainer = document.querySelector('.art-container');
        
        if (firstBackgroundShape && artContainer) {
            artContainer.insertBefore(titleElement, firstBackgroundShape);
        } else if (artContainer) {
            artContainer.appendChild(titleElement);
        }
    }
    titleElement.style.display = 'block';
    titleElement.style.zIndex = 2;
}

// Hide the architect title
function hideArchitectTitle() {
    const titleElement = document.getElementById('architect-title');
    if (titleElement) {
        titleElement.style.display = 'none';
    }
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
            shape.style.zIndex = 1000;
        
        });

        shape.addEventListener("click", () => {
            shape.style.zIndex = zIndex + 1;
        })
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
