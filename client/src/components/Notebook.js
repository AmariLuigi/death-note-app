import React, { useRef, useEffect } from 'react';
import '../styles/Notebook.css';

const Notebook = ({ textContainerRef }) => {
  const notebookRef = useRef(null);
  const linesRef = useRef([]);
  
  // Define notebook writable area coordinates (in percentages)
  const defaultWritableArea = {
    top: 20, // % from top of notebook
    height: 60, // % of notebook height
    lineHeight: 8, // % of notebook height
    maxLines: 7, // Maximum number of lines per page
    // Left page settings
    leftPage: {
      left: 10, // % from left of notebook for left page
      width: 30, // % of notebook width for left page
    },
    // Right page settings
    rightPage: {
      left: 60, // % from left of notebook for right page
      width: 30, // % of notebook width for right page
    }
  };
  
  // Calculate line positions based on writable area
  const getLinePosition = (lineNumber, page) => {
    const isLeftPage = page === 'left';
    const pageSettings = isLeftPage ? defaultWritableArea.leftPage : defaultWritableArea.rightPage;
    
    return {
      x: pageSettings.left,
      y: defaultWritableArea.top + ((lineNumber % defaultWritableArea.maxLines) * defaultWritableArea.lineHeight),
      width: pageSettings.width,
      height: defaultWritableArea.lineHeight,
      page: page
    };
  };

  return (
    <div className="notebook-container">
      <div className="notebook" ref={notebookRef}>
        {/* Notebook pages */}
        <div className="notebook-pages">
        {/* Simulated pages behind - left side */}
        <div className="simulated-pages left-stack">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`sim-page-left-${index}`} className="simulated-page" style={{ right: `${index * 1}px`, zIndex: 5 - index }}></div>
          ))}
        </div>

        <div className="notebook-page left">
            {/* Page decorations */}
            <div className="page-corner top-left">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 C30,10 10,30 0,100" stroke="#8b4513" fill="none" strokeWidth="2" />
                <path d="M0,0 C20,5 5,20 0,50" stroke="#8b4513" fill="none" strokeWidth="1" />
              </svg>
            </div>
            <div className="page-corner bottom-left">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,100 C30,90 10,70 0,0" stroke="#8b4513" fill="none" strokeWidth="2" />
                <path d="M0,100 C20,95 5,80 0,50" stroke="#8b4513" fill="none" strokeWidth="1" />
              </svg>
            </div>
            
            {/* Page lines */}
            <div className="page-lines">
              {[...Array(10)].map((_, index) => (
                <div key={`line-left-${index}`} className="page-line"></div>
              ))}
            </div>
          </div>
          
          <div className="notebook-page right">
            {/* Page decorations */}
            <div className="page-corner top-right">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M100,0 C70,10 90,30 100,100" stroke="#8b4513" fill="none" strokeWidth="2" />
                <path d="M100,0 C80,5 95,20 100,50" stroke="#8b4513" fill="none" strokeWidth="1" />
              </svg>
            </div>
            <div className="page-corner bottom-right">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M100,100 C70,90 90,70 100,0" stroke="#8b4513" fill="none" strokeWidth="2" />
                <path d="M100,100 C80,95 95,80 100,50" stroke="#8b4513" fill="none" strokeWidth="1" />
              </svg>
            </div>
            
            {/* Page lines */}
            <div className="page-lines">
              {[...Array(10)].map((_, index) => (
                <div key={`line-right-${index}`} className="page-line"></div>
              ))}
            </div>
          </div>

        {/* Simulated pages behind - right side */}
        <div className="simulated-pages right-stack">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`sim-page-right-${index}`} className="simulated-page" style={{ left: `${index * 1}px`, zIndex: 5 - index }}></div>
          ))}
        </div>
        </div>
        
        {/* Center fold instead of binding */}
        <div className="notebook-center-fold"></div>
        
        {/* Text container for writing animations */}
        <div className="text-container" ref={textContainerRef}>
          {/* Create individual line divs for left page */}
          {[...Array(defaultWritableArea.maxLines)].map((_, index) => {
            const position = getLinePosition(index, 'left');
            return (
              <div
                key={`line-div-left-${index}`}
                className="text-line-container"
                data-line-index={index}
                data-page="left"
                style={{
                  position: 'absolute',
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  width: `${position.width}%`,
                  height: `${position.height}%`,
                  border: '1px solid rgba(0,0,0,0.05)' // Light border for debugging
                }}
                ref={el => {
                  if (el) linesRef.current[`left-${index}`] = el;
                }}
              >
                <div className="text-wrapper" style={{
                  display: 'inline-block',
                  position: 'relative'
                }}>
                  <div className="line-content" id={`line-left-${index}`}></div>
                </div>
              </div>
            );
          })}
          
          {/* Create individual line divs for right page */}
          {[...Array(defaultWritableArea.maxLines)].map((_, index) => {
            const position = getLinePosition(index, 'right');
            return (
              <div
                key={`line-div-right-${index}`}
                className="text-line-container"
                data-line-index={index + defaultWritableArea.maxLines}
                data-page="right"
                style={{
                  position: 'absolute',
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  width: `${position.width}%`,
                  height: `${position.height}%`,
                  border: '1px solid rgba(0,0,0,0.05)' // Light border for debugging
                }}
                ref={el => {
                  if (el) linesRef.current[`right-${index}`] = el;
                }}
              >
                <div className="text-wrapper" style={{
                  display: 'inline-block',
                  position: 'relative'
                }}>
                  <div className="line-content" id={`line-right-${index}`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Notebook;