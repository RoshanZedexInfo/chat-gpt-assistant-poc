interface UserPromptAndResponse {
    userPrompt: string;
    response: string;
}

interface IsThinking {
    isThinking: boolean;
    message?: string;
}

interface ThreadLoadMessage {
    id: string;
    username: string;
    body: string;
    createdAt: number;
}