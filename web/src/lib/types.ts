export interface Set {
    id: string;
    name: string | null;
    year: number | null;
    difficulty: number | null;
    standard: boolean | null;
}

export interface Packet {
    id: string;
    name: string | null;
    number: number | null;
    setId: string | null;
}

export interface Tossup {
    id: string;
    category: string | null;
    subcategory: string | null;
    difficulty: number | null;

    setId: string | null;
    packetId: string | null;
    number: number | null;

    question: string | null;
    wordTiming: string | null;
    answer: string | null;
    powerMark: number | null;

    audio: any | null;

    qbrCreated: number | null;
    qbrUpdated: number | null;
    rerunMarker: number | null;
}

export const difficultyMap: Record<number, string> = {
    0: "Trash",
    1: "Middle School",
    2: "Easy High School",
    3: "Regular High School",
    4: "Hard High School",
    5: "National High School",
    6: "Easy College",
    7: "Medium College",
    8: "Regionals College",
    9: "Nationals College",
    10: "Open"
};

export interface PlayerState {
    currentWordIndex: number;
    status: 'initial' | 'reading' | 'complete' | 'buzzedOrExpired' | 'revealed';
    isPlaying: boolean;
    audioUrl: string;
    words: string[];
    wordTimings: number[];
    buzzTimerProgress: number;
    endTimerProgress: number;
}

export interface TimerState {
    progressInterval?: ReturnType<typeof setInterval>;
    timerInterval?: ReturnType<typeof setInterval>;
}

export type TimerCallback = (progress: number) => void;
export type TimerCompleteCallback = () => void;

export interface AudioElementRef extends HTMLAudioElement {
    currentTime: number;
}