# Death Note Stream Overlay

A dynamic, responsive, web-based stream overlay using React with a Node.js and Express backend. This overlay synchronizes the animation of a writing hand with dynamically rendered text on a notebook background, perfect for use as a Browser Source in OBS.

## Features

- Real-time subscriber name animations
- Responsive design that works with any OBS source size
- Synchronized hand movement and text writing animation
- WebSocket communication for instant updates
- YouTube API webhook integration

## Project Structure

```
├── client/                 # React frontend
│   ├── public/             # Public assets
│   └── src/                # Source code
│       ├── assets/         # Images and media
│       ├── components/     # React components
│       └── styles/         # CSS styles
└── server/                 # Node.js backend
    └── src/                # Source code
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OBS Studio

### Installation

1. Clone this repository

2. Install dependencies for both client and server:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Configure environment variables:
   - Server: Create/edit `.env` file in the server directory
   - Client: Create/edit `.env` file in the client directory

4. Start the development servers:

```bash
# Start the backend server
cd server
npm run dev

# In a separate terminal, start the frontend
cd client
npm start
```

## OBS Integration Guide

### Adding as a Browser Source

1. Open OBS Studio
2. In your scene, click the "+" button under Sources
3. Select "Browser" from the list
4. Name your source (e.g., "Death Note Overlay")
5. Configure the Browser Source:
   - URL: `http://localhost:3000` (or your deployed URL)
   - Width: Match your canvas width (e.g., 1920)
   - Height: Match your canvas height (e.g., 1080)
   - Check "Shutdown source when not visible"
   - Check "Refresh browser when scene becomes active"

### Positioning and Sizing

- The overlay is designed to be responsive and will adapt to any size
- You can resize the Browser Source in OBS to fit your scene layout
- The notebook and hand animations will automatically scale proportionally

### Testing the Overlay

You can test the overlay by sending a POST request to the test endpoint:

```bash
curl -X POST http://localhost:5000/api/test-subscriber \
  -H "Content-Type: application/json" \
  -d '{"username":"TestUser123"}'
```

This will simulate a new subscriber event and trigger the animation.

## YouTube API Integration

To receive real-time subscriber notifications:

1. Set up YouTube API credentials in Google Developer Console
2. Configure a webhook in YouTube's API settings pointing to your server:
   - Webhook URL: `https://your-server.com/api/webhook`
   - Events to subscribe to: `subscriptions`
3. Ensure your server is publicly accessible (use ngrok for testing)

## Customization

- **Background Image**: Replace `background.webp` in the assets folder
- **Hand Images**: Replace `Handresting.png` and `Handwriting.png` in the assets folder
- **Font**: Change the font in `index.css` and `NotebookOverlay.css`
- **Animation Speed**: Adjust duration values in the GSAP animations in `NotebookOverlay.js`
- **Text Appearance**: Modify the CSS in `NotebookOverlay.css`

## Troubleshooting

- **No animation appears**: Check browser console for errors and ensure WebSocket connection is established
- **Hand position is incorrect**: Adjust the positioning values in `NotebookOverlay.js`
- **Text doesn't appear**: Verify the writable area coordinates match your background image
- **Server connection fails**: Check that the server is running and the client is pointing to the correct URL