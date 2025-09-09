import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { ArrowUp } from 'lucide-react';

export function GoToTopButton() {
  const [showGoToTop, setShowGoToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowGoToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showGoToTop) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      aria-label="Go to top"
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
}