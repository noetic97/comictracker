import React from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import {
  formatDuration,
  formatNumber,
  createProgressMessage,
} from "../../../utils/formatters";
import { ImportProgress } from "../../../hooks/useCSVImport";
import * as S from "./styles";

interface ImportProgressDisplayProps {
  progress: ImportProgress;
  percentComplete: number;
}

const ImportProgressDisplay: React.FC<ImportProgressDisplayProps> = ({
  progress,
  percentComplete,
}) => {
  if (!progress) {
    return null;
  }

  return (
    <S.ProgressContainer>
      <S.ProgressHeader>
        <S.ProgressTitle>
          <Upload size={20} />
          Importing Comics...
        </S.ProgressTitle>
        <S.ProgressStats>
          Chunk {progress.currentChunk} of {progress.chunks}
        </S.ProgressStats>
      </S.ProgressHeader>

      <S.ProgressBarContainer>
        <S.ProgressBar style={{ width: `${percentComplete}%` }} />
        <S.ProgressText>
          {createProgressMessage(progress.processed, progress.total, "comics")}
        </S.ProgressText>
      </S.ProgressBarContainer>

      <S.ProgressDetails>
        <S.ProgressDetailItem>
          <CheckCircle size={16} />
          <span>{formatNumber(progress.created)} created</span>
        </S.ProgressDetailItem>
        <S.ProgressDetailItem>
          <CheckCircle size={16} />
          <span>{formatNumber(progress.updated)} updated</span>
        </S.ProgressDetailItem>
        {progress.errors > 0 && (
          <S.ProgressDetailItem>
            <AlertCircle size={16} />
            <span>{formatNumber(progress.errors)} errors</span>
          </S.ProgressDetailItem>
        )}
      </S.ProgressDetails>

      <S.ProgressMeta>
        <span>Rate: {formatNumber(progress.rate)} comics/sec</span>
        <span>ETA: {formatDuration(progress.estimatedTimeRemaining)}</span>
        <span>Elapsed: {formatDuration(Date.now() - progress.startTime)}</span>
      </S.ProgressMeta>
    </S.ProgressContainer>
  );
};

export default ImportProgressDisplay;
