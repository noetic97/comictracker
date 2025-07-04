import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as S from "./styles";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <S.PaginationContainer data-sc="PaginationContainer">
      <S.PaginationButton
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        data-sc="PaginationButton"
      >
        <ChevronLeft size={20} />
      </S.PaginationButton>
      <S.PaginationInfo data-sc="PaginationInfo">
        Page {currentPage} of {totalPages}
      </S.PaginationInfo>
      <S.PaginationButton
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        data-sc="PaginationButton"
      >
        <ChevronRight size={20} />
      </S.PaginationButton>
    </S.PaginationContainer>
  );
};

export default PaginationControls;
