import {
    IonButton,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonPage,
    IonText
} from '@ionic/react';
import React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import './Menus.css';

import * as actions from "../../actions/actions";
import {displayToast, updateMenu} from "../../actions/actions";
import {IRootState} from "../../reducers";
import {ActionType} from "typesafe-actions";
import {Menu} from "../../Models/Menu";
import {caretDownOutline, caretUpOutline, closeCircleOutline, save} from "ionicons/icons";
import {Dish} from "../../Models/Dish";

import DICTIONARY, {DINNER, INFO, LUNCH} from '../../services/storageService'
import NavBar from "../../Components/NavBar";
import {MenuItem} from "../../Models/MenuItem";

const mapStateToProps = ({menuReducer, dishReducer, ingredientReducer}: IRootState) => {
    const {menuList} = menuReducer;
    const {dishList} = dishReducer;
    const {ingredientList} = ingredientReducer;
    return {menuList, dishList, ingredientList};
}


const mapDispatcherToProps = (dispatch: Dispatch<ActionType<typeof actions>>) => {
    return {
        updateMenu: (element: Menu) => dispatch(actions.updateMenu(element)),
        displayToast: (type: string, message: string) => dispatch(actions.displayToast(type, message))
    }
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

class MenusPage extends React.Component<ReduxType> {


    state = {
        currentMeal: [] as MenuItem[],
        currentMenu: new Menu(),
        currentMenuDetail: "",
        displayMenu: new Map<number, boolean>() as Map<number, boolean>,
        displayModal: false,
        filter: "",
        label: ""
    }

    resetState = () => {
        this.setState({
            currentMeal: [],
            currentMenu: new Menu(),
            currentMenuDetail: "",
            displayModal: false
        })
    }

    getSelectedMeal = (): MenuItem[] => {
        if (this.state.currentMenuDetail === LUNCH) {
            return this.state.currentMenu.lunchMeal;
        } else {
            return this.state.currentMenu.dinnerMeal;
        }
    }

    handleFilterChange = (str: string) => {
        this.setState({filter: str});
    }

    handleCheckBoxChange(event: any, selectedElement: MenuItem) {

        if (!event.target.checked) {
            let elementToRemove = this.state.currentMeal.findIndex(element => element === selectedElement);
            this.state.currentMeal.splice(elementToRemove, 1);
        } else {
            this.state.currentMeal.push(selectedElement);
        }
    }

    handleUpdatMenu = () => {
        let newMenu = new Menu(this.state.currentMenu.name,
            this.state.currentMenu.id,
            this.state.currentMenu.color,
            (this.state.currentMenuDetail === LUNCH ? this.state.currentMeal : this.state.currentMenu.lunchMeal),
            (this.state.currentMenuDetail === DINNER ? this.state.currentMeal : this.state.currentMenu.dinnerMeal)
        );
        this.props.updateMenu(newMenu);
        this.props.displayToast(INFO, DICTIONARY.db.INFO_MESSAGE.CHANGE_APPLIED)
        this.resetState()
    }

    displayLunchMenu = (item: Menu) => {
        return (
            <IonItem
                key={"lunch" + item.id}
                onClick={() => this.setState({
                    displayModal: true,
                    currentMenu: Object.assign({}, item),
                    currentMenuDetail: LUNCH,
                    currentMeal: item.lunchMeal
                })}
                lines="none"
                className="list-menu ion-text-center">
                <IonLabel>
                    <h4>{DICTIONARY.db.menu_page.LIST_LUNCH}</h4>
                    {item.lunchMeal.length <= 0 ? <IonLabel> </IonLabel> :
                        item.lunchMeal.map(menuItem => {
                            return (
                                <IonLabel
                                    key={"lunch" + item.id + menuItem.id}>{this.getMenuItemName(menuItem)}</IonLabel>
                            )
                        })}
                </IonLabel>
            </IonItem>
        )
    }

    displayDinnerMenu = (item: Menu) => {
        return (
            <IonItem
                key={"dinner" + item.id}
                onClick={() => this.setState({
                    displayModal: true,
                    currentMenu: Object.assign({}, item),
                    currentMenuDetail: DINNER,
                    currentMeal: item.dinnerMeal
                })}
                lines="none"
                className="list-menu  ion-text-center">
                <IonLabel className="list-menu">
                    <h4>{DICTIONARY.db.menu_page.LIST_DINNER}</h4>
                    {item.dinnerMeal.length <= 0 ? <IonLabel> </IonLabel> :
                        item.dinnerMeal.map(menuItem => {
                            return (
                                <IonLabel
                                    key={"dinner" + item.id + menuItem.id}>{this.getMenuItemName(menuItem)}</IonLabel>
                            )
                        })}
                </IonLabel>
            </IonItem>
        )
    }

    getMenuItemName = (menuItem: MenuItem) => {
        if ((menuItem as Dish).recipe) {
            return this.props.dishList.filter(item => item.id === menuItem.id)[0].name;
        } else {
            return this.props.ingredientList.filter(item => item.id === menuItem.id)[0].name;
        }
    }

    renderMenu = () => {
        return (
            <div>
                {this.props.menuList
                    .map(item => {

                        let icon = this.state.displayMenu.has(item.id) && this.state.displayMenu.get(item.id)?caretUpOutline:caretDownOutline
                        return (
                            <div key={item.id}>
                                <IonItem
                                    color="light"
                                    onClick={() => {
                                        let updatedMap = this.state.displayMenu;
                                        updatedMap.set(item.id,  !this.state.displayMenu.get(item.id));
                                        this.setState({displayMenu: updatedMap});
                                    }}
                                >
                                    <IonIcon icon={icon} />
                                    <IonLabel>
                                        <IonText>
                                            <h3>{item.name}</h3>
                                        </IonText>
                                    </IonLabel>
                                </IonItem>
                                {this.state.displayMenu.get(item.id) ?

                                    <div className="flex-menu-container">
                                        {this.displayLunchMenu(item)}
                                        {this.displayDinnerMenu(item)}
                                    </div>
                                    : []
                                }
                            </div>
                        )
                    })}
            </div>
        )

    }

    renderModal = () => {
        let icon = "/assets/icon/app/ic_plat.png";
        let clickAction = () => this.handleUpdatMenu();

        let menuElements: MenuItem[] = [];
        this.props.dishList.forEach(dish => menuElements.push(dish))
        this.props.ingredientList.forEach(ingredient => menuElements.push(ingredient))

        return (
            <IonModal
                isOpen={this.state.displayModal}
                onDidDismiss={() => {
                    this.resetState();
                }}>
                <div className="flex-container">
                    <img src={icon} height="40px"/>
                    <div className="title">{DICTIONARY.db.menu_page.MODAL_CHOOSE}</div>
                </div>
                <IonList className="list-checkable-ingredient">
                    {menuElements
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(item => {
                            let key = "";
                            if ((item as Dish).recipe) {
                                key = "dish" + item.id;
                            } else {
                                key = "ing" + item.id;
                            }

                            return (
                                <IonItem key={key}>
                                    <IonLabel>{item.name}</IonLabel>
                                    <IonCheckbox
                                        checked={
                                            this.getSelectedMeal().some(element => item.id === element.id &&
                                                this.getMenuItemName(item) === this.getMenuItemName(element))
                                        }
                                        onClick={(e) => this.handleCheckBoxChange(e, item)}
                                        value={item.id.toString()}/>
                                </IonItem>
                            )
                        })}
                </IonList>
                <div className="flex-container">
                    <IonButton slot="end"
                               expand='block'
                               color="light"
                               onClick={clickAction}>
                        <IonIcon icon={save}/>
                    </IonButton>
                    <IonButton slot="end"
                               expand='block'
                               color="light"
                               onClick={() => this.resetState()}>
                        <IonIcon icon={closeCircleOutline}/>
                    </IonButton>
                </div>
            </IonModal>
        )
    }

    render() {

        return <IonPage>
            <IonHeader>
                <NavBar title={DICTIONARY.db.menu_page.PAGE_TITLE}
                        displayToast={this.props.displayToast}/>
            </IonHeader>
            <IonContent>
                {this.renderMenu()}
                {this.renderModal()}
            </IonContent>
        </IonPage>
    }
}

export default connect(mapStateToProps, {updateMenu, displayToast})(MenusPage);