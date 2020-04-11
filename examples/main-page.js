import {observable} from "mobx";
import {defineUiBlock} from "../core/ui-block";
import {loadTemplates} from "../core/load-templates";
import './params-page/params-page';

const fakeRequest = () => {
    return Promise.resolve("MADE FAKER REQUEST");
}

defineUiBlock(`our-box`, async() => {
    const test = observable({id: 'cool', name: 'yolo'});
    const stringBind = observable.box('OMG NICE EXAMPLE');
    const checkBoxBind = observable.box(true);
    const items = observable.array([
        {
            id: 'yo',
            name: 1
        },
        {
            id: 'lo',
            name: 2
        },
        {
            id: 3,
            name: 3
        }
    ]);

    const initalData= await fakeRequest();

    const fakeData = observable.box(initalData);

    console.log(items)

    const alertMe = (e) => console.log(e, test.value);
    const remove = (e, item) => {
        items.splice(items.indexOf(item), 1)
    };
    const setTest = (e, id, name) => {
        if (id && name) {
            test.id = e.target.value;
            test.name = name;
        } else {
            test.name =id;
        }
    };
    const toggleCheckbox = () => checkBoxBind.set(!checkBoxBind.value);

    const pushItem = () => items.push({id: Date.now(), name: 'OMG'});

    setInterval(() => {
        // items.push({id: Date.now(), name: 'OMFG'})
    }, 500);

    return {
        toggleCheckbox,
        remove,
        checkBoxBind,
        pushItem,
        items,
        fakeData,
        test,
        stringBind,
        setTest,
        alertMe
    }
});

loadTemplates();
