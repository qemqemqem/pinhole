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
        
        this.setupControls();
        this.loadSourceImage();
    }
    
    setupControls() {
        const pinholeSlider = document.getElementById('pinholeSize');
        const raySlider = document.getElementById('rayCount');
        const pinholeSizeValue = document.getElementById('pinholeSizeValue');
        const rayCountValue = document.getElementById('rayCountValue');
        
        pinholeSlider.addEventListener('input', (e) => {
            this.pinholeSize = parseFloat(e.target.value);
            pinholeSizeValue.textContent = this.pinholeSize.toFixed(1);
            this.render();
        });
        
        raySlider.addEventListener('input', (e) => {
            this.rayCount = parseInt(e.target.value);
            rayCountValue.textContent = this.rayCount;
            this.render();
        });
    }
    
    loadSourceImage() {
        this.sourceImage.src = 'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/self-portrait-i-by-vincent-van-gogh-1887-m-g-whittingham.jpg';
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
        
        if (this.sourceImage.complete) {
            const scale = Math.min(canvas.width / this.sourceImage.width, canvas.height / this.sourceImage.height);
            const width = this.sourceImage.width * scale;
            const height = this.sourceImage.height * scale;
            const x = (canvas.width - width) / 2;
            const y = (canvas.height - height) / 2;
            
            ctx.drawImage(this.sourceImage, x, y, width, height);
        }
    }
    
    renderPinhole() {
        const canvas = this.pinholeCanvas;
        const ctx = this.pinholeCtx;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the pinhole aperture
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw the barrier (dark areas above and below pinhole)
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, centerY - this.pinholeSize / 2);
        ctx.fillRect(0, centerY + this.pinholeSize / 2, canvas.width, centerY - this.pinholeSize / 2);
        
        // Draw the pinhole opening
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, centerY - this.pinholeSize / 2, canvas.width, this.pinholeSize);
        
        // Add some visual elements to show it's a pinhole
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX - 20, centerY - this.pinholeSize / 2);
        ctx.lineTo(centerX + 20, centerY - this.pinholeSize / 2);
        ctx.moveTo(centerX - 20, centerY + this.pinholeSize / 2);
        ctx.lineTo(centerX + 20, centerY + this.pinholeSize / 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    renderProjection() {
        const canvas = this.projectionCanvas;
        const ctx = this.projectionCtx;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.sourceImage.complete) {
            // Draw the inverted image
            const scale = Math.min(canvas.width / this.sourceImage.width, canvas.height / this.sourceImage.height) * 0.8;
            const width = this.sourceImage.width * scale;
            const height = this.sourceImage.height * scale;
            const x = (canvas.width - width) / 2;
            const y = (canvas.height - height) / 2;
            
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(-1, -1); // Flip both horizontally and vertically
            ctx.drawImage(this.sourceImage, -width/2, -height/2, width, height);
            ctx.restore();
            
            // Add blur circles based on pinhole size
            this.renderBlurCircles(canvas, ctx, x, y, width, height);
        }
    }
    
    renderBlurCircles(canvas, ctx, imageX, imageY, imageWidth, imageHeight) {
        const blurRadius = this.pinholeSize * 2;
        const circleCount = Math.min(this.rayCount / 5, 20);
        
        ctx.strokeStyle = `rgba(255, 100, 100, ${0.3 / Math.sqrt(this.pinholeSize)})`;
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
    
    drawRaysOverlay() {
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
        
        // Draw rays
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < this.rayCount; i++) {
            // Random point on source image
            const startX = sourceX + Math.random() * sourceCanvas.width;
            const startY = sourceY + Math.random() * sourceCanvas.height;
            
            // Through pinhole
            const middleX = pinholeX;
            const middleY = pinholeY + (Math.random() - 0.5) * this.pinholeSize;
            
            // To projection (calculate where the ray would hit)
            const direction = {
                x: middleX - startX,
                y: middleY - startY
            };
            
            // Extend the ray to the projection surface
            const distance = (projectionX + projectionCanvas.width / 2) - middleX;
            const slope = direction.y / direction.x;
            const endX = middleX + distance;
            const endY = middleY + slope * distance;
            
            // Draw the ray
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(middleX, middleY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }
}

// Initialize the simulation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PinholeCamera();
});