import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Fira Code', monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-size: 14px;
    line-height: 1.5;
    height: 100vh;
    overflow: hidden;
  }

  @font-face {
    font-family: 'Fira Code';
    src: url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap');
  }

  a {
    color: ${({ theme }) => theme.primary};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.highlight};
    }
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background}; 
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.secondary}; 
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.primary}; 
  }

  ::selection {
    background: ${({ theme }) => theme.highlight};
    color: ${({ theme }) => theme.text};
  }
`;
