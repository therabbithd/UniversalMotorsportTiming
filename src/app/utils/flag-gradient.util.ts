import {
  TRACK_FLAG_BY_MESSAGE,
  TRACK_FLAG_BY_STATUS,
  TrackFlagDisplay
} from '../constants/flag-colors.constants';

const DOUBLE_YELLOW_STRIPES =
  'repeating-linear-gradient(-45deg, #facc15 0 12px, #e10600 12px 24px)';

const CHEQUERED_PATTERN =
  'repeating-conic-gradient(#1a1a1a 0% 25%, #f5f5f5 0% 50%) 50% / 16px 16px';

/**
 * Resolves track flag colors and labels from F1 TrackStatus fields.
 */
export function resolveTrackFlagDisplay(
  status?: string,
  message?: string
): TrackFlagDisplay | null {
  if (!status && !message) return null;

  const messageOverride = message ? TRACK_FLAG_BY_MESSAGE[message] : undefined;
  const statusConfig = status ? TRACK_FLAG_BY_STATUS[status] : undefined;
  const base = messageOverride ?? statusConfig;

  if (!base) {
    return {
      statusCode: status ?? '0',
      labelKey: 'RACE.LIVE_TIMING.FLAG.UNKNOWN',
      background: '#6b7280',
      textColor: '#ffffff',
      cssClass: 'flag--unknown'
    };
  }

  let background = base.background;
  if (message === 'DoubleYellow') {
    background = DOUBLE_YELLOW_STRIPES;
  } else if (message === 'Chequered') {
    background = CHEQUERED_PATTERN;
  }

  return {
    statusCode: status ?? '0',
    ...base,
    background
  };
}
