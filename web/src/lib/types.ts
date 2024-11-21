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

    audio: Uint8Array | null;

    qbrCreated: number | null;
    qbrUpdated: number | null;
}

export const difficultyMap = {
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