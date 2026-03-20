// src/app/models/f1-livetiming.model.ts

/**
 * Represents a Formula 1 year entry.
 */
export interface F1Year {
  /** The year number */
  Year: number;
  /** The path or endpoint for the year data */
  Path: string;
}

/**
 * Response structure for the Formula 1 index.
 */
export interface F1IndexResponse {
  /** Array of available years */
  Years: F1Year[];
}

/** 
 * Individual segment within a sector.
 */
export interface Segment {
  /** Status code of the segment (e.g., 2048 for personal best) */
  Status?: number;
}

/** 
 * Lap sector with its segments.
 */
export interface Sector {
  /** Segments making up the sector */
  Segments?: Segment[] | { [key: string]: Segment };
  /** Sector time as a string (e.g., "34.123") */
  Value?: string; 
}

/** 
 * Complete sector data for a driver.
 */
export interface SectorData {
  /** Dictionary or array of sectors for a specific lap/driver */
  Sectors?: Sector[] | { [key: string]: Sector };
}

/**
 * Represents a singular session in an F1 event (e.g., Practice 1, Qualifying, Race).
 */
export interface F1Session {
  /** Unique key identifying the session */
  Key: number;
  /** Type of session (e.g., Practice, Qualifying, Race) */
  Type: string;
  /** Name of the session */
  Name: string;
  /** Start date and time of the session */
  StartDate?: string;
  /** End date and time of the session */
  EndDate?: string;
  /** API path to fetch session-specific data */
  Path: string;
}

/**
 * Represents a Formula 1 Meeting (Grand Prix weekend).
 */
export interface F1Meeting {
  /** Unique key identifying the meeting */
  Key: number;
  /** Common name of the meeting */
  Name: string;
  /** Official full name of the Grand Prix */
  OfficialName?: string;
  /** Location or city of the event */
  Location?: string;
  /** Country where the meeting is held */
  Country?: {
    /** Country Code (ISO) */
    Code: string;
    /** Full name of the country */
    Name: string;
  };
  /** Circuit details for the meeting */
  Circuit?: {
    /** Unique key identifying the circuit */
    Key: number;
    /** Short name of the circuit */
    ShortName: string;
  };
  /** List of sessions within the meeting */
  Sessions: F1Session[];
}

/**
 * Response structure representing an F1 season.
 */
export interface F1SeasonResponse {
  /** The year of the season */
  Year: number;
  /** List of meetings (events) in the season */
  Meetings: F1Meeting[];
}

/**
 * Feed URLs for a specific session's live data.
 */
export interface F1SessionFeed {
  /** Path to the KeyFrame (starting state) data */
  KeyFramePath: string;
  /** Path to the Stream (updates) data */
  StreamPath: string;
}

/**
 * Index structure containing available feeds for an F1 session.
 */
export interface F1SessionIndex {
  /** Dictionary of available data feeds */
  Feeds: {
    [key: string]: F1SessionFeed;
  };
}

/**
 * Unified data representation for displaying a session grid.
 */
export interface SessionGridData {
  /** Name of the meeting */
  meetingName: string;
  /** Location of the meeting */
  location: string;
  /** Country of the meeting */
  country: string;
  /** Type of the session */
  sessionType: string;
  /** Name of the session */
  sessionName: string;
  /** Start date and time of the session */
  startDate?: string;
  /** Path to the session data */
  path: string;
  /** Original Meeting object reference */
  meeting: F1Meeting;
}

/**
 * Data representation for charting statistics.
 */
export interface ChartData {
  /** Category or type of chart data */
  type: string;
  /** Value or count for this category */
  count: number;
}

/**
 * Represents a single stint on a set of tyres.
 */
export interface TyreStint {
  /** Compound type (SOFT, MEDIUM, HARD, INTERMEDIATE, WET) */
  Compound: string;
  /** Whether the tyre was new when fitted ('true' or 'false' typically) */
  New: string;
  /** Whether tyres were left unchanged during a pit stop */
  TyresNotChanged: string;
  /** Total laps completed on this set of tyres */
  TotalLaps: number;
  /** Starting lap number for this stint */
  StartLaps: number;
}

/**
 * Timing and position information for a driver.
 */
export interface DriverTiming {
  /** Current track position */
  position: any;
  /** Driver Code (e.g., 'VER', 'HAM') */
  driverCode: string; 
  /** Driver Name (e.g., 'Verstappen', 'Hamilton') */
  driverName: string; 
  /** Current or completed lap number */
  lapNumber: number;
  /** Time of the last completed lap (e.g., "1:20.555") */
  lastLapTime: string; 
  /** Gap to the race leader (e.g., "+1.200") */
  gapToLeader: string; 
  /** Gap to the driver ahead (e.g., "Gap" or "+0.500") */
  gapToAhead: string; 
  /** If true, driver is in pit lane */
  isPit: boolean; 
  /** Status color for highlighting times ('personal-best' | 'session-best' | 'normal' | 'none') */
  statusColor: 'personal-best' | 'session-best' | 'normal' | 'none'; 
  /** Name of the team */
  teamName?: string;
  /** Hex color code for the team */
  teamColor?: string;
  /** History of tyre stints */
  tyreHistory?: TyreStint[];
}

/**
 * Comprehensive information about an F1 driver.
 */
export interface DriverInfo {
  /** Car racing number */
  RacingNumber: string;
  /** Name used in TV broadcasts */
  BroadcastName: string;
  /** Full name of the driver */
  FullName: string;
  /** Three Letter Acronym (TLA) for the driver */
  Tla: string;
  /** General ordering line or identifier */
  Line: number;
  /** Name of the team constructor */
  TeamName: string;
  /** Primary hex color of the team */
  TeamColour: string;
  /** First name of the driver */
  FirstName: string;
  /** Last name of the driver */
  LastName: string;
  /** Primary reference ID */
  Reference: string;
  /** URL to the driver's headshot image */
  HeadshotUrl: string;
}

/** 
 * Individual TeamRadio capture within the LiveTiming stream.
 */
export interface TeamRadioCapture {
  /** UTC date/time of the message */
  Utc: string;          
  /** Racing number (e.g., "63") */
  RacingNumber: string; 
  /** Path to the audio file (e.g., "TeamRadio/GEORUS01_63...") */
  Path: string;         
}

/** 
 * Structure of the TeamRadio block in the WebSocket state.
 */
export interface TeamRadioState {
  /** Array of radio message captures */
  Captures?: TeamRadioCapture[];
}
