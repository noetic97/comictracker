import React, { useState, useEffect } from "react";
import { ChevronsUp } from "lucide-react";
import Button from "../../shared/Button/Button";
import * as S from "./styles";

const ToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <S.ToTopButtonWrapper>
      <Button
        onClick={scrollToTop}
        icon={ChevronsUp}
        variant="secondary"
        size="large"
        shape="circular"
        aria-label="Scroll to top"
      />
    </S.ToTopButtonWrapper>
  );
};

export default ToTopButton;
