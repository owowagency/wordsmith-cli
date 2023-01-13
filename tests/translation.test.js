import {Translation} from "../src/Translation";
import expect from "expect";

const translationResponseObject = {
    "key": "promiscuous girl",
    "tags": [],
    "translationValues": [
        {
            "language": "NL",
            "value": "promiscue meisje"
        },
        {
            "language": "RU",
            "value": "распутная девчонка"
        },
        {
            "language": "LT",
            "value": "pasileidusi mergina"
        }
    ]
};

test('constructor creates translation from a response object', () => {
    let translation = new Translation(translationResponseObject);

    expect(translation).toMatchSnapshot();
});