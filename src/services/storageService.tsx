import React from 'react';


import dico_json from '../data/dictionary.json'
import {Ingredient} from "../Models/Ingredient";
import {Dish} from "../Models/Dish";
import {Menu} from "../Models/Menu";

import {Storage} from '@capacitor/storage';

import {FileSharer} from '@byteowls/capacitor-filesharer';
import {Section} from "../Models/Section";

export const ERROR: string = "danger";
export const INFO: string = "success";
export const LUNCH: string = "lunch";
export const DINNER: string = "dinner";

export enum Unit {
    GRAM = "GRAM",
    KILOGRAM = "KILOGRAM",
    PIECE = "PIECE",
    LITER = "LITER",
    CAN = "LITER"
}

export async function setIngredients(value: Ingredient[]): Promise<void> {
    await Storage.set({
        key: "ingredientList",
        value: JSON.stringify(value)
    });
}

export async function getIngredients(): Promise<Ingredient[]> {
    let newVar = await Storage.get({key: "ingredientList"}) as any;
    return JSON.parse(newVar.value);
}

export async function setDishes(value: Dish[]): Promise<void> {
    await Storage.set({
        key: "dishList",
        value: JSON.stringify(value)
    });
}

export async function getDishes(): Promise<Dish[]> {
    let newVar = await Storage.get({key: "dishList"}) as any;
    return JSON.parse(newVar.value);
}

export async function setSections(value: Section[]): Promise<void> {
    await Storage.set({
        key: "sectionList",
        value: JSON.stringify(value)
    });
}

export async function getSections(): Promise<Section[]> {
    let newVar = await Storage.get({key: "sectionList"}) as any;
    return JSON.parse(newVar.value);
}

export async function setMenus(value: Menu[]): Promise<void> {
    await Storage.set({
        key: "menuList",
        value: JSON.stringify(value)
    });
}

export async function getMenus(): Promise<Menu[]> {
    let newVar = await Storage.get({key: "menuList"}) as any;
    return JSON.parse(newVar.value);
}

export async function exportData(callback: any): Promise<void> {

    let date = new Date(),
        truncatedDate =  date.toISOString()
            .replace('-', '')
            .replace('-', '')
            .replace('T', '_')
            .replace(':', '')
            .replace(':', '')
            .substring(0,13),
        fileName = "MyExport_" + truncatedDate + ".json";

    Promise.all([Storage.get({key: "menuList"}),
        Storage.get({key: "dishList"}),
        Storage.get({key: "ingredientList"}),
        Storage.get({key: "sectionList"})])
        .then(([menus, dishes, ingredients, sections]) => {
            let jsonFile = "{\"version\": \"1.0.0\", " +
                "\"export\": \"" + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() + "\", " +
                "\"menus\": " + menus.value + ", " +
                "\"ingredients\": " + ingredients.value + ", " +
                "\"sections\": " + sections.value + ", " +
                "\"dishes\": " + dishes.value + "}";
            let objJsonB64 = Buffer.from(jsonFile).toString("base64");
            FileSharer.share({
                filename: fileName,
                base64Data: objJsonB64,
                contentType: " text/plain",
            }).then(() => {
                callback("cool ça marche", INFO);
            }).catch(() => callback("Ca marche pas", ERROR));
        });
}

class StorageService {
    static db = dico_json.fr;
}
export default StorageService;


