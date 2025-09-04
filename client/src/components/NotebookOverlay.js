import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import handRestingImage from '../assets/Handresting.png';
import handWritingImage from '../assets/Handwriting.png';
import Notebook from './Notebook';
import '../styles/NotebookOverlay.css';
import '../styles/Notebook.css';

// Register TextPlugin with GSAP
gsap.registerPlugin(TextPlugin);
console.log('GSAP and TextPlugin loaded:', gsap.version, TextPlugin);

const NotebookOverlay = ({ newSubscriber }) => {
  const overlayRef = useRef(null);
  const handRef = useRef(null);
  const handContainerRef = useRef(null);
  const notebookRef = useRef(null);
  const textContainerRef = useRef(null);
  
  // State to track current line and animation status
  const [currentLine, setCurrentLine] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  
  // Constants for notebook layout
  const maxLinesPerPage = 7; // Maximum lines per page (matches Notebook component)
  
  // Define pen offset for alignment with text
  const penOffset = { x: -24, y: -4 }; // Offset for pen tip position relative to text (in %) - negative values move hand right and down
  
  // Get line position from the line div element and text wrapper bounds
  const getLinePosition = (lineNumber) => {
    // Determine which page to use based on line number
    // Left page: lines 0-6, Right page: lines 7-13
    const maxLinesPerPage = 7;
    const pageSide = lineNumber < maxLinesPerPage ? 'left' : 'right';
    const lineIndexInPage = lineNumber % maxLinesPerPage;
    
    // Calculate the actual data-line-index used by Notebook component
    const actualLineIndex = pageSide === 'left' ? lineIndexInPage : lineIndexInPage + maxLinesPerPage;
    
    // Get the line element
    const lineElement = textContainerRef.current?.querySelector(`[data-page="${pageSide}"][data-line-index="${actualLineIndex}"]`);
    
    if (!lineElement) {
      console.error(`Line element for ${pageSide} page, line ${lineIndexInPage}, actual index ${actualLineIndex} not found`);
      return { textWrapperRect: null, overlayRect: null, penStartX: 0, penStartY: 0, penEndX: 0, penEndY: 0, page: pageSide };
    }
    
    // Get the text wrapper element within the line
    const textWrapper = lineElement.querySelector('.text-wrapper');
    if (!textWrapper) {
      console.error(`Text wrapper not found for line ${lineNumber}`);
      return { textWrapperRect: null, overlayRect: null, penStartX: 0, penStartY: 0, penEndX: 0, penEndY: 0, page: pageSide };
    }
    
    // Get bounding rectangles
    const textWrapperRect = textWrapper.getBoundingClientRect();
    const overlayRect = overlayRef.current.getBoundingClientRect();
    
    // Calculate position relative to overlay container (for absolute positioning)
    const relativeLeft = textWrapperRect.left - overlayRect.left;
    const relativeTop = textWrapperRect.top - overlayRect.top;
    const relativeRight = relativeLeft + textWrapperRect.width;
    const relativeBottom = relativeTop + textWrapperRect.height;
    
    // Convert to percentages for consistent positioning
    const leftPercent = (relativeLeft / overlayRect.width) * 100;
    const topPercent = (relativeTop / overlayRect.height) * 100;
    const rightPercent = (relativeRight / overlayRect.width) * 100;
    const bottomPercent = (relativeBottom / overlayRect.height) * 100;
    
    const pageName = pageSide;
    
    return {
      page: pageName,
      textWrapperRect,
      overlayRect,
      // Pen positions aligned with text wrapper bounds
      penStartX: leftPercent,
      penStartY: topPercent + ((bottomPercent - topPercent) / 2), // Center vertically
      penEndX: rightPercent,
      penEndY: topPercent + ((bottomPercent - topPercent) / 2), // Center vertically
      // Raw pixel coordinates for precise positioning
      rawLeft: relativeLeft,
      rawTop: relativeTop,
      rawRight: relativeRight,
      rawBottom: relativeBottom
    };
  };
  
  // Handle new subscriber
  useEffect(() => {
    if (newSubscriber) {
      console.log('NotebookOverlay received new subscriber:', newSubscriber);
      // Check if it's multi-line input
      if (newSubscriber.includes('\n')) {
        // For multi-line, split and add all to queue
        const lines = newSubscriber.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        console.log(`Adding ${lines.length} lines to queue:`, lines);
        setSubscribers(prev => [...prev, ...lines]);
      } else {
        // For single line, add to queue
        console.log('Adding single line to queue:', newSubscriber);
        setSubscribers(prev => [...prev, newSubscriber]);
      }
    }
  }, [newSubscriber]);
  
  // Process subscriber queue
  useEffect(() => {
    // Process the queue when there are subscribers and not currently animating
    if (subscribers.length > 0 && !isAnimating) {
      console.log('Processing subscriber from queue:', subscribers[0]);
      const nextSubscriber = subscribers[0];
      
      // Find the next available empty line
      const nextLine = findNextEmptyLine();
      console.log(`Moving to next empty line: ${nextLine}`);
      setCurrentLine(nextLine);
      
      // Process after a short delay to allow line state to update
      setTimeout(() => {
        animateWritingRef.current(nextSubscriber);
        setSubscribers(prev => prev.slice(1));
      }, 100);
    }
  }, [subscribers, isAnimating, maxLinesPerPage]);
  
  // Animation function - using useRef to keep a stable reference to the function
  const animateWritingRef = useRef((username) => {});
  
  // Update the animation function reference when dependencies change
  useEffect(() => {
    animateWritingRef.current = (username) => {
      console.log('Starting animation for:', username);
      console.log('Current line:', currentLine);
      
      setIsAnimating(true);
      
      // Determine which page to use based on line number
      const maxLinesPerPage = 7;
      const page = currentLine < maxLinesPerPage ? 'left' : 'right';
      const lineIndexInPage = currentLine % maxLinesPerPage;
      
      // Calculate the actual data-line-index used by Notebook component
      // Left page: 0-6, Right page: 7-13 (index + maxLinesPerPage)
      const actualLineIndex = page === 'left' ? lineIndexInPage : lineIndexInPage + maxLinesPerPage;
      
      // Get the line container for this line
      console.log(`Looking for line container for ${page} page, line ${lineIndexInPage}, actual index ${actualLineIndex}`);
      let lineContainer = textContainerRef.current.querySelector(`[data-page="${page}"][data-line-index="${actualLineIndex}"]`);
      
      if (!lineContainer) {
        console.error(`Line container for ${page} page, line ${lineIndexInPage}, actual index ${actualLineIndex} not found`);
        setIsAnimating(false);
        return;
      }
      
      // Check if this line already has content - if so, skip writing
      const existingContent = lineContainer.querySelector('.line-content');
      if (existingContent && existingContent.textContent.trim().length > 0) {
        console.log(`Line ${currentLine} already has content: "${existingContent.textContent.trim()}", skipping animation`);
        setIsAnimating(false);
        return;
      }
      
      // Create a single text wrapper for this line
      const existingWrapper = lineContainer.querySelector('.text-wrapper');
      if (!existingWrapper) {
        const newTextWrapper = document.createElement('div');
        newTextWrapper.className = 'text-wrapper';
        newTextWrapper.style.cssText = 'display: inline-block; position: relative;';
        
        const newTextElement = document.createElement('div');
        newTextElement.className = 'line-content';
        newTextWrapper.appendChild(newTextElement);
        lineContainer.appendChild(newTextWrapper);
      }
      
      // Use the existing or new text element for animation
      const textElement = lineContainer.querySelector('.line-content');
      
      console.log(`Found line content element for ${page} page, line ${lineIndexInPage}, actual index ${actualLineIndex}`);
      
      // Get hand elements and position
      const handResting = handRef.current.querySelector('.hand-resting');
      const handWriting = handRef.current.querySelector('.hand-writing');
      const position = getLinePosition(currentLine);
      
      // Start writing animation
      startWritingAnimation(textElement, username, position);
    };
  }, [currentLine]);
  
  // Simplified writing animation
  const startWritingAnimation = (textElement, username, position) => {
    console.log('Starting writing animation for:', username);
    
    const handResting = handRef.current?.querySelector('.hand-resting');
    const handWriting = handRef.current?.querySelector('.hand-writing');
    
    if (!handResting || !handWriting) {
      console.error('Hand elements not found');
      return;
    }
    
    // Move hand to starting position using text wrapper bounds
    gsap.to(handRef.current, {
      duration: 0.8,
      right: `${100 - position.penStartX}%`,
      bottom: `${100 - position.penStartY}%`,
      rotation: 0,
      ease: 'power2.inOut',
      onComplete: () => {
        // Switch to writing hand
        gsap.to(handResting, { opacity: 0, duration: 0.3 });
        gsap.to(handWriting, { opacity: 1, duration: 0.3 });
        
        // Start typing characters
        const chars = username.split('');
        let currentText = '';
        const charDuration = 200; // ms per character
        
        const typeNextChar = (index) => {
          if (index >= chars.length) {
            // Writing complete, start cutting animation
            setTimeout(() => startCuttingAnimation(textElement, username), 500);
            return;
          }
          
          // Add character to text
          currentText += chars[index];
          textElement.textContent = currentText;
          
          // Calculate hand position based on actual text width
          // Create a temporary span to measure text width
          const tempSpan = document.createElement('span');
          tempSpan.style.cssText = `
            position: absolute;
            visibility: hidden;
            font-family: 'Caveat', cursive;
            font-size: 4vh;
            letter-spacing: 0.5px;
            white-space: nowrap;
            transform: rotate(-0.5deg);
          `;
          tempSpan.textContent = currentText;
          document.body.appendChild(tempSpan);
          
          // Get the width of the current text
          const textWidth = tempSpan.getBoundingClientRect().width;
          document.body.removeChild(tempSpan);
          
          // Calculate hand position relative to text wrapper
           const textWrapper = textElement.parentElement;
           if (textWrapper && overlayRef.current) {
             const textWrapperRect = textWrapper.getBoundingClientRect();
             const overlayRect = overlayRef.current.getBoundingClientRect();
             
             // Calculate the position where the hand should be (at the end of the text)
             // Add a small offset to move the hand slightly to the right for better alignment
             const handPixelX = (textWrapperRect.left - overlayRect.left) + textWidth + 8;
             const handPercentX = (handPixelX / overlayRect.width) * 100;
             
             gsap.to(handRef.current, {
               duration: charDuration / 1000,
               right: `${100 - handPercentX}%`,
               rotation: -1 + (Math.random() * 2), // Small random rotation
               ease: 'power2.out'
             });
           }
          
          // Schedule next character
          setTimeout(() => typeNextChar(index + 1), charDuration);
        };
        
        typeNextChar(0);
      }
    });
  };
  
  // Function to return hand to resting position
  const returnHandToRest = () => {
    const handResting = handRef.current?.querySelector('.hand-resting');
    const handWriting = handRef.current?.querySelector('.hand-writing');
    
    if (handResting && handWriting) {
      gsap.to(handWriting, { opacity: 0, duration: 0.2 });
      gsap.to(handResting, { opacity: 1, duration: 0.2 });
      
      gsap.to(handRef.current, {
        duration: 1.0,
        right: '75%',
        bottom: '70%',
        rotation: 0,
        ease: 'power2.inOut',
        onComplete: () => {
          setIsAnimating(false);
        }
      });
    }
  };
  
  // Simplified cutting animation
  const startCuttingAnimation = (textElement, username) => {
    console.log('Starting cutting animation for:', username);
    console.log('Text element:', textElement);
    console.log('Text element parent:', textElement.parentElement);
    
    // The text element's parent IS the text-wrapper
    const textWrapper = textElement.parentElement;
    console.log('Text wrapper found:', textWrapper);
    if (!textWrapper || !textWrapper.classList.contains('text-wrapper')) {
      console.error('Text wrapper not found or invalid');
      console.log('Parent element HTML:', textElement.parentElement.innerHTML);
      returnHandToRest();
      return;
    }
    
    // Calculate cutting positions - start from right side of text
    const position = getLinePosition(currentLine);
    const cuttingStartX = position.penEndX; // Start from end of text (right side)
    const cuttingEndX = position.penStartX; // End at start of text (left side)
    const cuttingY = position.penStartY;
    
    // Move hand to cutting start position (right side of text)
    gsap.to(handRef.current, {
      duration: 0.6,
      right: `${100 - cuttingStartX}%`,
      bottom: `${100 - cuttingY}%`,
      rotation: 10,
      ease: 'power2.inOut',
      onComplete: () => {
        // Create strikethrough line
        let strikethrough = textWrapper.querySelector('.strikethrough-line');
        if (!strikethrough) {
          strikethrough = document.createElement('div');
          strikethrough.className = 'strikethrough-line';
          strikethrough.style.cssText = `
            position: absolute;
            height: 2px;
            background: #ff0000;
            top: 50%;
            right: 0;
            width: 0%;
            transform: translateY(-50%);
            z-index: 15;
            pointer-events: none;
            transform-origin: right center;
          `;
          textWrapper.appendChild(strikethrough);
        }
        
        // Animate hand cutting motion and strikethrough simultaneously
        const cuttingTimeline = gsap.timeline({
          onComplete: () => {
            console.log('Cutting animation complete');
            returnHandToRest();
          }
        });
        
        // Animate hand cutting motion from right to left
        cuttingTimeline.to(handRef.current, {
          duration: 1.5,
          right: `${100 - cuttingEndX}%`,
          rotation: -5,
          ease: 'power1.inOut'
        });
        
        // Animate strikethrough line growing from right to left
        cuttingTimeline.to(strikethrough, {
          duration: 1.5,
          width: '100%',
          ease: 'power1.inOut'
        }, 0); // Start at the same time as hand movement
      }
    });
  };
  
  // Function to clear existing text
  const clearExistingText = () => {
    if (textContainerRef.current) {
      // Clear text in both left and right pages
      const leftTextElements = textContainerRef.current.querySelectorAll('[data-page="left"] .line-content');
      const rightTextElements = textContainerRef.current.querySelectorAll('[data-page="right"] .line-content');
      
      // Clear all text elements and remove strikethrough lines
      [...leftTextElements, ...rightTextElements].forEach(el => {
        el.textContent = '';
        // Remove strikethrough elements from the parent text-wrapper
        const textWrapper = el.parentElement;
        if (textWrapper) {
          const strikethrough = textWrapper.querySelector('.strikethrough-line');
          if (strikethrough) {
            strikethrough.remove();
          }
        }
      });
    }
  };

  // Helper function to find next empty line
  const findNextEmptyLine = () => {
    for (let line = 0; line < maxLinesPerPage * 2; line++) {
      const page = line < maxLinesPerPage ? 'left' : 'right';
      const lineIndexInPage = line % maxLinesPerPage;
      const actualLineIndex = page === 'left' ? lineIndexInPage : lineIndexInPage + maxLinesPerPage;
      
      const lineContainer = textContainerRef.current?.querySelector(`[data-page="${page}"][data-line-index="${actualLineIndex}"]`);
      const existingContent = lineContainer?.querySelector('.line-content');
      
      if (!existingContent || existingContent.textContent.trim() === '') {
        return line;
      }
    }
    // If no empty lines found, we've reached the end of the second page
    console.log('All lines filled! Erasing all entries and starting from the beginning.');
    clearExistingText();
    return 0; // Reset to first line after clearing
  };
  
  // Initialize hand position on mount
  useEffect(() => {
    if (handRef.current) {
      // Set initial hand position
      gsap.set(handRef.current, {
        right: '75%',
        bottom: '70%',
        rotation: 0
      });
      
      // Set initial hand state (resting visible, writing hidden)
      const handResting = handRef.current.querySelector('.hand-resting');
      const handWriting = handRef.current.querySelector('.hand-writing');
      
      if (handResting && handWriting) {
        gsap.set(handResting, { opacity: 1 });
        gsap.set(handWriting, { opacity: 0 });
      }
    }
  }, []);
  
  return (
    <div className="notebook-overlay" ref={overlayRef}>
      <Notebook textContainerRef={textContainerRef} />
      
      {/* Hand container */}
      <div className="hand-container" ref={handContainerRef}>
        <div className="hand" ref={handRef}>
          <img className="hand-resting" src={handRestingImage} alt="Hand resting" />
          <img className="hand-writing" src={handWritingImage} alt="Hand writing" />
        </div>
      </div>
    </div>
  );
};

export default NotebookOverlay;