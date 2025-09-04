import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import NotebookOverlay from './components/NotebookOverlay';
import './styles/App.css';

// Test names for writing animation
const TEST_NAMES = [
  "Light Yagami",
  "L Lawliet",
  "Ryuk",
  "Misa Amane",
  "Near",
  "Mello",
  "Soichiro Yagami",
  "Teru Mikami",
  "Kiyomi Takada"
];

const SOCKET_SERVER = process.env.REACT_APP_SOCKET_SERVER || 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [newSubscriber, setNewSubscriber] = useState(null);
  const [subscriberKey, setSubscriberKey] = useState(0); // Add a key to force re-render
  const socketInitialized = useRef(false);
  
  // Function to test writing animation with multiple names to test erase functionality
  const testWritingAnimation = () => {
    // Select 6 random names to fill more than one page and test erase functionality
    const selectedNames = [];
    for (let i = 0; i < 6; i++) {
      const randomName = TEST_NAMES[Math.floor(Math.random() * TEST_NAMES.length)];
      selectedNames.push(randomName);
    }
    const multipleNames = selectedNames.join('\n');
    console.log('Testing writing animation with multiple names:', multipleNames);
    setNewSubscriber(multipleNames);
    setSubscriberKey(prevKey => prevKey + 1); // Increment key to force re-render
  };

  // Function to test with many entries to trigger erase functionality
  const testEraseAnimation = () => {
    // Select 16 random names to fill both pages completely and trigger erase
    const selectedNames = [];
    for (let i = 0; i < 16; i++) {
      const randomName = TEST_NAMES[Math.floor(Math.random() * TEST_NAMES.length)];
      selectedNames.push(randomName);
    }
    const manyNames = selectedNames.join('\n');
    console.log('Testing erase functionality with many names:', manyNames);
    setNewSubscriber(manyNames);
    setSubscriberKey(prevKey => prevKey + 1); // Increment key to force re-render
  };

  // Initialize socket connection
  useEffect(() => {
    if (!socketInitialized.current) {
      console.log('Initializing socket connection to:', SOCKET_SERVER);
      const newSocket = io(SOCKET_SERVER);
      
      newSocket.on('connect', () => {
        console.log('Connected to server with ID:', newSocket.id);
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
      
      newSocket.on('new_subscriber', (data) => {
        console.log('New subscriber received from socket:', data);
        setNewSubscriber(data.username);
        setSubscriberKey(prevKey => prevKey + 1); // Increment key to force re-render
      });
      
      setSocket(newSocket);
      socketInitialized.current = true;
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, []); // No dependencies needed
  
  return (
    <div className="app">
      <NotebookOverlay 
        key={subscriberKey} 
        newSubscriber={newSubscriber} 
      />
      <button 
        className="test-button" 
        onClick={testWritingAnimation}
      >
        Test Writing (6 names)
      </button>
      <button 
        className="test-button" 
        onClick={testEraseAnimation}
        style={{ marginLeft: '10px' }}
      >
        Test Erase (16 names)
      </button>
    </div>
  );
}

export default App;