import {observable} from "mobx";
import {createUiBlock} from "../core/ui-block";

const fakeRequest = () => {
    return Promise.resolve("MADE FAKER REQUEST");
}

createUiBlock(`our-box`, async() => {
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
    const deepItem = observable({
        id: 1,
        item: {
            id: 2,
            item: {
                id: 3
            }
        }
    })

    //lazy loading
    await import('./params-page/params-page');


    const initalData= await fakeRequest();

    const fakeData = observable.box(initalData);

    console.log(deepItem)

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
    const updateFirst=  () => items[0].id = Date.now();
    const setDeepItem = (e) => {
        deepItem.item.item.id = e.target.value;
    }
    const getText = () => {
        return deepItem.item.item.id;
    }

    // setInterval(() => {
    //     items.push({id: Date.now()+items.length, name: 'OMFG'})
    // }, 2000);
    //
    // // setInterval(() => {
    // //     items[0].name = Date.now()+' YAY';
    // // }, 500);

    const afterRender = () => {
        console.log('done rendring!')
    }

    return {
        getText,
        setDeepItem,
        afterRender,
        deepItem,
        updateFirst,
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
