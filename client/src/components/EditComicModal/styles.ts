import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const SectionTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

export const MoreToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const MoreSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.foreground};
  cursor: pointer;

  input {
    width: 1rem;
    height: 1rem;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const FormError = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.error};
`;

export const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SelectLabel = styled.label`
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.foreground};
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
