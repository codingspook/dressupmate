# GitHub Copilot Instructions

## Project Overview
DressUpMate is a Next.js application using the Pages Router architecture that helps users manage their digital wardrobe. The app allows organizing clothing items, suggests outfits, and provides weather-based recommendations.

## Key Features
- Digital wardrobe organization
- Outfit suggestions based on clothing inventory
- Category management for clothing items
- Weather-based outfit recommendations

## Code Structure
The app follows Next.js Pages Router conventions:

- `/pages` - Contains all route components
    - `/_app.tsx` - Custom App component
    - `/categories.tsx` - Category management page
    - `/closet.tsx` - Main wardrobe management page
    - `/settings.tsx` - User settings page

## Development Guidelines
When contributing to this project:

MOST IMPORTANT: DON'T BE LAZY! NEVER LEAVE `...other code...` IN THE CODEBASE!

1. Follow Next.js Pages Router patterns and conventions
2. Use the existing components from `/components` directory
3. Maintain consistent state management patterns
4. Follow the established routing structure
5. Keep components modular and reusable
6. Try always to write files inside the correct directory

## Relevant Information for GitHub Copilot
- Framework: Next.js with Pages Router
- Main purpose: Digital wardrobe management
- Core functionality: Managing clothing items and categories
- Key routes: categories, closet, settings