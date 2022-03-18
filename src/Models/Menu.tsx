import {Dish} from "./Dish";
import {MenuItem} from "./MenuItem";

export class Menu {

    static checkMenuJsonFormat(obj: any) : boolean  {
        return (Array.isArray(obj) &&
            !obj.some((element: any) => (!element.id || !element.name ||
                (element.lunchMeals && !Dish.checkDishJsonFormat(element.lunchMeals)) ||
                (element.dinnerMeals && !Dish.checkDishJsonFormat(element.dinnerMeals)) )))
    }


    name: string = '';
    date: string = '';
    lunchMeals: MenuItem[] = [];
    dinnerMeals: MenuItem[] = [];

    constructor(name: string = "", date: string = "", lunchMeals: MenuItem[] = [], dinnerMeals: MenuItem[] = []) {
        this.name = name;
        this.date = date;
        this.lunchMeals = lunchMeals;
        this.dinnerMeals = dinnerMeals;
    }
}
Menu.prototype.toString = function menuToString() {
    return '' + this.name;
}