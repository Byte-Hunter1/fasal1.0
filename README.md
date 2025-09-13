# Krishi Gyan Hub - Smart Crop Advisor for Indian Farmers

## Project Overview

Krishi Gyan Hub (FASAL) is a smart crop advisory application designed specifically for Indian farmers. The application provides personalized crop recommendations based on location, soil conditions, and weather data to help farmers make informed decisions about their crops.

## Features

- **Personalized Crop Recommendations**: Get AI-powered crop suggestions based on your location and farm conditions
- **Weather Forecasts**: Access local weather data relevant to farming decisions
- **Soil Analysis**: View soil quality information for better crop planning
- **Bilingual Support**: Available in English and Hindi
- **Profit Optimization**: Recommendations include expected ROI and market prices

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with Shadcn UI components
- **State Management**: React Context API
- **Backend**: Supabase Functions
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <REPOSITORY_URL>

# Navigate to the project directory
cd krishi-gyan-hub

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Project Structure

- `/src/components`: UI components including weather and soil widgets
- `/src/contexts`: Context providers including language context
- `/src/pages`: Main application pages
- `/src/data`: Mock data and utilities
- `/src/integrations`: External service integrations (Supabase)
- `/supabase/functions`: Serverless functions for data processing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4e629cdc-f38a-4ab2-abed-9a3e92961c21) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
