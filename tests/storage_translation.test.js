import {StorageTranslation} from "../src/StorageTranslation";
import expect from "expect";

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

test('constructor creates storage translation from translations json', () => {
        expect(storageLithuanianTranslations).toMatchSnapshot();

        expect(storageDutchTranslations).toMatchSnapshot();
});

test('keys returns all keys', () => {
        expect(storageLithuanianTranslations.keys()).toEqual(["promiscuous girl", "bladee"]);
});

test('get translation value returns translation value for a given key', () => {
        expect(storageLithuanianTranslations.getTranslationValue("promiscuous girl"))
            .toEqual("pasileidusi mergina");

        expect(storageDutchTranslations.getTranslationValue("promiscuous girl"))
            .toEqual("promiscue meisje");
});

