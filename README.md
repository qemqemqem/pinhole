# Pinhole Camera Simulation

An interactive demonstration of pinhole camera optics using HTML5 Canvas and JavaScript.

## Features

- **Interactive Pinhole Size**: Adjust the aperture size to see how it affects image sharpness and brightness
- **Ray Visualization**: Control the number of light rays to understand the physics
- **Real Image Inversion**: See how light travels in straight lines through the pinhole to create an inverted image
- **Blur Visualization**: Circles show the blur effect caused by larger pinhole sizes

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