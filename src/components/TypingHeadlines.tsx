import { useState, useEffect } from 'react';

const quotes = [
  "Raw thoughts. Real voices.",
  "Where feelings are loud and unfiltered.",
  "Thoughts without filters, words without walls.",
  "Authentic stories, unvarnished truths.",
  "The messy beauty of real life.",
  "Unfiltered minds, unscripted hearts."
];

export function TypingHeadlines() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const quote = quotes[currentQuote];
    
    if (isTyping) {
      if (charIndex < quote.length) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev + quote[charIndex]);
          setCharIndex(prev => prev + 1);
        }, 50); // Faster typing speed (was ~100ms, now 50ms)
        
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait then start erasing
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        
        return () => clearTimeout(timeout);
      }
    } else {
      // Erasing
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
          setCharIndex(prev => prev - 1);
        }, 30);
        
        return () => clearTimeout(timeout);
      } else {
        // Finished erasing, move to next quote
        setCurrentQuote(prev => (prev + 1) % quotes.length);
        setIsTyping(true);
      }
    }
  }, [currentQuote, charIndex, isTyping]);

  return (
    <div className="h-16 flex items-center justify-center">
      <p className="text-xl md:text-2xl text-center font-medium text-muted-foreground">
        {displayText}
        <span className="animate-blink text-accent">|</span>
      </p>
    </div>
  );
}