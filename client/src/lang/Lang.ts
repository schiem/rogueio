const promiseCache: Record<string, Promise<void>> = {};
const languageAliases: Record<string, string> = {
    en: 'en-US'
}
const supportedLanguages = ['en-US'];
const languageStrings: Record<string, any> = {};


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

const lookupMessageInLibrary = (keys: string[]): string => {
    let curObj = languageStrings[currentLang];
    for(let i = 0; i < keys.length; i++) {
        curObj = curObj[keys[i]];
    }
    return curObj;
}

const splitMessage = (message: string): string[] => {
    return message.split('/');
}

export const loadLibrary = (lib: string): Promise<void> => {
    if (!languageStrings[currentLang]) {
        languageStrings[currentLang] =  {};
    }

    if (promiseCache[lib] !== undefined) {
        return promiseCache[lib];
    }

    const url = `/dist/assets/lang/${currentLang}/${lib}.json`;
    const promise = fetch(url).then(resp => resp.json()).then((json: Record<string, string>) => {
        languageStrings[currentLang] = json;
        delete promiseCache[lib];
    });
    promiseCache[lib] = promise;
    return promise;
}

export const loadLang = (): Promise<void> => {
    return loadLibrary('common');
}

const regex = new RegExp(/\{(\d+)\}/g);
export const localize = (message: string, replacements?: string[]): string => {
    const messageArr = splitMessage(message);

    let localizedMessage = lookupMessageInLibrary(messageArr);
    if (replacements?.length) {
        localizedMessage = localizedMessage.replace(regex, (_, capture) => {
            const idx = parseInt(capture);
            return replacements[idx];
        });
    }
    return localizedMessage;
}