import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      variant="dark"
      className="fh-scroll-to-top"
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      ↑ Back to Top
    </Button>
  );
}

export default ScrollToTop;
