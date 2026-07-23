import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Group as GroupIcon,
  CloudUpload as CloudUploadIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
} from '@mui/icons-material';
import { ChatWaveLogo } from '../layout/ChatWaveLogo';
import { AnimatedBackground } from '../layout/AnimatedBackground';
import { AuthModal } from '../auth/AuthModal';

export const LandingPage: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authModalTab, setAuthModalTab] = React.useState<'login' | 'register'>('login');

  const handleOpenAuth = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: 32, color: '#7c3aed' }} />,
      title: 'Ultra-Fast Real-Time Messaging',
      description: 'Instant zero-latency message delivery powered by Socket.IO WebSockets and event-driven Node.js architecture.',
      bgImage: '/images/card_bg_1.png',
    },
    {
      icon: <GroupIcon sx={{ fontSize: 32, color: '#ec4899' }} />,
      title: 'Group Chats & Channels',
      description: 'Collaborate effortlessly in multi-user group channels with live presence, typing indicators, and admin controls.',
      bgImage: '/images/card_bg_2.png',
    },
    {
      icon: <CloudUploadIcon sx={{ fontSize: 32, color: '#06b6d4' }} />,
      title: 'Seamless File & Media Sharing',
      description: 'Drag-and-drop file sharing for images, videos, voice notes, and documents with instant inline preview rendering.',
      bgImage: '/images/card_bg_3.png',
    },
  ];

  const techBadges = [
    'React 18',
    'Node.js',
    'Socket.IO',
    'MongoDB',
    'TypeScript',
    'Material UI',
    'JWT Auth',
    'WebSockets',
  ];

  return (
    <AnimatedBackground>
      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Floating Pill Navbar with Rich Shadow Effects */}
        <Container maxWidth="lg" sx={{ pt: 3, pb: 1, position: 'sticky', top: 0, zIndex: 1100 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2.5, sm: 4 },
              py: 1.5,
              borderRadius: '50px',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.18), 0 10px 25px rgba(15, 23, 42, 0.08)',
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {/* Brand Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <ChatWaveLogo size="small" color="#7c3aed" textColor="#0f172a" />
            </Link>

            {/* Product Links */}
            <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  '&:hover': { color: '#7c3aed' },
                  transition: 'color 0.2s',
                }}
              >
                Features
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  '&:hover': { color: '#7c3aed' },
                  transition: 'color 0.2s',
                }}
              >
                Security
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  '&:hover': { color: '#7c3aed' },
                  transition: 'color 0.2s',
                }}
              >
                Architecture
              </Typography>
            </Stack>

            {/* Actions */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                onClick={() => handleOpenAuth('login')}
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: '#475569',
                  px: 2,
                  '&:hover': {
                    color: '#0f172a',
                    backgroundColor: 'rgba(241, 245, 249, 0.6)',
                  },
                }}
              >
                Sign In
              </Button>

              <Button
                onClick={() => handleOpenAuth('register')}
                variant="contained"
                sx={{
                  borderRadius: '50px',
                  px: 3,
                  py: 0.9,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  backgroundColor: '#7c3aed',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                  '&:hover': {
                    backgroundColor: '#6d28d9',
                    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.45)',
                  },
                }}
              >
                Get Started
              </Button>
            </Stack>
          </Box>
        </Container>

        {/* Hero Section */}
        <Container maxWidth="md" sx={{ textAlign: 'center', pt: { xs: 6, sm: 10 }, pb: { xs: 6, sm: 8 } }}>

          {/* Main Hero Headline */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              fontSize: { xs: '2.5rem', sm: '3.75rem', md: '4.5rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              mb: 3,
              fontFamily: '"Inter", "Roboto", sans-serif',
            }}
          >
            Real-Time Chat for All from Chat Wave
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h6"
            sx={{
              color: '#475569',
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              maxWidth: '700px',
              mx: 'auto',
              mb: 5,
              lineHeight: 1.6,
            }}
          >
            Built on sovereign compute. Powered by high-speed WebSocket servers. Delivering population-scale real-time communication impact.
          </Typography>

          {/* Hero CTAs */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
            <Button
              onClick={() => handleOpenAuth('register')}
              variant="contained"
              size="large"
              sx={{
                borderRadius: '50px',
                px: 4,
                py: 1.6,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                backgroundColor: '#7c3aed',
                boxShadow: '0 10px 25px rgba(124, 58, 237, 0.35)',
                '&:hover': {
                  backgroundColor: '#6d28d9',
                  boxShadow: '0 15px 30px rgba(124, 58, 237, 0.45)',
                },
                minWidth: '180px',
              }}
            >
              Sign up
            </Button>

            <Button
              onClick={() => handleOpenAuth('login')}
              variant="contained"
              size="large"
              sx={{
                borderRadius: '50px',
                px: 4,
                py: 1.6,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  borderColor: '#cbd5e1',
                },
                minWidth: '180px',
              }}
            >
              Log in
            </Button>
          </Stack>
        </Container>

        {/* Marquee / Tech Badges Section */}
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#64748b',
              mb: 3,
              textTransform: 'uppercase',
            }}
          >
            Powering Next-Gen Real-Time Communication
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            {techBadges.map((badge) => (
              <Chip
                key={badge}
                label={badge}
                variant="outlined"
                sx={{
                  borderRadius: '50px',
                  px: 2,
                  py: 1,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'rgba(226, 232, 240, 0.8)',
                  color: '#334155',
                }}
              />
            ))}
          </Box>
        </Container>

        {/* Features Cards Grid */}
        <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 10 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
            }}
          >
            {features.map((feature, idx) => (
              <Card
                key={idx}
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  p: 3.5,
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundImage: `linear-gradient(145deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.84) 100%), url(${feature.bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
                  '&:hover': {
                    boxShadow: '0 25px 45px rgba(124, 58, 237, 0.15)',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                  },
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {feature.icon}
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                    {feature.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>

        {/* Production-Grade SaaS Footer */}
        <Box
          component="footer"
          sx={{
            mt: 'auto',
            pt: { xs: 8, sm: 10 },
            pb: 5,
            borderTop: '1px solid rgba(226, 232, 240, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr 1fr' },
                gap: { xs: 4, sm: 6 },
                mb: 6,
              }}
            >
              {/* Brand Summary Column */}
              <Box>
                <Box sx={{ mb: 2 }}>
                  <ChatWaveLogo size="small" color="#7c3aed" textColor="#0f172a" />
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7, maxWidth: 300 }}>
                  Next-generation real-time messaging platform powered by WebSockets, event-driven Node.js, and end-to-end security.
                </Typography>
              </Box>

              {/* Column 1: Product */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                  Product
                </Typography>
                <Stack spacing={1.5}>
                  {['Real-Time Engine', 'Group Channels', 'Media Storage', 'JWT Security', 'Architecture'].map((item) => (
                    <Typography
                      key={item}
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        cursor: 'pointer',
                        fontWeight: 500,
                        '&:hover': { color: '#7c3aed' },
                        transition: 'color 0.2s',
                      }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>

              {/* Column 2: Resources */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                  Resources
                </Typography>
                <Stack spacing={1.5}>
                  {['Documentation', 'API Reference', 'System Status', 'GitHub Code', 'Changelog'].map((item) => (
                    <Typography
                      key={item}
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        cursor: 'pointer',
                        fontWeight: 500,
                        '&:hover': { color: '#7c3aed' },
                        transition: 'color 0.2s',
                      }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>

              {/* Column 3: Trust & Legal */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                  Trust & Legal
                </Typography>
                <Stack spacing={1.5}>
                  {['Privacy Policy', 'Terms of Service', 'Security Overview', 'Cookie Preferences', 'Compliance'].map((item) => (
                    <Typography
                      key={item}
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        cursor: 'pointer',
                        fontWeight: 500,
                        '&:hover': { color: '#7c3aed' },
                        transition: 'color 0.2s',
                      }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(226, 232, 240, 0.8)', mb: 4 }} />

            {/* Bottom Copyright Bar */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                © {new Date().getFullYear()} Chat Wave. Built for zero-latency communication. All rights reserved.
              </Typography>

              {/* Social Icons */}
              <Stack direction="row" spacing={1}>
                <IconButton size="small" sx={{ color: '#64748b', '&:hover': { color: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, 0.08)' } }}>
                  <GitHubIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: '#64748b', '&:hover': { color: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, 0.08)' } }}>
                  <TwitterIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: '#64748b', '&:hover': { color: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, 0.08)' } }}>
                  <LinkedInIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          </Container>
        </Box>

      </Box>

      {/* Tabbed Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </AnimatedBackground>
  );
};

export default LandingPage;
