# Pinhole Camera Simulation

**🔬 [Try the Interactive Simulation](https://qemqemqem.github.io/pinhole/) 🔬**

An interactive demonstration of pinhole camera optics using HTML5 Canvas and JavaScript with scientifically accurate ray tracing and quasirandom point sampling.

## Features

- **🎚️ Interactive Controls**: Adjust pinhole size (1-20) and ray count (10-1000) with smooth sliders
- **🌈 Colorful Ray Tracing**: See actual colors from source image propagate through light rays
- **🎲 Quasirandom Sampling**: Uses Halton sequences for optimal ray distribution (no clustering)
- **👻 Transparent Rays**: Subtle ray lines with opaque endpoints show image formation clearly
- **🖼️ Projection Toggle**: Hide/show background image to see rays forming the projection
- **📐 Educational Mapping**: X-direct, Y-inverted rays for clear physics demonstration
- **🔍 Precise Pinhole**: Thin aperture with horizontal edge bars for clear visualization

## How It Works

This simulation demonstrates the fundamental principles of pinhole cameras:

1. **Light rays** from each point on the source object travel in straight lines
2. They pass through the **small pinhole aperture**
3. The rays continue to the **projection surface** where they form an inverted image
4. **Smaller pinholes** create sharper but dimmer images
5. **Larger pinholes** create brighter but blurrier images due to multiple light paths

## Physics Concepts Demonstrated

- **Rectilinear propagation of light** - light travels in straight lines
- **Image inversion** - both vertical and horizontal flipping through a pinhole
- **Trade-off between sharpness and brightness** - the fundamental limitation of pinhole cameras
- **Geometric optics** - ray tracing through an aperture

## Usage

Simply open the webpage and experiment with the controls:
- Use the **Pinhole Size** slider to change the aperture
- Use the **Number of Rays** slider to control the visualization density

The simulation uses Vincent van Gogh's self-portrait as the source image to demonstrate the optical principles clearly.

## Technical Implementation

- Pure HTML5, CSS3, and JavaScript
- Canvas-based rendering for all three panels
- Real-time ray tracing calculations
- Cross-origin image handling for the source image
- Responsive design that works on different screen sizes

Perfect for educational purposes, physics demonstrations, or anyone curious about camera optics!

## Credits

This code was entirely written by **Claude Code** (Anthropic's AI coding assistant), with help and inspiration from [qemqemqem](https://github.com/qemqemqem).