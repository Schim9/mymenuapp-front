//React
import React from 'react';
//Redux
import {connect} from "react-redux";
import {Dispatch} from 'redux';
//Ionic
import {
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonPage,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonTextarea
} from '@ionic/react';
//Style
import './Ingredients.css';

import * as actions from "../../../actions/actions";
import {addIngredient, displayToast, removeIngredient, updateIngredient} from "../../../actions/actions";
import {IRootState} from "../../../reducers";
import {ActionType} from "typesafe-actions";
import {Ingredient} from "../../../Models/Ingredient";
import {closeCircleOutline, save, trash} from "ionicons/icons";
import {Dish} from "../../../Models/Dish";

import DICTIONARY, {ERROR, INFO} from '../../../services/storageService';
import NavBar from "../../../Components/NavBar";
import {Menu} from "../../../Models/Menu";

const mapStateToProps = ({ingredientReducer, dishReducer, sectionReducer, menuReducer}: IRootState) => {
    const {ingredientList} = ingredientReducer;
    const {dishList} = dishReducer;
    const {sectionList} = sectionReducer;
    const {menuList} = menuReducer;
    return {ingredientList, dishList, sectionList, menuList};
}


const mapDispatcherToProps = (dispatch: Dispatch<ActionType<typeof actions>>) => {
    return {
        removeIngredient: (item: Ingredient) => dispatch(actions.removeIngredient(item)),
        updateIngredient: (item: Ingredient) => dispatch(actions.updateIngredient(item)),
        addIngredient: (item: Ingredient) => dispatch(actions.addIngredient(item)),
        displayToast: (type: string, message: string) => dispatch(actions.displayToast(type, message))
    }
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;


class IngredientsPage extends React.Component<ReduxType> {

    state = {
        currentIngredient: new Ingredient(),
        deleteMode: false,
        displayModal: false,
        filter: "",
        label: ""
    }

    resetState = () => {
        this.setState({
            currentIngredient: new Ingredient(),
            deleteMode: false,
            displayModal: false
        })
    }

    handleFilterChange = (str: string) => {
        this.setState({filter: str});
    }

    handleAddIngredient = (newLabel: string, ingredientSectionTmp: number) => {
        if (newLabel.trim() === "") {
            this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.MANDATORY_VALUE)
        } else {
            let elementFound: boolean = this.props.ingredientList.some(elt => elt.name.trim().toUpperCase() === newLabel.toUpperCase());
            if (elementFound) {
                this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.VALUE_ALREADY_EXIST);
            } else {
                let newElement = new Ingredient(newLabel,
                    this.props.ingredientList.length + 1, ingredientSectionTmp)
                this.props.addIngredient(newElement);
                this.props.displayToast(INFO, DICTIONARY.db.INFO_MESSAGE.ELEMENT_CREATED)
                this.resetState();
            }
        }
    }

    handleUpdateIngredient = (newLabel: string, ingredientSectionTmp: number) => {
        console.log("ingredientSectionTmp", ingredientSectionTmp);
        let newElement = new Ingredient(newLabel,
            this.state.currentIngredient.id, ingredientSectionTmp)
        this.props.updateIngredient(newElement);
        this.props.displayToast(INFO, DICTIONARY.db.INFO_MESSAGE.CHANGE_APPLIED)
        this.resetState()
    }

    handleDeleteIngredient = () => {
        let listLinkDish = this.checkIngredientIsNotUsed()
        let listLinkMenu = this.checkIngredientIsNotPlanned();
        if (listLinkDish.length > 0) {
            this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.VALUE_ALREADY_USED + listLinkDish.toString());
        } else if (listLinkMenu.length > 0) {
            this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.VALUE_ALREADY_PLANNED + listLinkMenu.toString());
        } else {
            this.props.removeIngredient(this.state.currentIngredient);
            this.props.displayToast(INFO, DICTIONARY.db.INFO_MESSAGE.ELEMENT_DELETED)
            this.resetState()
        }
    }

    handleSegmentSelect = (e: any) => {
        let newIngredient = Object.assign({}, this.state.currentIngredient);
        newIngredient.sectionId = this.props.sectionList.filter(elt => elt.id.toString() === e.detail.value)[0]?.id;
        this.setState({
            currentIngredient: newIngredient
        })
    }

    checkIngredientIsNotUsed = (): Dish[] => {
        let linkedDish: Dish[] = [];
        this.props.dishList.forEach(dish => {
            let b = dish.recipe.some(ing => ing === this.state.currentIngredient.id);
            if (b) {
                linkedDish.push(dish)
            }
        })
        return linkedDish;
    }

    checkIngredientIsNotPlanned = (): Menu[] => {
        let linkedMenu: Menu[] = [];
        this.props.menuList.forEach(menu => {
            let plannedForLunch = menu.lunchMeal.some(menuItem => !(menuItem as Dish).recipe &&
                menuItem.id === this.state.currentIngredient.id);
            let plannedForDinner = menu.dinnerMeal.some(menuItem => !(menuItem as Dish).recipe &&
                menuItem.id === this.state.currentIngredient.id);
            if (plannedForLunch || plannedForDinner) {
                linkedMenu.push(menu);
            }
        })
        return linkedMenu;
    }


    getSectionName = (sectionId: number) => {
        if (sectionId > 0) {
            return this.props.sectionList.filter(item => item.id === sectionId)[0]?.name;
        } else {
            return "";
        }
    }

    renderIngredients = () => {
        if (this.props.ingredientList.length === 0) {
            return (<IonLabel>{DICTIONARY.db.INFO_MESSAGE.NO_ELEMENT}</IonLabel>)
        } else {
            return (
                <IonList className="list-ingredient">
                    {this.props.ingredientList
                        .filter(elt => elt.name.toLowerCase().indexOf(this.state.filter.toString().toLowerCase()) >= 0)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(item => {
                            return (
                                <IonItem onClick={() => this.setState({displayModal: true, currentIngredient: item})}
                                         key={item.id} className="list-ingredient">
                                    <IonLabel className="list-ingredient">{item.name}</IonLabel>
                                    <IonLabel
                                        className="list-ingredient">{this.getSectionName(item.sectionId)}</IonLabel>
                                </IonItem>
                            )
                        })}

                </IonList>
            )
        }
    }

    renderModal() {

        let ingredientNameTmp = this.state.currentIngredient.name.trim();
        let ingredientSectionTmp: number = this.state.currentIngredient?.sectionId;
        let icon = "/assets/icon/app/ic_ing_ajout.png";
        let modalTitle = DICTIONARY.db.ingredient_page.MODAL_ADD;
        let mainButtonLabel = save;
        let displayDeleteButton = false;
        let clickAction = () => this.handleAddIngredient(ingredientNameTmp, ingredientSectionTmp)
        if (this.state.deleteMode) {
            icon = "/assets/icon/app/ic_ing_suppr.png";
            modalTitle = DICTIONARY.db.ingredient_page.MODAL_DELETE;
            mainButtonLabel = trash;
            //Delete button won't be displayed. The "delete" action
            //is handled by the main button
            displayDeleteButton = false;
            clickAction = () => this.handleDeleteIngredient()
        } else if (ingredientNameTmp.length > 0) {
            icon = "/assets/icon/app/ic_ing_modif.png";
            modalTitle = DICTIONARY.db.ingredient_page.MODAL_UPDATE;
            mainButtonLabel = save;
            displayDeleteButton = true;
            clickAction = () => this.handleUpdateIngredient(ingredientNameTmp, ingredientSectionTmp)
        }
        return (
            <IonModal
                isOpen={this.state.displayModal}
                onDidDismiss={() => {
                    this.resetState();
                }}>
                <IonItem className="flex-container">
                    <img src={icon} height="40px" alt={icon}/>
                    <div className="title">{modalTitle}</div>
                </IonItem>
                <IonItem className="modal-content">
                    <IonTextarea placeholder={DICTIONARY.db.ingredient_page.NAME_PLACEHOLDER}
                                 readonly={this.state.deleteMode}
                                 disabled={this.state.deleteMode}
                                 value={ingredientNameTmp}
                                 onIonChange={e => ingredientNameTmp = (e.target as HTMLInputElement).value}>

                    </IonTextarea>
                </IonItem>

                <IonItem>
                    <IonLabel>Section</IonLabel>
                    <IonSelect  value={ingredientSectionTmp?.toString()} onIonChange={val => ingredientSectionTmp = Number((val.target as HTMLInputElement).value)}>
                        <IonSelectOption key={0} value="0">Undefined</IonSelectOption>
                        {
                            this.props.sectionList.map(section =>
                                <IonSelectOption key={section.id} value={""+section.id}>{section.name}</IonSelectOption>
                            )
                        }
                    </IonSelect>
                </IonItem>
                <IonItem className="flex-container">
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
                                   deleteMode: false,
                                   currentIngredient: new Ingredient()
                               })}>
                        <IonIcon icon={closeCircleOutline}/>
                    </IonButton>
                </IonItem>
            </IonModal>
        )
    }

    render() {

        return (
            <IonPage>
                <IonHeader>
                    <NavBar title={DICTIONARY.db.ingredient_page.PAGE_TITLE}
                            displayToast={this.props.displayToast}/>
                </IonHeader>

                <IonContent forceOverscroll={false}>
                    <IonButton onClick={() => this.setState({displayModal: true, currentIngredient: new Ingredient()})}
                               expand='block' color="light">{DICTIONARY.db.ingredient_page.ADD_BUTTON_LABEL}</IonButton>
                    <IonSearchbar onIonChange={e => this.handleFilterChange((e.target as HTMLInputElement).value)}
                                  placeholder={DICTIONARY.db.ingredient_page.FILTER_PLACEHOLDER}
                                  showCancelButton="focus"> </IonSearchbar>
                    {this.renderIngredients()}
                    {this.renderModal()}
                </IonContent>
            </IonPage>
        );
    }
}

export default connect(mapStateToProps, {
    removeIngredient,
    addIngredient,
    updateIngredient,
    displayToast
})(IngredientsPage);