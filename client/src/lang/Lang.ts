const promiseCache: Record<string, Promise<void>> = {};
const languageAliases: Record<string, string> = {
    en: 'en-US'
}
const supportedLanguages = ['en-US'];
const languageStrings: Record<string, Record<string, any>> = {};


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

const lookupMessageInLibrary = (keys: string[]): string => {
    let curObj = languageStrings[currentLang][keys[0]];
    for(let i = 1; i < keys.length; i++) {
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
        languageStrings[currentLang][lib] = json;
        delete promiseCache[lib];
    });
    promiseCache[lib] = promise;
    return promise;
}

export const localize = (message: string, replacements?: (Promise<string> | string)[]): Promise<string> => {
    const promises: Promise<void>[] = [];
    const messageArr = splitMessage(message);

    if (shouldLoadLibrary(messageArr[0])) {
        promises.push(loadLibrary(messageArr[0]));
    }

    let finalReplacements: string[] = new Array(replacements?.length);
    if(replacements) {
        for(let i = 0; i < replacements.length; i++) {
            const str = replacements[i];
            if (typeof str !== 'string') {
                promises.push(str.then((str) => {
                    finalReplacements[i] = str;
                }));
            } else {
                finalReplacements[i] = str;
            }
        }
    }

    return Promise.all(promises).then(() => {
        let localizedMessage = lookupMessageInLibrary(messageArr);
        for(let i = 0; i < finalReplacements.length; i++) {
            const placeholder = `\\{${i}\\}`;
            localizedMessage = localizedMessage.replace(new RegExp(placeholder), finalReplacements[i]);
        }
        return localizedMessage;
    });
}