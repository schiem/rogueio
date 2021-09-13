const promiseCache: Record<string, Promise<void>> = {};
const languageAliases: Record<string, string> = {
    en: 'en-US'
}
const supportedLanguages = ['en-US'];

// {language: { category: {key: value}}}
const languageStrings: Record<string, Record<string, Record<string, string>>> = {};

const getNormalizedLang = (): string => {
    let lang: string = navigator.language || (navigator as any).userLanguage;
    if (supportedLanguages.indexOf(lang) === -1) {
        lang = 'en-US';
    }

    if (languageAliases[lang]) {
        return languageAliases[lang];
    }

    return lang;
}
const currentLang = getNormalizedLang();

const shouldLoadLibrary = (lib: string): boolean => {
    if (languageStrings[currentLang]?.[lib]) {
        return false;
    }
    return true;
}

const loadLibrary = (lib: string): Promise<void> => {
    if (!languageStrings[currentLang]) {
        languageStrings[currentLang] =  {};
    }

    if (promiseCache[lib] !== undefined) {
        return promiseCache[lib];
    }

    const url = `/assets/lang/${currentLang}/${lib}.json`;
    const promise = fetch(url).then(resp => resp.json()).then(json => {
        languageStrings[currentLang][lib] = json;
        delete promiseCache[lib];
    });
    promiseCache[lib] = promise;
    return promise;
}

export const localize = (message: string, placeholders?: string[]): Promise<string> {
}