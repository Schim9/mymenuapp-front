import React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import * as actions from "../../../actions/actions";
import {
    displayToast,
    prepareDishList,
    prepareIngredientList, prepareMenuList,
    prepareSectionList,
    updateCloudConfiguration
} from "../../../actions/actions";
import {ActionType} from "typesafe-actions";
import DICTIONARY, {INFO, ERROR, syncDataFromBack} from "../../../services/storageService";
import { IonButton, IonContent, IonFooter, IonHeader, IonInput, IonPage} from "@ionic/react";
import NavBar from "../../../Components/NavBar";
//Style
import './Cloud.css';
import {IRootState} from "../../../reducers";

import {testUrl} from "../../../services/callApiService";
import {Ingredient} from "../../../Models/Ingredient";
import {Dish} from "../../../Models/Dish";
import {Section} from "../../../Models/Section";
import {Menu} from "../../../Models/Menu";

const mapStateToProps = ({configReducer}: IRootState) => {
    const { cloudServerAddress, cloudIdentifier } = configReducer
    return {cloudServerAddress, cloudIdentifier};
}

const mapDispatcherToProps = (dispatch: Dispatch<ActionType<typeof actions>>) => {
    return {
        prepareIngredientList: (element: Ingredient[]) => dispatch(actions.prepareIngredientList(element)),
        prepareDishList: (element: Dish[]) => dispatch(actions.prepareDishList(element)),
        prepareSectionList: (element: Section[]) => dispatch(actions.prepareSectionList(element)),
        prepareMenuList: (element: Menu[]) => dispatch(actions.prepareMenuList(element)),
        updateCloudConfiguration: (address: string, identifier: string) => dispatch(actions.updateCloudConfiguration(address, identifier)),
        displayToast: (type: string, message: string) => dispatch(actions.displayToast(type, message))
    }
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

class CloudPage extends React.Component<ReduxType> {

    state = {
        displayAlert: false,
        serverAddress: this.props.cloudServerAddress,
        identifier: this.props.cloudIdentifier
    }

    resetState = () => {
        this.setState({
            serverAddress: "",
            identifier: ""
        });
    }


    render() {

        return <IonPage>
            <IonHeader>
                <NavBar title={DICTIONARY.db.cloud_page.TITLE}
                        displayToast={this.props.displayToast}/>
            </IonHeader>

            <IonContent>
                <h1>{DICTIONARY.db.cloud_page.SERVER}</h1>
                <IonInput
                    className="cloud-input"
                    placeholder={DICTIONARY.db.cloud_page.SERVER}
                    value={this.state.serverAddress}
                    onIonChange={(e) => this.setState({serverAddress: (e.target as HTMLInputElement).value})}
                    clearInput
                />
                <IonButton size="large"
                           onClick={() => this.checkServerUrl()}
                           expand='block'
                           color="light">{DICTIONARY.db.cloud_page.TEST_BUTTON_LABEL}
                </IonButton>
                <IonButton size="large"
                           onClick={() => this.syncDataAfterCloudConfUpdate()}
                           expand='block'
                           color="light">{DICTIONARY.db.cloud_page.SYNC_BUTTON_LABEL}
                </IonButton>
                <h1>{DICTIONARY.db.cloud_page.IDENTIFIANT}</h1>
                <IonInput
                    className="cloud-input"
                    placeholder={DICTIONARY.db.cloud_page.IDENTIFIANT}
                    value={this.state.identifier}
                    onIonChange={(e) => this.setState({identifier: (e.target as HTMLInputElement).value})}
                    clearInput
                />
            </IonContent>
            <IonFooter>
                <IonButton size="large"
                           onClick={() => {
                               this.props.updateCloudConfiguration(
                                   this.state.serverAddress,
                                   this.state.identifier)
                               this.setState({displayAlert: true})
                           }}
                           expand='block'
                           color="light">{DICTIONARY.db.cloud_page.SAVE_BUTTON_LABEL}
                </IonButton>
            </IonFooter>
        </IonPage>
    }

    private checkServerUrl = () => {
        testUrl(this.state.serverAddress).then(checkResult => {
            if (checkResult) {
                this.props.displayToast(INFO, DICTIONARY.db.INFO_MESSAGE.CLOUD_URL_IS_OK);
            } else {
                this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.CLOUD_URL_IS_KO);
            }
        })
    }

    private syncDataAfterCloudConfUpdate = () => {
        syncDataFromBack(
            this.props.prepareIngredientList,
            this.props.prepareDishList,
            this.props.prepareMenuList,
            this.props.prepareSectionList,
        );
    }
}

export default connect(mapStateToProps, {
    prepareIngredientList,
    prepareDishList,
    prepareSectionList,
    prepareMenuList,
    displayToast,
    updateCloudConfiguration
})(CloudPage);