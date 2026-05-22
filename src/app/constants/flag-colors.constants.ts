/** Visual display config for a track flag / track status. */
export interface TrackFlagDisplay {
  statusCode: string;
  labelKey: string;
  background: string;
  textColor: string;
  cssClass: string;
}

/** F1 live timing TrackStatus.Status → display (see F1 data reference). */
export const TRACK_FLAG_BY_STATUS: Record<string, Omit<TrackFlagDisplay, 'statusCode'>> = {
  '1': {
    labelKey: 'RACE.LIVE_TIMING.FLAG.GREEN',
    background: '#22c55e',
    textColor: '#ffffff',
    cssClass: 'flag--green'
  },
  '2': {
    labelKey: 'RACE.LIVE_TIMING.FLAG.YELLOW',
    background: '#facc15',
    textColor: '#1a1a1a',
    cssClass: 'flag--yellow'
  },
  '4': {
    labelKey: 'RACE.LIVE_TIMING.FLAG.SAFETY_CAR',
    background: '#f59e0b',
    textColor: '#1a1a1a',
    cssClass: 'flag--safety-car'
  },
  '5': {
    labelKey: 'RACE.LIVE_TIMING.FLAG.RED',
    background: '#e10600',
    textColor: '#ffffff',
    cssClass: 'flag--red'
  },
  '6': {
    labelKey: 'RACE.LIVE_TIMING.FLAG.VSC',
    background: '#eab308',
    textColor: '#1a1a1a',
    cssClass: 'flag--vsc'
  },
  '7': {
    labelKey: 'RACE.LIVE_TIMING.FLAG.VSC_ENDING',
    background: '#ca8a04',
    textColor: '#ffffff',
    cssClass: 'flag--vsc-ending'
  }
};

/** Overrides when TrackStatus.Message is more specific than Status alone. */
export const TRACK_FLAG_BY_MESSAGE: Record<string, Omit<TrackFlagDisplay, 'statusCode'>> = {
  DoubleYellow: {
    labelKey: 'RACE.LIVE_TIMING.FLAG.DOUBLE_YELLOW',
    background: '',
    textColor: '#1a1a1a',
    cssClass: 'flag--double-yellow'
  },
  Chequered: {
    labelKey: 'RACE.LIVE_TIMING.FLAG.CHEQUERED',
    background: '#f5f5f5',
    textColor: '#1a1a1a',
    cssClass: 'flag--chequered'
  }
};
