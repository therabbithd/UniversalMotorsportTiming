export interface MotoGPSeason {
    id: string;
    name: string | null;
    year: number;
    current: boolean;
}

export interface MotoGPCategory {
    id: string;
    name: string;
    legacy_id: number;
}

export interface MotoGPEvent {
    id: string;
    name: string;
    country: {
        iso: string;
        name: string;
    };
    event_files: any;
    date_start: string;
    date_end: string;
}

export interface MotoGPSession {
    id: string;
    date: string;
    number: number;
    condition: any;
    type: string;
    category: MotoGPCategory;
}

export interface MotoGPClassificationEntry {
    id: string;
    position: number;
    rider: {
        full_name: string;
        country: {
            iso: string;
            name: string;
        };
        number: number;
    };
    team: {
        name: string;
    };
    constructor: {
        name: string;
    };
    best_lap: {
        number: number;
        time: string;
    };
    total_laps: number;
    top_speed: number;
    gap: {
        first: string;
        prev: string;
    };
    status: string;
}

export interface MotoGPStandingEntry {
    position: number;
    rider: {
        full_name: string;
        country: {
            iso: string;
            name: string;
        };
        number: number;
    };
    team: {
        name: string;
    };
    constructor: {
        name: string;
    };
    session: string;
    points: number;
}

export interface MotoGPClassificationResponse {
    classification: MotoGPClassificationEntry[];
}

export interface MotoGPStandingsResponse {
    classification: MotoGPStandingEntry[];
    file: string;
}

export interface MotoGPLiveTiming {
    head: {
        category: string;
        circuit_name: string;
        event_tv_name: string;
        session_name: string;
        session_shortname: string;
        session_status_name: string;
        remaining: string;
    };
    rider: {
        [key: string]: MotoGPLiveRider;
    };
}

export interface MotoGPLiveRider {
    order: number;
    rider_number: string;
    rider_shortname: string;
    pos: number;
    lap_time: string;
    num_lap: number;
    last_lap_time: string;
    team_name: string;
    bike_name: string;
    gap_first: string;
    gap_prev: string;
    on_pit: boolean;
}
