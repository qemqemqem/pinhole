class PinholeCamera {
    constructor() {
        this.sourceCanvas = document.getElementById('sourceCanvas');
        this.pinholeCanvas = document.getElementById('pinholeCanvas');
        this.projectionCanvas = document.getElementById('projectionCanvas');
        
        this.sourceCtx = this.sourceCanvas.getContext('2d');
        this.pinholeCtx = this.pinholeCanvas.getContext('2d');
        this.projectionCtx = this.projectionCanvas.getContext('2d');
        
        this.sourceImage = new Image();
        this.sourceImage.crossOrigin = 'anonymous';
        this.sourceImage.onload = () => this.render();
        
        this.pinholeSize = 3;
        this.rayCount = 50;
        this.imageData = null; // Store image data for color sampling
        
        this.setupControls();
        this.loadSourceImage();
    }
    
    setupControls() {
        const pinholeSlider = document.getElementById('pinholeSize');
        const raySlider = document.getElementById('rayCount');
        const pinholeSizeValue = document.getElementById('pinholeSizeValue');
        const rayCountValue = document.getElementById('rayCountValue');
        
        // Add smooth value update animation
        const animateValueUpdate = (element, newValue, suffix = '') => {
            element.classList.add('updating');
            setTimeout(() => {
                element.textContent = newValue + suffix;
                element.classList.remove('updating');
            }, 100);
        };
        
        // Enhanced pinhole slider with clean feedback
        pinholeSlider.addEventListener('input', (e) => {
            this.pinholeSize = parseFloat(e.target.value);
            animateValueUpdate(pinholeSizeValue, this.pinholeSize.toFixed(1));
            this.render();
        });
        
        // Enhanced ray slider with clean feedback
        raySlider.addEventListener('input', (e) => {
            this.rayCount = parseInt(e.target.value);
            animateValueUpdate(rayCountValue, this.rayCount);
            this.render();
        });
        
        // Add hover effects and haptic feedback simulation
        [pinholeSlider, raySlider].forEach(slider => {
            slider.addEventListener('mousedown', () => {
                slider.style.transform = 'scaleY(1.1)';
            });
            
            slider.addEventListener('mouseup', () => {
                slider.style.transform = 'scaleY(1)';
            });
            
            slider.addEventListener('mouseleave', () => {
                slider.style.transform = 'scaleY(1)';
            });
        });
        
        // Initialize clean slider styling
        pinholeSlider.style.background = '#dee2e6';
        raySlider.style.background = '#dee2e6';
    }
    
    loadSourceImage() {
        // Try multiple Van Gogh sources with fallback
        const sources = [
            'https://upload.wikimedia.org/wikipedia/commons/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg',
            'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="%23f0e68c"/><circle cx="150" cy="120" r="40" fill="%23daa520"/><circle cx="130" cy="110" r="5" fill="%23000"/><circle cx="170" cy="110" r="5" fill="%23000"/><path d="M140 140 Q150 150 160 140" stroke="%23000" stroke-width="2" fill="none"/><text x="150" y="200" text-anchor="middle" font-family="serif" font-size="16" fill="%238b4513">Van Gogh Portrait</text></svg>'
        ];
        
        this.tryLoadImage(sources, 0);
    }
    
    tryLoadImage(sources, index) {
        if (index >= sources.length) {
            this.createFallbackImage();
            return;
        }
        
        this.sourceImage.onload = () => this.render();
        this.sourceImage.onerror = () => this.tryLoadImage(sources, index + 1);
        this.sourceImage.src = sources[index];
    }
    
    createFallbackImage() {
        // Create a canvas-based fallback image
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        // Draw a simple portrait
        ctx.fillStyle = '#f0e68c';
        ctx.fillRect(0, 0, 300, 300);
        
        // Face
        ctx.fillStyle = '#daa520';
        ctx.beginPath();
        ctx.arc(150, 120, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(130, 110, 5, 0, Math.PI * 2);
        ctx.arc(170, 110, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(150, 140, 15, 0, Math.PI);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#8b4513';
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('Van Gogh Portrait', 150, 200);
        
        this.sourceImage.src = canvas.toDataURL();
    }
    
    render() {
        this.renderSource();
        this.renderPinhole();
        this.renderProjection();
        this.renderRays();
    }
    
    renderSource() {
        const canvas = this.sourceCanvas;
        const ctx = this.sourceCtx;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.sourceImage.complete && this.sourceImage.width > 0) {
            const scale = Math.min(canvas.width / this.sourceImage.width, canvas.height / this.sourceImage.height) * 0.9;
            const width = this.sourceImage.width * scale;
            const height = this.sourceImage.height * scale;
            const x = (canvas.width - width) / 2;
            const y = (canvas.height - height) / 2;
            
            ctx.drawImage(this.sourceImage, x, y, width, height);
            
            // Store image data for color sampling
            this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            this.imageRect = { x, y, width, height };
            
            // Add grid points to show ray origins
            this.drawRayOriginPoints(ctx, x, y, width, height);
        } else {
            // Show loading message
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Loading image...', canvas.width / 2, canvas.height / 2);
        }
    }
    
    drawRayOriginPoints(ctx, imgX, imgY, imgWidth, imgHeight) {
        const gridSize = Math.min(imgWidth, imgHeight) / 8;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < this.rayCount && i < 20; i++) {
            const x = imgX + Math.random() * imgWidth;
            const y = imgY + Math.random() * imgHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }
    
    renderPinhole() {
        const canvas = this.pinholeCanvas;
        const ctx = this.pinholeCtx;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const apertureHeight = this.pinholeSize;
        const wallThickness = 20; // Much thinner wall!
        const wallLeft = centerX - wallThickness / 2;
        const wallRight = centerX + wallThickness / 2;
        
        // Draw the thin camera barrier/wall with gradient
        const gradient = ctx.createLinearGradient(wallLeft, 0, wallRight, 0);
        gradient.addColorStop(0, '#111');
        gradient.addColorStop(0.5, '#333');
        gradient.addColorStop(1, '#111');
        
        ctx.fillStyle = gradient;
        // Top part of wall
        ctx.fillRect(wallLeft, 0, wallThickness, centerY - apertureHeight / 2);
        // Bottom part of wall
        ctx.fillRect(wallLeft, centerY + apertureHeight / 2, wallThickness, canvas.height - (centerY + apertureHeight / 2));
        
        // Draw metallic edge details on the thin wall
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Left edge
        ctx.moveTo(wallLeft, 0);
        ctx.lineTo(wallLeft, canvas.height);
        // Right edge
        ctx.moveTo(wallRight, 0);
        ctx.lineTo(wallRight, canvas.height);
        // Aperture edges
        ctx.moveTo(wallLeft, centerY - apertureHeight / 2);
        ctx.lineTo(wallRight, centerY - apertureHeight / 2);
        ctx.moveTo(wallLeft, centerY + apertureHeight / 2);
        ctx.lineTo(wallRight, centerY + apertureHeight / 2);
        ctx.stroke();
        
        // Draw the bright pinhole opening
        const openingGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, apertureHeight);
        openingGradient.addColorStop(0, '#fff');
        openingGradient.addColorStop(0.7, '#f8f8f8');
        openingGradient.addColorStop(1, '#e0e0e0');
        
        ctx.fillStyle = openingGradient;
        ctx.fillRect(wallLeft, centerY - apertureHeight / 2, wallThickness, apertureHeight);
        
        // Add aperture size indicator
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Ø ${this.pinholeSize.toFixed(1)}`, centerX, centerY + apertureHeight + 20);
        
        // Add "PINHOLE" label
        ctx.fillStyle = '#999';
        ctx.font = '8px Arial';
        ctx.fillText('PINHOLE', centerX, centerY - apertureHeight - 10);
    }
    
    renderProjection() {
        const canvas = this.projectionCanvas;
        const ctx = this.projectionCtx;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.sourceImage.complete && this.sourceImage.width > 0) {
            // Draw the inverted image
            const scale = Math.min(canvas.width / this.sourceImage.width, canvas.height / this.sourceImage.height) * 0.8;
            const width = this.sourceImage.width * scale;
            const height = this.sourceImage.height * scale;
            const x = (canvas.width - width) / 2;
            const y = (canvas.height - height) / 2;
            
            // Add a subtle background to show the projection screen
            ctx.fillStyle = '#f8f8f8';
            ctx.fillRect(x - 10, y - 10, width + 20, height + 20);
            ctx.strokeStyle = '#ddd';
            ctx.strokeRect(x - 10, y - 10, width + 20, height + 20);
            
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(-1, -1); // Flip both horizontally and vertically
            
            // Apply slight blur based on pinhole size
            if (this.pinholeSize > 5) {
                ctx.filter = `blur(${(this.pinholeSize - 5) * 0.5}px)`;
            }
            
            ctx.drawImage(this.sourceImage, -width/2, -height/2, width, height);
            ctx.restore();
            
            // Add blur circles based on pinhole size
            this.renderBlurCircles(canvas, ctx, x, y, width, height);
            
            // Add label
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Inverted & Flipped', canvas.width / 2, y + height + 30);
        } else {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Projection will appear here', canvas.width / 2, canvas.height / 2);
        }
    }
    
    renderBlurCircles(canvas, ctx, imageX, imageY, imageWidth, imageHeight) {
        if (this.pinholeSize <= 3) return; // Don't show blur for small pinholes
        
        const blurRadius = (this.pinholeSize - 3) * 3;
        const circleCount = Math.min(this.rayCount / 10, 15);
        const alpha = Math.max(0.1, 0.4 / this.pinholeSize);
        
        ctx.strokeStyle = `rgba(255, 100, 100, ${alpha})`;
        ctx.lineWidth = 1;
        
        for (let i = 0; i < circleCount; i++) {
            const x = imageX + Math.random() * imageWidth;
            const y = imageY + Math.random() * imageHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, blurRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    renderRays() {
        const sourceCanvas = this.sourceCanvas;
        const pinholeCanvas = this.pinholeCanvas;
        const projectionCanvas = this.projectionCanvas;
        
        // Clear the ray layer (we'll draw on all three canvases)
        const allCanvases = [sourceCanvas, pinholeCanvas, projectionCanvas];
        
        // Calculate positions
        const sourceRect = sourceCanvas.getBoundingClientRect();
        const pinholeRect = pinholeCanvas.getBoundingClientRect();
        const projectionRect = projectionCanvas.getBoundingClientRect();
        
        // We'll draw rays by creating a temporary overlay
        this.drawRaysOverlay();
    }
    
    getPixelColor(x, y) {
        if (!this.imageData) return 'rgba(255, 255, 255, 0.7)';
        
        const index = (Math.floor(y) * this.imageData.width + Math.floor(x)) * 4;
        const r = this.imageData.data[index];
        const g = this.imageData.data[index + 1];
        const b = this.imageData.data[index + 2];
        const a = this.imageData.data[index + 3] / 255;
        
        return `rgba(${r}, ${g}, ${b}, ${Math.min(a * 0.8, 0.8)})`;
    }
    
    drawRaysOverlay() {
        if (!this.imageData || !this.imageRect) return;
        
        // Remove existing overlay
        const existingOverlay = document.querySelector('.ray-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Create new overlay
        const overlay = document.createElement('canvas');
        overlay.className = 'ray-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '10';
        
        const container = document.querySelector('.simulation-area');
        const containerRect = container.getBoundingClientRect();
        
        overlay.width = containerRect.width;
        overlay.height = containerRect.height;
        
        container.style.position = 'relative';
        container.appendChild(overlay);
        
        const ctx = overlay.getContext('2d');
        
        // Calculate canvas positions within the container
        const sourceCanvas = this.sourceCanvas;
        const pinholeCanvas = this.pinholeCanvas;
        const projectionCanvas = this.projectionCanvas;
        
        const sourceRect = sourceCanvas.getBoundingClientRect();
        const pinholeRect = pinholeCanvas.getBoundingClientRect();
        const projectionRect = projectionCanvas.getBoundingClientRect();
        
        const sourceX = sourceRect.left - containerRect.left;
        const sourceY = sourceRect.top - containerRect.top;
        const pinholeX = pinholeRect.left - containerRect.left + pinholeRect.width / 2;
        const pinholeY = pinholeRect.top - containerRect.top + pinholeRect.height / 2;
        const projectionX = projectionRect.left - containerRect.left;
        const projectionY = projectionRect.top - containerRect.top;
        
        // Draw light cones with colors sampled from the image
        for (let i = 0; i < this.rayCount; i++) {
            // Random point on source image
            const startX = sourceX + this.imageRect.x + Math.random() * this.imageRect.width;
            const startY = sourceY + this.imageRect.y + Math.random() * this.imageRect.height;
            
            // Sample color from the image at this point
            const color = this.getPixelColor(startX - sourceX, startY - sourceY);
            
            // Create light cone through pinhole
            const coneAngle = this.pinholeSize / 100; // Cone spread based on pinhole size
            const numConeRays = 5; // Number of rays per cone
            
            for (let j = 0; j < numConeRays; j++) {
                const angleOffset = (j - numConeRays/2) * coneAngle;
                
                // Through pinhole with cone spread
                const middleX = pinholeX + angleOffset * 20;
                const middleY = pinholeY + (Math.random() - 0.5) * this.pinholeSize;
                
                // Simplified educational ray mapping:
                // X: Direct mapping (left source → left projection)  
                // Y: Inverted through pinhole (top source → bottom projection)
                
                // Map X coordinate directly to projection area
                const sourceImageRect = this.imageRect || { x: 0, y: 0, width: 300, height: 300 };
                const sourceRelativeX = (startX - sourceX - sourceImageRect.x) / sourceImageRect.width;
                const projectionWidth = projectionCanvas.width * 0.8; // Use most of projection area
                const projectionMarginX = projectionX + projectionCanvas.width * 0.1; // Small margin
                const finalEndX = projectionMarginX + sourceRelativeX * projectionWidth;
                
                // Calculate Y inversion through pinhole geometry
                // Ray from startY through pinholeY should project to inverted position
                const sourceRelativeY = (startY - sourceY - sourceImageRect.y) / sourceImageRect.height;
                const projectionCenterY = projectionY + projectionCanvas.height * 0.5;
                const projectionHeight = projectionCanvas.height * 0.8;
                
                // Invert Y: 0 → 1, 1 → 0 (top becomes bottom)
                const invertedY = 1 - sourceRelativeY;
                const finalEndY = projectionCenterY - projectionHeight * 0.5 + invertedY * projectionHeight;
                
                // Draw cone ray with sampled color
                ctx.strokeStyle = color;
                ctx.lineWidth = j === Math.floor(numConeRays/2) ? 2 : 1;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(middleX, middleY);
                ctx.lineTo(finalEndX, finalEndY);
                ctx.stroke();
                
                // Draw projection circle (2D, not 1D line)
                if (j === Math.floor(numConeRays/2)) { // Only for center ray
                    const circleRadius = this.pinholeSize * 2;
                    ctx.fillStyle = color.replace(/[\d\.]+\)$/g, '0.3)');
                    ctx.beginPath();
                    ctx.arc(finalEndX, finalEndY, circleRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Draw source point with sampled color
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(startX, startY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Initialize the simulation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PinholeCamera();
});