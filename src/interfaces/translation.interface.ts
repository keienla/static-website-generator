export type Languages = "fr" | "en";
export type AdvancedLanguages = {dir: 'ltr' | 'rtl', lang: Languages}

export type Translation = Record<Languages, string>