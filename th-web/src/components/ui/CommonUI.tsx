import { styled } from "styled-components";

export const Button = styled.button`
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0069d9;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  &.secondary {
    background-color: #6c757d;

    &:hover {
      background-color: #5a6268;
    }
  }

  &.danger {
    background-color: #dc3545;

    &:hover {
      background-color: #c82333;
    }
  }

  &.success {
    background-color: #28a745;

    &:hover {
      background-color: #218838;
    }
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;
