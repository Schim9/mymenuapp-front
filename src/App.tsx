import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import {IonApp, IonRouterOutlet, IonToast} from '@ionic/react';
import {IonReactHashRouter} from '@ionic/react-router';
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
    syncDataFromBack
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

        getCloudServerAddress().then(serverAddress => {
                getCloudIdentifier().then(identifier => {
                    this.props.prepareCloudConfiguration(serverAddress, identifier);
                })
            }
        );

        syncDataFromBack(
            this.props.prepareIngredientList,
            this.props.prepareDishList,
            this.props.prepareMenuList,
            this.props.prepareSectionList,
        )
    }


    render() {
        return (
            <IonApp>
                <IonReactHashRouter>
                    <IonRouterOutlet>
                        <Route path="/home" component={Home} exact={true}/>
                        <Route path="/ingredients" component={IngredientsPage} strict={false} exact={false}/>
                        <Route path="/dishes" component={DishesPage} strict={false} exact={false}/>
                        <Route path="/section" component={SectionPage} exact={true}/>
                        <Route path="/menu" component={MenusPage} exact={true}/>
                        <Route path="/list" component={ShoppingList} exact={true}/>
                        <Route path="/import" component={ImportPage} exact={true}/>
                        <Route path="/cloud" component={CloudPage} exact={true}/>
                        <Route exact path="/" render={() => <Redirect to="/home"/>}/>
                    </IonRouterOutlet>
                </IonReactHashRouter>
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