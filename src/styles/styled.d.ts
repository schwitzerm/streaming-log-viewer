import 'styled-components';
import { ThemeType } from './theme';
import 'styled-components';
import { ThemeType } from './theme';

// Extend the DefaultTheme interface
declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}
declare module 'styled-components' {
  import 'styled-components';
  import { ThemeType } from './theme';
  
  declare module 'styled-components' {
    export interface DefaultTheme extends ThemeType {}
  }
}
