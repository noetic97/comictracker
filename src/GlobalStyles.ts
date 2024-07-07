import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  :root {
    --background: 261 58% 35%;
    --foreground: 0 0% 100%;
    --card: 261 58% 40%;
    --card-foreground: 0 0% 100%;
    --primary: 50 97% 50%;
    --primary-foreground: 261 58% 35%;
    --secondary: 329 100% 78%;
    --accent: 140 100% 66%;
    --border: 261 58% 45%;
    --input: 261 58% 30%;
    --radius: 0.5rem;
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
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
