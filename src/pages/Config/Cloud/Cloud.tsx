import React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import * as actions from "../../../actions/actions";
import {displayToast, updateCloudConfiguration} from "../../../actions/actions";
import {ActionType} from "typesafe-actions";
import DICTIONARY, {INFO, ERROR} from "../../../services/storageService";
import { IonButton, IonContent, IonFooter, IonHeader, IonInput, IonPage} from "@ionic/react";
import NavBar from "../../../Components/NavBar";
//Style
import './Cloud.css';
import {IRootState} from "../../../reducers";

import {testUrl} from "../../../services/callApiService";

const mapStateToProps = ({configReducer}: IRootState) => {
    const { cloudServerAddress, cloudIdentifier } = configReducer
    return {cloudServerAddress, cloudIdentifier};
}

//TODO
// Test button for server address => healthcheck
// Generate random uuid as an identifier
// Backup prefered langage and store in ConfigReducer
// Save each update on cloud
// Implement fallback => in case cloud is unreachable
// Handle config in import/export
const mapDispatcherToProps = (dispatch: Dispatch<ActionType<typeof actions>>) => {
    return {
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
}

export default connect(mapStateToProps, {displayToast, updateCloudConfiguration})(CloudPage);