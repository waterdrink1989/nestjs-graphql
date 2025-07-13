import { enErrorMessages } from "./en";

type LanguageCode = "en" | "default";

const messages: Record<LanguageCode, Record<string, string>> = {
    default: enErrorMessages,
    en: enErrorMessages,
};

export function getMessage(key: string, lang: LanguageCode = "default"): string {
    const langMessages = messages[lang] || messages.default;
    return (
        langMessages[key] ||
        messages.default[key] ||
        messages.default["NO_MESSAGE"] ||
        "Unknown error"
    );
}
