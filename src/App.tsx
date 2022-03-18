import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import {IonApp, IonRouterOutlet, IonToast} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import Home from './pages/Home/Home';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
/* Theme variables */
import './theme/variables.css';
import './theme/customStyle.css';
import DishesPage from "./pages/Config/Dishes/Dishes";
import ImportPage from "./pages/Config/Import/Import";
import IngredientsPage from "./pages/Config/Ingredients/Ingredients";
import SectionPage from "./pages/Config/Sections/Sections";
import MenusPage from "./pages/Menus/Menus";
import ShoppingList from "./pages/ShoppingList/ShoppingList";
import CloudPage from "./pages/Config/Cloud/Cloud";

import {
    getCloudIdentifier,
    getCloudServerAddress,
    getDishes,
    getIngredients,
    getMenus,
    getSections,
    setDishes,
    setIngredients,
    setMenus
} from "./services/storageService";
import {Dish} from "./Models/Dish";
import {IRootState} from "./reducers";
import {ActionType} from "typesafe-actions";
import * as actions from "./actions/actions";
import {
    hideToast,
    prepareCloudConfiguration,
    prepareDishList,
    prepareIngredientList,
    prepareMenuList,
    prepareSectionList
} from "./actions/actions";
import {connect} from "react-redux";
import {Dispatch} from 'redux';
import {Ingredient} from "./Models/Ingredient";
import {Menu} from "./Models/Menu";
import {Section} from "./Models/Section";
import {callApi, HTTP_COMMAND} from "./services/callApiService";

const mapStateToProps = ({notificationReducer}: IRootState) => {
    const {displayToast, toastMessage, toastType} = notificationReducer;
    return {displayToast, toastMessage, toastType};
}


const mapDispatcherToProps = (dispatch: Dispatch<ActionType<typeof actions>>) => {
    return {
        prepareIngredientList: (element: Ingredient[]) => dispatch(actions.prepareIngredientList(element)),
        prepareDishList: (element: Dish[]) => dispatch(actions.prepareDishList(element)),
        prepareSectionList: (element: Section[]) => dispatch(actions.prepareSectionList(element)),
        prepareMenuList: (element: Menu[]) => dispatch(actions.prepareMenuList(element)),
        prepareCloudConfiguration: ((serverAddress: string, identifier: string) => dispatch(actions.prepareCloudConfiguration(serverAddress,identifier))),
        hideToast: () => dispatch(actions.hideToast())
    }
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

class App extends React.Component<ReduxType> {

    componentDidMount() {
        // Get ingredients from API
        callApi(HTTP_COMMAND.GET, 'ingredients', '')
            .then(apiIngredients => {
                // Save ingredients in localStorage
                setIngredients(apiIngredients)
                // Init cache
                this.props.prepareIngredientList(apiIngredients)
            }, (error => {
                console.log('ERROR while getting ingredients', error)
                // Get ingredients from LocalStorage
                getIngredients()
                    // Init cache
                    .then(localStorageIngredients =>  this.props.prepareIngredientList(localStorageIngredients))
            }))

        callApi(HTTP_COMMAND.GET, 'dishes', '')
            .then(apiDishes => {
                // Save dishes in localStorage
                setDishes(apiDishes)
                // Init cache
                this.props.prepareDishList(apiDishes)
            }, (error => {
                console.log('ERROR while getting dishes', error)
                // Get dishes from LocalStorage
                getDishes()
                    // Init cache
                    .then(localStorageDishes =>  this.props.prepareDishList(localStorageDishes))
            }))
        callApi(HTTP_COMMAND.GET, 'menus', '')
            .then(apiMenus => {
                // Save menus in localStorage
                setMenus(apiMenus)
                // Init cache
                this.props.prepareMenuList(apiMenus)
            }, (error => {
                console.log('ERROR while getting menus', error)
                // Get menus from LocalStorage
                getMenus()
                    // Init cache
                    .then(localStorageMenus =>  this.props.prepareMenuList(localStorageMenus))
            }))

        // TODO Handle sections on API's side
        getSections().then(value => {
                if (value === null) {
                    value = [
                        new Section("Conserves", 0, 1),
                        new Section("Pâtes et riz", 1, 2),
                        new Section("Fruits et Légumes", 2, 3),
                        new Section("Petit déjeuner", 3, 4),
                        new Section("Surgelés", 4, 5),
                        new Section("Rayon frais", 5, 6),
                        new Section("Liquides", 6, 7),
                        new Section("Viandes et poissons", 7, 8),
                        new Section("Epice", 8, 9)
                    ];
                }
                this.props.prepareSectionList(value);
            }
        );

        getCloudServerAddress().then(serverAddress => {
            getCloudIdentifier().then(identifier => {
                this.props.prepareCloudConfiguration(serverAddress, identifier);
            })
            }
        );

    }


    render() {
        return (
            <IonApp>
                <IonReactRouter>
                    <IonRouterOutlet>
                        <Route path="/home" component={Home} exact={true}/>
                        <Route path="/ingredients" component={IngredientsPage} exact={true}/>
                        <Route path="/dishes" component={DishesPage} exact={true}/>
                        <Route path="/section" component={SectionPage} exact={true}/>
                        <Route path="/menu" component={MenusPage} exact={true}/>
                        <Route path="/list" component={ShoppingList} exact={true}/>
                        <Route path="/import" component={ImportPage} exact={true}/>
                        <Route path="/cloud" component={CloudPage} exact={true}/>
                        <Route exact path="/" render={() => <Redirect to="/home"/>}/>
                    </IonRouterOutlet>
                </IonReactRouter>
                <IonToast
                     isOpen={this.props.displayToast}
                     onDidDismiss={this.props.hideToast}
                     message={this.props.toastMessage}
                     color={this.props.toastType}
                    duration={2000}
                />
            </IonApp>
        )
    }


}

export default connect(mapStateToProps, {
    prepareIngredientList,
    prepareDishList,
    prepareSectionList,
    prepareMenuList,
    prepareCloudConfiguration,
    hideToast})(App);
