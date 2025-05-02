import { LogLevel } from '../types';
import { ThemeType } from '../styles/theme';

/**
 * Returns the color for a given log level based on the current theme
 * @param level The log level
 * @param theme The current theme
 * @returns The color for the log level
 */
export const getLevelColor = (level: LogLevel, theme: ThemeType): string => {
  switch (level) {
    case 'error': return theme.red;
    case 'warn': return theme.yellow;
    case 'info': return theme.green;
    case 'debug': return theme.magenta;
    case 'trace': return theme.cyan;
    default: return theme.text;
  }
};