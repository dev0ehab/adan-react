import { Box, Stack, Typography } from '@mui/material';

/**
 * Title row + optional action buttons (CRUD shortcuts, filters, etc.)
 */
export default function PageHeader({ title, subtitle, actions = null }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        justifyContent="space-between"
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 560 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {actions ? (
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
            justifyContent={{ xs: 'stretch', sm: 'flex-end' }}
            sx={{ flexShrink: 0 }}
          >
            {actions}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
