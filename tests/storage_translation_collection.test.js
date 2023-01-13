import {StorageTranslation} from "../src/StorageTranslation";
import {StorageTranslationCollection} from "../src/StorageTranslationCollection";

const storageLithuanianTranslationsJson = {
    "promiscuous girl": "pasileidusi mergina",
    "bladee": "Dzordana Butkute"
};

const storageDutchTranslationsJson = {
    "promiscuous girl": "promiscue meisje",
    "bladee": "Waylon"
}

const storageLithuanianTranslations = new StorageTranslation("LT", storageLithuanianTranslationsJson);

const storageDutchTranslations = new StorageTranslation("NL", storageDutchTranslationsJson);

const storageTranslationCollection = new StorageTranslationCollection([
    storageLithuanianTranslations, storageDutchTranslations
]);

test('uniqueKeys returns only unique keys', () => {
    expect(storageTranslationCollection.uniqueKeys()).toEqual(["promiscuous girl", "bladee"]);
});

test('getTranslationResponseObject returns translation response for a given key', () => {
    expect(storageTranslationCollection.getTranslationResponseObject("promiscuous girl")).toMatchSnapshot();

    expect(storageTranslationCollection.getTranslationResponseObject("bladee")).toMatchSnapshot();
});