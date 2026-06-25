import { useEffect, useState } from 'react';
import {
  Box, 
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Container,
} from '@mui/material';
import { CampaignRounded, ChevronRightRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { LANDING_BANNER_METAS } from '../../content/landingMarketing';

const BANNER_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&h=500&q=80';

export default function BannerStrip() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bannerScrollEl, setBannerScrollEl] = useState(null);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const el = bannerScrollEl;
    if (!el) return undefined;
    const onScroll = () => {
      let closest = 0;
      let best = Infinity;
      for (let i = 0; i < el.children.length; i += 1) {
        const card = el.children[i];
        const dist = Math.abs(card.offsetLeft - el.scrollLeft);
        if (dist < best) {
          best = dist;
          closest = i;
        }
      }
      setActiveBanner(closest);
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [bannerScrollEl]);

  return (
    <Box
      component="section"
      aria-label={t('common.featured')}
      sx={{
        pb: 2,
        px: { xs: 0, md: 0 },
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <CampaignRounded color="primary" fontSize="small" />
          <Typography variant="overline" fontWeight={800} color="text.secondary" letterSpacing={0.12}>
            {t('landing.highlights')}
          </Typography>
        </Stack>
      </Container>
      <Box
        ref={setBannerScrollEl}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          pb: 1,
          px: { xs: 2, md: 3 },
          maxWidth: 1200,
          mx: 'auto',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'action.selected',
            borderRadius: 99,
          },
        }}
      >
        {LANDING_BANNER_METAS.map((b) => {
          const go = () => {
            if (b.requireAuth && !user) navigate(b.fallbackPath ?? '/register');
            else navigate(b.path);
          };
          const title = t(`landing.banners.${b.id}.title`);
          const subtitle = t(`landing.banners.${b.id}.subtitle`);
          const cta = t(`landing.banners.${b.id}.cta`);
          const imageAlt = t(`landing.banners.${b.id}.imageAlt`);
          return (
            <Card
              key={b.id}
              elevation={0}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  go();
                }
              }}
              sx={{
                flex: { xs: '0 0 min(88vw, 340px)', md: '1 1 0' },
                minWidth: { xs: 'min(88vw, 340px)', md: 0 },
                scrollSnapAlign: 'start',
                borderRadius: 3,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                minHeight: { xs: 260, md: 300 },
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 32px rgba(30, 45, 36, 0.2)',
                },
                '&:active': { transform: 'scale(0.99)' },
              }}
              onClick={go}
            >
              <Box
                component="img"
                src={b.image}
                alt={imageAlt}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  // Ensure every card has a visible image even if remote URL fails.
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = BANNER_FALLBACK_IMAGE;
                }}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(15, 25, 20, 0.15) 0%, rgba(15, 25, 20, 0.55) 45%, rgba(15, 25, 20, 0.88) 100%)',
                }}
              />
              <CardContent
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  minHeight: { xs: 260, md: 300 },
                  p: { xs: 2.5, md: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  color: 'common.white',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' }, lineHeight: 1.25 }}>
                    {title}
                  </Typography>
                  <ChevronRightRounded sx={{ opacity: 0.9, flexShrink: 0 }} />
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    opacity: 0.95,
                    lineHeight: 1.45,
                    textShadow: '0 1px 8px rgba(0,0,0,0.35)',
                  }}
                >
                  {subtitle}
                </Typography>
                <Chip
                  label={cta}
                  size="small"
                  sx={{
                    mt: 2,
                    alignSelf: 'flex-start',
                    fontWeight: 800,
                    bgcolor: 'rgba(255,255,255,0.26)',
                    color: 'common.white',
                    backdropFilter: 'blur(8px)',
                  }}
                />
              </CardContent>
            </Card>
          );
        })}
      </Box>
      <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', gap: 0.75, mt: 0.5 }}>
        {LANDING_BANNER_METAS.map((b, i) => (
          <Box
            key={b.id}
            component="button"
            type="button"
            aria-label={t('common.showBanner', { n: i + 1 })}
            onClick={() => {
              const el = bannerScrollEl;
              if (!el) return;
              const card = el.children[i];
              card?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
            }}
            sx={{
              width: activeBanner === i ? 22 : 7,
              height: 7,
              borderRadius: 99,
              border: 'none',
              p: 0,
              cursor: 'pointer',
              bgcolor: activeBanner === i ? 'primary.main' : 'action.selected',
              transition: 'width 0.2s ease, background-color 0.2s ease',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
