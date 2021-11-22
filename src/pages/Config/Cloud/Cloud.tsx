import React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import * as actions from "../../../actions/actions";
import {displayToast, updateCloudConfiguration} from "../../../actions/actions";
import {ActionType} from "typesafe-actions";
import DICTIONARY from "../../../services/storageService";
import {IonButton, IonContent, IonFooter, IonHeader, IonInput, IonPage} from "@ionic/react";
import NavBar from "../../../Components/NavBar";
//Style
import './Cloud.css';
import {IRootState} from "../../../reducers";

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
                           color="light">{DICTIONARY.db.cloud_page.SAVE_BUTTON_LABEL}</IonButton>
            </IonFooter>
        </IonPage>
    }

}

export default connect(mapStateToProps, {displayToast, updateCloudConfiguration})(CloudPage);