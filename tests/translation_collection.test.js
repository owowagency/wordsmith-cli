import {Translation} from "../src/Translation";
import expect from "expect";
import {TranslationCollection} from "../src/TranslationCollection";

const dutchLithuanianTranslation = {
    "key": "promiscuous girl",
    "tags": [],
    "translationValues": [
        {
            "language": "NL",
            "value": "promiscue meisje"
        },
        {
            "language": "LT",
            "value": "pasileidusi mergina"
        }
    ]
}

const dutchTranslation = {
    "key": "bladee",
    "tags": [],
    "translationValues": [
        {
            "language": "NL",
            "value": "Waylon"
        },
    ]
}

const responseObject = [dutchLithuanianTranslation, dutchTranslation];

test('constructor creates translation collection from a response object', () => {

    let translationCollection = new TranslationCollection(responseObject);

    expect(translationCollection).toMatchSnapshot();
});

test('unique languages returns only unique languages', () => {

    let translationCollection = new TranslationCollection(responseObject);

    expect(translationCollection.uniqueLanguages()).toEqual(["NL", "LT"]);
});

test('getTranslationsForLanguage returns only translations for a given language', () => {

        let translationCollection = new TranslationCollection(responseObject);

        let lithuanianTranslations = translationCollection.getTranslationsForLanguage("LT");

        expect(lithuanianTranslations).toEqual([new Translation(dutchLithuanianTranslation)]);
});

test('toJson returns json with translations for each language', () => {

        let translationCollection = new TranslationCollection(responseObject);

        let languages = translationCollection.uniqueLanguages();

        languages.forEach(language => {
            expect(translationCollection.toJson(language)).toMatchSnapshot();
        });
});