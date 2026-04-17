import { useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { appTheme } from '../../theme/appTheme';

const rtlFontStack = '"Noto Sans Arabic", "Plus Jakarta Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export default function ThemeDirectionBridge({ children }) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith('ar') ?? false;

  const theme = useMemo(
    () =>
      createTheme(appTheme, {
        direction: isRtl ? 'rtl' : 'ltr',
        typography: {
          ...appTheme.typography,
          fontFamily: isRtl ? rtlFontStack : appTheme.typography.fontFamily,
        },
      }),
    [isRtl],
  );

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = isRtl ? 'ar' : 'en';
  }, [isRtl]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
