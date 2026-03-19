/**
 * Represents a MotoGP season.
 */
export interface MotoGPSeason {
    /** Unique identifier for the season */
    id: string;
    /** Name of the season, can be null */
    name: string | null;
    /** The year of the season */
    year: number;
    /** Indicates if this is the current season */
    current: boolean;
}

/**
 * Represents a MotoGP category (e.g., MotoGP, Moto2, Moto3).
 */
export interface MotoGPCategory {
    /** Unique identifier for the category */
    id: string;
    /** Name of the category */
    name: string;
    /** Legacy identifier used in older APIs */
    legacy_id: number;
}

/**
 * Represents a specific event or Grand Prix in the MotoGP calendar.
 */
export interface MotoGPEvent {
    /** Unique identifier for the event */
    id: string;
    /** Name of the event */
    name: string;
    /** Information about the country where the event takes place */
    country: {
        /** ISO code of the country */
        iso: string;
        /** Name of the country */
        name: string;
    };
    /** Files or resources associated with the event */
    event_files: any;
    /** Start date and time of the event */
    date_start: string;
    /** End date and time of the event */
    date_end: string;
}

/**
 * Represents a specific session within a MotoGP event (e.g., FP1, Qualifying, Race).
 */
export interface MotoGPSession {
    /** Unique identifier for the session */
    id: string;
    /** Date and time of the session */
    date: string;
    /** Session number */
    number: number;
    /** Track conditions during the session */
    condition: any;
    /** Type of the session (e.g., RACE, QUALIFYING) */
    type: string;
    /** The category racing in this session */
    category: MotoGPCategory;
}

/**
 * Represents an entry in the classification/results of a specific session.
 */
export interface MotoGPClassificationEntry {
    /** Unique identifier for the classification entry */
    id: string;
    /** The final position of the rider */
    position: number;
    /** Information about the rider */
    rider: {
        /** Full name of the rider */
        full_name: string;
        /** Country of the rider */
        country: {
            /** ISO code of the country */
            iso: string;
            /** Name of the country */
            name: string;
        };
        /** Racing number of the rider */
        number: number;
    };
    /** Information about the rider's team */
    team: {
        /** Name of the team */
        name: string;
    };
    /** Information about the bike constructor */
    constructor: {
        /** Name of the constructor */
        name: string;
    };
    /** Information about the rider's best lap */
    best_lap: {
        /** Lap number of the best lap */
        number: number;
        /** Time of the best lap */
        time: string;
    };
    /** Total number of laps completed by the rider */
    total_laps: number;
    /** Top speed achieved by the rider */
    top_speed: number;
    /** Time gaps to other riders */
    gap: {
        /** Gap to the first place rider */
        first: string;
        /** Gap to the previous rider */
        prev: string;
    };
    /** Status of the rider (e.g., Finished, DNF) */
    status: string;
}

/**
 * Represents an entry in the overall championship standings.
 */
export interface MotoGPStandingEntry {
    /** The current championship position of the rider */
    position: number;
    /** Information about the rider */
    rider: {
        /** Full name of the rider */
        full_name: string;
        /** Country of the rider */
        country: {
            /** ISO code of the rider's country */
            iso: string;
            /** Name of the country */
            name: string;
        };
        /** Racing number of the rider */
        number: number;
    };
    /** Information about the rider's team */
    team: {
        /** Name of the team */
        name: string;
    };
    /** Information about the bike constructor */
    constructor: {
        /** Name of the constructor */
        name: string;
    };
    /** Session identifier for the standing point */
    session: string;
    /** Total championship points accumulated */
    points: number;
}

/**
 * API Response containing classification data for a session.
 */
export interface MotoGPClassificationResponse {
    /** Array of classification entries */
    classification: MotoGPClassificationEntry[];
}

/**
 * API Response containing championship standings data.
 */
export interface MotoGPStandingsResponse {
    /** Array of standing entries */
    classification: MotoGPStandingEntry[];
    /** Associated file URL for the standings */
    file: string;
}

/**
 * Represents the complete live timing state.
 */
export interface MotoGPLiveTiming {
    /** Header information about the current session */
    head: {
        /** Racing category */
        category: string;
        /** Name of the circuit */
        circuit_name: string;
        /** TV broadcasting name of the event */
        event_tv_name: string;
        /** Name of the session */
        session_name: string;
        /** Short name of the session */
        session_shortname: string;
        /** Current status of the session */
        session_status_name: string;
        /** Remaining time or laps in the session */
        remaining: string;
    };
    /** Map of rider live timing data, indexed by rider number or ID */
    rider: {
        [key: string]: MotoGPLiveRider;
    };
}

/**
 * Represents the live timing data for an individual rider.
 */
export interface MotoGPLiveRider {
    /** Current order/position in the session */
    order: number;
    /** Rider's racing number */
    rider_number: string;
    /** Short version of the rider's name */
    rider_shortname: string;
    /** Current position */
    pos: number;
    /** Time of the current/last lap */
    lap_time: string;
    /** Current lap number */
    num_lap: number;
    /** Time of the previous lap */
    last_lap_time: string;
    /** Name of the rider's team */
    team_name: string;
    /** Name of the rider's bike */
    bike_name: string;
    /** Time gap to the first place rider */
    gap_first: string;
    /** Time gap to the previous rider */
    gap_prev: string;
    /** Indicates if the rider is currently in the pit lane */
    on_pit: boolean;
}
