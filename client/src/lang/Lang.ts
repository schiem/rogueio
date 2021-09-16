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
    const promise = fetch(url).then(resp => resp.json()).then((json: Record<string, string>) => {
        languageStrings[currentLang][lib] = json;
        delete promiseCache[lib];
    });
    promiseCache[lib] = promise;
    return promise;
}

const lookupMessageInLibrary = (lib: string, key: string): string => {
    return languageStrings[currentLang][lib][key];
}

const splitMessage = (message: string): string[] => {
    return message.split('/');
}

export const localize = (message: string, replacements?: string[]): Promise<string> => {
    const promises: Promise<void>[] = [];
    if (replacements) {
        replacements.unshift(message);
    } else {
        replacements = [message];
    }

    const splitReplacements: string[][] = [];
    for(let i = -1; i < splitReplacements.length; i++) {
        let str: string;
        if (i === -1) {
            str = message;
        } else {
            str = replacements[i];
        }
        const split = splitMessage(str);
        splitReplacements.push(split);

        if (shouldLoadLibrary(split[0])) {
            promises.push(loadLibrary(split[0]));
        }
    }

    let localizedMessage = lookupMessageInLibrary(splitReplacements[0][0], splitReplacements[0][1]);
    return Promise.all(promises).then(() => {
        for(let i = 1; i < splitReplacements.length; i++) {
            const placeholder = `\\{${i}\\}`;
            const localizedReplacement = lookupMessageInLibrary(splitReplacements[i][0], splitReplacements[i][1]);
            localizedMessage = message.replace(new RegExp(placeholder), localizedReplacement);
        }
        return localizedMessage;
    });
}