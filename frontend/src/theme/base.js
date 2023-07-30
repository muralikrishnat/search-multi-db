import { PureLightTheme } from './schemes/PureLightTheme';
import { GreyGooseTheme } from './schemes/GreyGooseTheme';

export function themeCreator(theme) {
  return themeMap[theme];
}

const themeMap = {
  PureLightTheme,
  GreyGooseTheme
};
