import React from "react";
import { useLoadingManager } from "../LoadingManager/LoadingManagerContext";
import * as S from "./styles";

interface ComicLoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  forceShow?: boolean; // For manual control
}

const ComicLoadingSpinner: React.FC<ComicLoadingSpinnerProps> = ({
  message,
  subMessage,
  forceShow = false,
}) => {
  const { loadingState } = useLoadingManager();

  // PURE loading manager control - ignore any external loading state
  const shouldShow = forceShow || loadingState.phase !== "ready";

  if (!shouldShow) return null;

  const displayMessage = message || loadingState.message;
  const displaySubMessage = subMessage || loadingState.subMessage;

  return (
    <S.LoadingOverlay>
      <S.LoadingContainer>
        {/* Spinning comic book icon */}
        <S.SpinnerContainer>
          <S.ComicBook>
            <S.ComicCover>
              <S.ComicTitle>COMIC</S.ComicTitle>
              <S.ComicSubtitle>TRACKER</S.ComicSubtitle>
            </S.ComicCover>
          </S.ComicBook>
        </S.SpinnerContainer>

        {/* Comic book style text */}
        <S.LoadingText>
          <S.MainMessage>{displayMessage}</S.MainMessage>
          <S.SubMessage>{displaySubMessage}</S.SubMessage>
        </S.LoadingText>

        {/* Comic book style effects - different per phase */}
        <S.ComicEffects>
          {loadingState.phase === "data-loading" && (
            <>
              <S.BurstEffect delay="0s">POW!</S.BurstEffect>
              <S.BurstEffect delay="0.5s">ZAP!</S.BurstEffect>
              <S.BurstEffect delay="1s">BOOM!</S.BurstEffect>
            </>
          )}
          {loadingState.phase === "components-loading" && (
            <>
              <S.BurstEffect delay="0s">SETUP!</S.BurstEffect>
              <S.BurstEffect delay="0.7s">READY!</S.BurstEffect>
            </>
          )}
          {loadingState.phase === "background-refresh" && (
            <>
              <S.BurstEffect delay="0s">UPDATE!</S.BurstEffect>
              <S.BurstEffect delay="0.5s">SYNC!</S.BurstEffect>
            </>
          )}
        </S.ComicEffects>

        {/* Progress dots */}
        <S.LoadingDots>
          <S.Dot delay="0s" />
          <S.Dot delay="0.2s" />
          <S.Dot delay="0.4s" />
        </S.LoadingDots>
      </S.LoadingContainer>
    </S.LoadingOverlay>
  );
};

export default ComicLoadingSpinner;
