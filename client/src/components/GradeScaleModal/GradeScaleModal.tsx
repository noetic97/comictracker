import React from "react";
import { Comic } from "../../types";
import Modal from "../shared/Modal";
import {
  GRADE_SCALE,
  getBaseValue9_4,
  getEstimatedValue,
} from "../../utils/gradeScale";
import * as S from "./styles";

interface GradeScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  comic: Comic | null;
}

function formatValue(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const GradeScaleModal: React.FC<GradeScaleModalProps> = ({
  isOpen,
  onClose,
  comic,
}) => {
  if (!comic?.currentValue) {
    return null;
  }

  const baseValue9_4 = getBaseValue9_4(comic);
  if (baseValue9_4 == null) {
    return null;
  }

  const titleSuffix = comic.variantDetails
    ? ` - ${comic.variantDetails}`
    : comic.type && comic.type !== "Issue"
      ? ` - ${comic.type}`
      : "";
  const title = `Estimated pricing levels for Issue # ${comic.issue}${titleSuffix}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="medium"
    >
      <S.ScaleList>
        {GRADE_SCALE.map((entry, index) => {
          const value = getEstimatedValue(baseValue9_4, entry.gradeNumeric);
          return (
            <S.ScaleRow key={entry.gradeNumeric} $even={index % 2 === 0}>
              <S.ScaleValue>${formatValue(value)}</S.ScaleValue>
              <S.ScaleLabel>
                {entry.label} {entry.gradeNumeric}
              </S.ScaleLabel>
            </S.ScaleRow>
          );
        })}
      </S.ScaleList>
      <S.Disclaimer>
        Remember a comic is only worth what someone is willing to pay for it.
      </S.Disclaimer>
    </Modal>
  );
};

export default GradeScaleModal;
