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

import DICTIONARY, {DINNER, ERROR, INFO, LUNCH} from '../../services/storageService'
import NavBar from "../../Components/NavBar";
import {MenuItem} from "../../Models/MenuItem";
import {callApi, HTTP_COMMAND} from "../../services/callApiService";

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

    input = React.createRef<HTMLInputElement>();

    state = {
        currentMeal: [] as MenuItem[],
        currentMenu: new Menu(),
        currentMenuDetail: "",
        displayMenu: new Map<string, boolean>() as Map<string, boolean>,
        displayModal: false,
        filter: "",
        label: ""
    }

    componentDidMount() {
        // Waiting a few milliseconds for the render to be done
        setTimeout(() => {
            if (!!this.input && !!this.input.current) {
                // Scroll to current date menu
                // @ts-ignore
                this.input.current.scrollIntoView();
            }
            }, 2000)
    }

    componentDidUpdate() {
        if (!!this.input && !!this.input.current) {
            // Scroll to current date menu
            // @ts-ignore
            this.input.current.scrollIntoView();
        }
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
            return this.state.currentMenu.lunchMeals;
        } else {
            return this.state.currentMenu.dinnerMeals;
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

    handleUpdateMenu = () => {
        let newMenu = new Menu(
            this.state.currentMenu.name,
            this.state.currentMenu.date,
            (this.state.currentMenuDetail === LUNCH ? this.state.currentMeal : this.state.currentMenu.lunchMeals),
            (this.state.currentMenuDetail === DINNER ? this.state.currentMeal : this.state.currentMenu.dinnerMeals)
        );
        callApi(HTTP_COMMAND.PUT, 'menus', newMenu)
            .then(() => {
                this.props.updateMenu(newMenu);
            })
            .then(() => {
                this.props.displayToast(INFO, DICTIONARY.db.INFO_MESSAGE.CHANGE_APPLIED)
                this.resetState()
            })
            .catch(err => {
                console.log('error', err)
                this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.OPERATION_FAILED);
            });
    }

    displayLunchMenu = (item: Menu) => {
        return (
            <IonItem
                key={"lunch" + item.date}
                onClick={() => this.setState({
                    displayModal: true,
                    currentMenu: Object.assign({}, item),
                    currentMenuDetail: LUNCH,
                    currentMeal: item.lunchMeals
                })}
                lines="none"
                className="list-menu ion-text-center">
                <IonLabel>
                    <h4>{DICTIONARY.db.menu_page.LIST_LUNCH}</h4>
                    {item.lunchMeals.length <= 0 ? <IonLabel> </IonLabel> :
                        item.lunchMeals.map(menuItem => {
                            return (
                                <IonLabel
                                    key={"lunch" + item.date + menuItem.id}>{this.getMenuItemName(menuItem)}</IonLabel>
                            )
                        })}
                </IonLabel>
            </IonItem>
        )
    }

    displayDinnerMenu = (item: Menu) => {
        return (
            <IonItem
                key={"dinner" + item.date}
                onClick={() => this.setState({
                    displayModal: true,
                    currentMenu: Object.assign({}, item),
                    currentMenuDetail: DINNER,
                    currentMeal: item.dinnerMeals
                })}
                lines="none"
                className="list-menu  ion-text-center">
                <IonLabel className="list-menu">
                    <h4>{DICTIONARY.db.menu_page.LIST_DINNER}</h4>
                    {item.dinnerMeals.length <= 0 ? <IonLabel> </IonLabel> :
                        item.dinnerMeals.map(menuItem => {
                            return (
                                <IonLabel
                                    key={"dinner" + item.date + menuItem.id}>{this.getMenuItemName(menuItem)}</IonLabel>
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
        let formatTwoDigits = (digit: number) => ("0" + digit).slice(-2);
        const today = new Date();
        const currentDateString = `${today.getFullYear()}-${formatTwoDigits(today.getMonth()+1)}-${formatTwoDigits(today.getDate())}`;
        return (
            <div>
                {this.props.menuList
                    .map(item => {
                        let icon = this.state.displayMenu.has(item.date) && this.state.displayMenu.get(item.date)?caretUpOutline:caretDownOutline
                        return (
                            <div key={item.date} ref={item.date === currentDateString ? this.input : null}>
                                <IonItem
                                    className="menu-header"
                                    color={item.name.toLowerCase()}
                                    onClick={() => {
                                        let updatedMap = this.state.displayMenu;
                                        updatedMap.set(item.date,  !this.state.displayMenu.get(item.date));
                                        this.setState({displayMenu: updatedMap});
                                    }}
                                >
                                    <IonIcon icon={icon} />
                                    <IonLabel>
                                        <IonText>
                                            <h3>{this.defineMenuTitle(item)}</h3>
                                        </IonText>
                                    </IonLabel>
                                </IonItem>
                                {!this.state.displayMenu.get(item.date) ?

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
        let clickAction = () => this.handleUpdateMenu();

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
                    <img src={icon} height="40px" alt={icon}/>
                    <div className="title">{DICTIONARY.db.menu_page.MODAL_CHOOSE}</div>
                </div>
                <IonList className="list-checkable-ingredient">
                    {menuElements
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(item => {
                            let key;
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

    private defineMenuTitle(item: Menu) {
        switch (item.name) {
            case "MONDAY" :
                return `${DICTIONARY.db.MONDAY} ${item.date}`
            case "TUESDAY" :
                return `${DICTIONARY.db.TUESDAY} ${item.date}`
            case "WEDNESDAY" :
                return `${DICTIONARY.db.WEDNESDAY} ${item.date}`
            case "THURSDAY" :
                return `${DICTIONARY.db.THURSDAY} ${item.date}`
            case "FRIDAY" :
                return `${DICTIONARY.db.FRIDAY} ${item.date}`
            case "SATURDAY" :
                return `${DICTIONARY.db.SATURDAY} ${item.date}`
            case "SUNDAY" :
                return `${DICTIONARY.db.SUNDAY} ${item.date}`
            default:
                return `${item.name} ${item.date}`

        }
    }
}

export default connect(mapStateToProps, {updateMenu, displayToast})(MenusPage);