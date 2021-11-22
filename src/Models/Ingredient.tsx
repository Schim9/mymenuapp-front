import {Unit} from "../services/storageService";

export class Ingredient {

    static checkIngredientJsonFormat(obj: any) : boolean  {
        return (Array.isArray(obj) &&
            !obj.some((element: any) =>  !element.id || !element.name));
    }

    id: number = 0;
    name: string = '';
    unit: Unit = Unit.PIECE;
    sectionId: number;

    constructor(name: string = "", id: number = 0, sectionId: number = 0, unit: Unit = Unit.PIECE) {
        this.id = id;
        this.name = name;
        this.sectionId = sectionId
        this.unit = unit;
    }
}


