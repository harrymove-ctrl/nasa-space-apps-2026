import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';
import { getRemotionEnvironment, staticFile } from 'remotion';
import type { SnapCnTheme } from '@/lib/snap-cn-ui';

const manrope = loadManrope('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
});

const jetbrainsMono = loadJetBrainsMono('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export const FONT_SANS = manrope.fontFamily;
export const FONT_MONO = jetbrainsMono.fontFamily;

export const PALETTE = {
  obsidianBase: '#090c14',
  obsidianSubtle: '#0b101b',
  obsidianCard: '#101622',
  obsidianElevated: '#161e2e',
  obsidianBorder: 'rgba(148, 163, 184, 0.28)',
  obsidianBorderHex: '#232e42',
  inkPrimary: '#f3efe6',
  inkSecondary: '#cbd5e1',
  inkMuted: '#94a3b8',
  cyan: '#45b8d6',
  sky: '#38bdf8',
  coral: '#ee6b47',
  scannerGreen: '#34d399',
  scannerBright: '#5dff9a',
  warmPaper: '#f5f2ea',
  warmPaperCard: '#ece8dd',
  warmInk: '#0e141e',
  warmMuted: '#495464',
  warmAccent: '#1d6f8a',
  warmBorder: 'rgba(14, 20, 30, 0.16)',
} as const;

export const DOPAIMINT_SNAPCN_THEME: Partial<SnapCnTheme> = {
  background: PALETTE.obsidianBase,
  foreground: PALETTE.inkPrimary,
  card: PALETTE.obsidianCard,
  cardForeground: PALETTE.inkPrimary,
  popover: PALETTE.obsidianElevated,
  popoverForeground: PALETTE.inkPrimary,
  primary: PALETTE.cyan,
  primaryForeground: '#060911',
  secondary: PALETTE.obsidianElevated,
  secondaryForeground: PALETTE.inkPrimary,
  muted: PALETTE.obsidianElevated,
  mutedForeground: PALETTE.inkMuted,
  accent: PALETTE.obsidianElevated,
  accentForeground: PALETTE.inkPrimary,
  destructive: PALETTE.coral,
  destructiveForeground: PALETTE.inkPrimary,
  border: PALETTE.obsidianBorderHex,
  input: PALETTE.obsidianBorderHex,
  ring: PALETTE.cyan,
  radius: 8,
  fontFamily: FONT_SANS,
};

export function resolveAssetUrl(publicPath: string): string {
  const isLocal = publicPath.startsWith('/') && !publicPath.startsWith('//');
  if (!isLocal || getRemotionEnvironment().isPlayer) {
    return publicPath;
  }
  const base = staticFile('_').slice(0, -2);
  if (base && publicPath.startsWith(`${base}/`)) {
    return publicPath;
  }
  try {
    return staticFile(publicPath.replace(/^\/+/, ''));
  } catch {
    return publicPath;
  }
}
