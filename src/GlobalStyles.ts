import { createGlobalStyle, DefaultTheme } from "styled-components";

const GlobalStyles = createGlobalStyle<{ theme: DefaultTheme }>`
  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.foreground};
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
    font-size: 16px;
  }

  * {
    box-sizing: border-box;
  }
`;

export default GlobalStyles;
