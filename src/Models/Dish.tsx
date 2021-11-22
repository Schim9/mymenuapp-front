export class Dish {

    static checkDishJsonFormat(obj: any) : boolean  {
        return (Array.isArray(obj) &&
            !obj.some((element: any) => (element.id  == null|| element.name == null ||
                (element.recipe && !Array.isArray(element.recipe) && !element.recipe.every((id: any) => typeof id === 'number')))))
    }

    id: number = 0;
    name: string = '';
    recipe: number[] = [];

    constructor(name: string = "", id: number = 0, recipe: number[] = []) {
        this.name = name;
        this.id = id;
        this.recipe = recipe;
    }

    updateRecipe([...ingredients]: number[]) {
        for (let ing of ingredients){
            this.recipe.push(ing);
        }
    }

}

Dish.prototype.toString = function dishToString() {
    return '' + this.name;
};