import {IonContent, IonHeader, IonItem, IonList, IonPage} from '@ionic/react';
import React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import './ShoppingList.css';

import * as actions from "../../actions/actions";
import {displayToast} from "../../actions/actions";
import {IRootState} from "../../reducers";
import {ActionType} from "typesafe-actions";

import DICTIONARY from '../../services/storageService'
import {Ingredient} from "../../Models/Ingredient";
import NavBar from "../../Components/NavBar";
import {Dish} from "../../Models/Dish";

const mapStateToProps = ({menuReducer, dishReducer, ingredientReducer, sectionReducer}: IRootState) => {
    const {menuList} = menuReducer;
    const {dishList} = dishReducer;
    const {ingredientList} = ingredientReducer;
    const {sectionList} = sectionReducer;
    return {menuList, dishList, ingredientList, sectionList};
}


const mapDispatcherToProps = (dispatch: Dispatch<ActionType<typeof actions>>) => {
    return {displayToast: (type: string, message: string) => dispatch(actions.displayToast(type, message))}
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

class ShoppingListPage extends React.Component<ReduxType> {

    composeShoppingList = (): number[] => {
        let shoppingList: number[] = [];
        this.props.menuList.forEach(menu => {
            menu.lunchMeal.forEach(element => {
                if ((element as Dish).recipe) {
                    (element as Dish).recipe.forEach(recipe => {
                        if (!shoppingList.some(item => item === recipe)) {
                            shoppingList.push(recipe)
                        }
                    });
                } else {
                    if (!shoppingList.some(item => item === (element as Ingredient).id)) {
                        shoppingList.push((element as Ingredient).id)
                    }
                }
            });
            menu.dinnerMeal.forEach(element => {
                if ((element as Dish).recipe) {
                    (element as Dish).recipe.forEach(recipe => {
                        if (!shoppingList.some(item => item === recipe)) {
                            shoppingList.push(recipe)
                        }
                    });
                } else {
                    if (!shoppingList.some(item => item === (element as Ingredient).id)) {
                        shoppingList.push((element as Ingredient).id)
                    }
                }
            })
        });

        let newSet = new Set(shoppingList);
        return Array.from(newSet);
    }


    composeShoppingMap = (): Map<number, Ingredient[]> => {
        let shoppingList = this.composeShoppingList();
        let shoppingMap = new Map<number, Ingredient[]>();
        shoppingList.forEach(element => {
            let ingredient = this.props.ingredientList.filter(item => item.id === element)[0];
            if (ingredient.sectionId) {
                let arrayTmp = shoppingMap.get(ingredient.id);
                shoppingMap.set(ingredient.sectionId, [...(arrayTmp || []), ...[ingredient]]);
            } else {
                let arrayTmp = shoppingMap.get(0);
                shoppingMap.set(0, [...(arrayTmp || []), ...[ingredient]]);
            }
        })
        console.log("shoppingMap", shoppingMap);
        return shoppingMap;
    }

    renderSectionContentList = (ingList: Ingredient[],
                                key: number = 0,
                                sectionLabel: string = DICTIONARY.db.shoppinglist_page.UNCATEGORIZED) => {
        if (!ingList) {
            return [];
        } else {
            return (
                <div key={key}>
                    <IonItem className="shopping-list-item">
                        <h4>{sectionLabel}</h4>
                    </IonItem>
                    {
                        ingList.map((ing: Ingredient) => <IonItem key={key + "" + ing.id}
                                                                  className="shopping-list-item">{ing.name}</IonItem>)
                    }
                </div>
            )
        }
    }


    render() {

        //Sort all ingredient depending on their section
        let shoppingMap = this.composeShoppingMap() as Map<number, Ingredient[]>;
        //Prepare list of ingredients with no section
        let ingWithNoSection = shoppingMap.get(0) as Ingredient[];
        return (<IonPage>
            <IonHeader>
                <NavBar title={DICTIONARY.db.shoppinglist_page.PAGE_TITLE}
                        displayToast={this.props.displayToast}/>
            </IonHeader>
            <IonContent>
                <IonList className="shopping-list-item">
                    {this.renderSectionContentList(ingWithNoSection)}
                    {this.props.sectionList
                        .sort((a, b) => a.order - b.order)
                        .map(section => {
                                if (shoppingMap.has(section.id)) {
                                    let ingList = shoppingMap.get(section.id) as Ingredient[];
                                    return (this.renderSectionContentList(ingList, section.id, section.name))
                                } else {
                                    return []
                                }
                            }
                        )}
                </IonList>
            </IonContent>
        </IonPage>)
    }
}

export default connect(mapStateToProps, {displayToast})(ShoppingListPage);