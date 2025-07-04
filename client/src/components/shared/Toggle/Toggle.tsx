import React from "react";
import * as S from "./styles";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => (
  <S.ToggleWrapper data-sc="ToggleWrapper">
    <S.ToggleInput
      type="checkbox"
      checked={checked}
      onChange={onChange}
      data-sc="ToggleInput"
    />
    <S.ToggleSlider />
  </S.ToggleWrapper>
);

export default Toggle;
