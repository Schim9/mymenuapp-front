import {
    IonButton,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonPage,
    IonSearchbar
} from '@ionic/react';
import React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import './Dishes.css';

import * as actions from "../../../actions/actions";
import {addDish, displayToast, removeDish, updateDish} from "../../../actions/actions";
import {IRootState} from "../../../reducers";
import {ActionType} from "typesafe-actions";
import {Dish} from "../../../Models/Dish";

import {closeCircleOutline, create, save, trash} from 'ionicons/icons';

import DICTIONARY, {ERROR, INFO} from '../../../services/storageService';
import NavBar from "../../../Components/NavBar";
import {Menu} from "../../../Models/Menu";

const mapStateToProps = ({ingredientReducer, dishReducer, menuReducer}: IRootState) => {
    const {ingredientList} = ingredientReducer;
    const {dishList} = dishReducer;
    const {menuList} = menuReducer;
    return {ingredientList, dishList, menuList};
}


const mapDispatcherToProps = (dispatch: Dispatch<ActionType<typeof actions>>) => {
    return {
        addDish: (element: Dish) => dispatch(actions.addDish(element)),
        updateDish: (element: Dish) => dispatch(actions.updateDish(element)),
        removeDish: (element: Dish) => dispatch(actions.removeDish(element)),
        displayToast: (type: string, message: string) => dispatch(actions.displayToast(type, message))
    }
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

class DishesPage extends React.Component<ReduxType> {

    state = {
        currentDish: new Dish(),
        deleteMode: false,
        displayModal: false,
        editMode: false,
        filter: "",
        label: ""
    }

    resetState = () => {
        this.setState({
            currentDish: new Dish(),
            deleteMode: false,
            displayModal: false,
            editMode: false,
        })
    }

    handleFilterChange = (str: string) => {
        this.setState({filter: str});
    }

    handleCheckBoxChange(event: any) {
        let selectedIngredient = this.props.ingredientList.find(ing => ing.id.toString() === event.target.value)!;
        if (event.target.checked) {
            this.state.currentDish.recipe.push(selectedIngredient.id);
        } else {
            let elementToRemove = this.state.currentDish.recipe.findIndex(element => element === selectedIngredient.id);
            this.state.currentDish.recipe.splice(elementToRemove, 1);
        }
    }

    handleAddDish(dishName: string) {
        if (dishName.trim() === "") {
            this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.MANDATORY_VALUE)
        } else {
            let elementFound: boolean = this.props.dishList.some(elt => elt.name.trim() === dishName);
            if (elementFound) {
                this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.VALUE_ALREADY_EXIST);
            } else {
                let newDish = new Dish(dishName, this.props.dishList.length + 1, this.state.currentDish.recipe);
                this.props.addDish(newDish);
                this.props.displayToast(INFO, DICTIONARY.db.INFO_MESSAGE.ELEMENT_CREATED);
                this.resetState();
            }
        }
    }

    handleUpdateDish(newDishName: string) {
        let newElement = new Dish(newDishName,
            this.state.currentDish.id,
            this.state.currentDish.recipe)
        this.props.updateDish(newElement);
        this.props.displayToast(INFO, DICTIONARY.db.INFO_MESSAGE.CHANGE_APPLIED)
        this.resetState()
    }

    handleDeleteDish = () => {
        let listLinkMenu = this.checkDishIsNotPlanned()
        if (listLinkMenu.length > 0) {
            this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.VALUE_ALREADY_PLANNED + listLinkMenu.toString());
        } else {
            this.props.removeDish(this.state.currentDish);
            this.props.displayToast(INFO, DICTIONARY.db.INFO_MESSAGE.ELEMENT_DELETED);
            this.resetState();
        }
    }

    checkDishIsNotPlanned = (): Menu[] => {
        let linkedMenu: Menu[] = [];
        this.props.menuList.forEach(menu => {
            let plannedForLunch = menu.lunchMeal.some(menuItem => !!(menuItem as Dish).recipe &&
                menuItem.id === this.state.currentDish.id);
            let plannedForDinner = menu.dinnerMeal.some(menuItem => !!(menuItem as Dish).recipe &&
                menuItem.id === this.state.currentDish.id);
            if (plannedForLunch || plannedForDinner) {
                linkedMenu.push(menu);
            }
        })
        return linkedMenu;
    }

    renderDishes = () => {
        if (this.props.dishList.length === 0) {
            return (<IonLabel>{DICTIONARY.db.INFO_MESSAGE.NO_ELEMENT}</IonLabel>)
        } else {
            return (
                <IonList className="list-dish">
                    {this.props.dishList
                        .filter(elt => elt.name.toLowerCase().indexOf(this.state.filter.toString().toLowerCase()) >= 0)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(item => {
                            return (
                                <IonItem onClick={() => this.setState({displayModal: true, currentDish: item})}
                                         key={item.id} className="list-dish">
                                    <IonLabel className="list-dish">{item.name}</IonLabel>
                                </IonItem>
                            )
                        })}

                </IonList>
            )
        }
    }

    renderIngredients() {

        if (this.state.editMode || this.state.currentDish.id === 0) {
            return (
                <IonList className="list-checkable-ingredient">
                    {this.props.ingredientList
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(item => {
                            return (
                                <IonItem key={item.id}>
                                    <IonLabel>{item.name}</IonLabel>
                                    <IonCheckbox
                                        checked={this.state.currentDish.recipe.some(element => item.id === element)}
                                        onClick={(e) => this.handleCheckBoxChange(e)}
                                        value={item.id.toString()}/>
                                </IonItem>
                            )
                        })}
                </IonList>
            )
        } else {
            console.log("currentDish==", this.state.currentDish);
            return (
                <IonList>
                    {this.props.ingredientList
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .filter(ing => this.state.currentDish.recipe.some(element => ing.id === element))
                        .map(item => {
                            return (
                                <IonItem key={item.id}>
                                    <IonLabel>{item.name}</IonLabel>
                                </IonItem>
                            )
                        })}
                </IonList>
            )
        }
    }

    renderModal() {
        let textValue = this.state.currentDish.name.trim();
        let icon = "/assets/icon/app/ic_ing_ajout.png";
        let modalTitle = DICTIONARY.db.dish_page.MODAL_ADD;
        let mainButtonLabel = save;
        let displayDeleteButton = false;
        let clickAction = () => console.log("click");

        if (this.state.deleteMode) {
            icon = "/assets/icon/app/ic_plat_suppr.png";
            modalTitle = DICTIONARY.db.dish_page.MODAL_DELETE;
            mainButtonLabel = trash;
            //Delete button won't be displayed. The "delete" action
            //is handled by the main button
            displayDeleteButton = false;
            clickAction = () => this.handleDeleteDish()
        } else if (this.state.editMode) {
            icon = "/assets/icon/app/ic_plat_modif.png";
            modalTitle = DICTIONARY.db.dish_page.MODAL_UPDATE;
            mainButtonLabel = save;
            displayDeleteButton = false;
            clickAction = () => this.handleUpdateDish(textValue)
        } else if (this.state.currentDish.id === 0) {
            icon = "/assets/icon/app/ic_plat_ajout.png";
            modalTitle = DICTIONARY.db.dish_page.MODAL_ADD;
            mainButtonLabel = save;
            displayDeleteButton = false;
            clickAction = () => this.handleAddDish(textValue)
        } else {
            icon = "/assets/icon/app/ic_plat.png";
            modalTitle = DICTIONARY.db.dish_page.MODAL_DETAIL;
            mainButtonLabel = create;
            displayDeleteButton = true;
            clickAction = () => this.setState({editMode: true})
        }
        return (
            <IonModal  isOpen={this.state.displayModal}
                      onDidDismiss={() => this.resetState()}>
                <div className="flex-container">
                    <img src={icon} height="40px" alt={icon}/>
                    <div className="title">{modalTitle}</div>
                </div>
                <IonInput placeholder={DICTIONARY.db.dish_page.NAME_PLACEHOLDER}
                          readonly={!this.state.editMode && this.state.currentDish.id !== 0}
                          disabled={!this.state.editMode && this.state.currentDish.id !== 0}
                          value={textValue}
                          onIonChange={e => textValue = (e.target as HTMLInputElement).value}
                          clearInput>
                </IonInput>

                <div className="list-checkable-ingredient">
                    {this.renderIngredients()}
                </div>
                <div className="flex-container">
                    <IonButton slot="end"
                               expand='block'
                               color="light"
                               onClick={clickAction}>
                        <IonIcon icon={mainButtonLabel}/>
                    </IonButton>
                    {
                        displayDeleteButton ?
                            <IonButton slot="end"
                                       expand='block'
                                       color="light"
                                       onClick={() => this.setState({
                                           deleteMode: true
                                       })}>
                                <IonIcon icon={trash}/>
                            </IonButton>
                            : []
                    }
                    <IonButton slot="end"
                               expand='block'
                               color="light"
                               onClick={() => this.setState({
                                   displayModal: false,
                                   editMode: false,
                                   deleteMode: false,
                                   currentDish: new Dish()
                               })}>
                        <IonIcon icon={closeCircleOutline}/>
                    </IonButton>
                </div>

            </IonModal>
        )
    }

    render() {

        return <IonPage>
            <IonHeader>
                <NavBar title={DICTIONARY.db.dish_page.PAGE_TITLE}
                        displayToast={this.props.displayToast}/>
            </IonHeader>

            <IonContent>
                <IonButton onClick={() => this.setState({displayModal: true})} expand='block'
                           color="light">{DICTIONARY.db.dish_page.ADD_BUTTON_LABEL}</IonButton>
                <IonSearchbar onIonChange={e => this.handleFilterChange((e.target as HTMLInputElement).value)}
                              placeholder={DICTIONARY.db.dish_page.FILTER_PLACEHOLDER}
                              showCancelButton="focus"> </IonSearchbar>
                {this.renderDishes()}
                {this.renderModal()}
            </IonContent>
        </IonPage>
    }
}

export default connect(mapStateToProps, {addDish, updateDish, removeDish, displayToast})(DishesPage);