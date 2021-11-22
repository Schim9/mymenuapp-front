import React from 'react';
import {Dispatch} from 'redux';
import {IonButton, IonCardSubtitle, IonContent, IonFooter, IonHeader, IonImg, IonItem, IonPage} from '@ionic/react';

import DICTIONARY from '../../services/storageService'
import './Home.css';

import dico_json from '../../data/dictionary.json'
import NavBar from "../../Components/NavBar";
import {connect} from "react-redux";
import * as actions from "../../actions/actions";
import {displayToast} from "../../actions/actions";
import {ActionType} from "typesafe-actions";


const mapStateToProps = () => {
    return {};
}


const mapDispatcherToProps = (dispatch: Dispatch<ActionType<typeof actions>>) => {
    return {
        displayToast: (type: string, message: string) => dispatch(actions.displayToast(type, message))
    }
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

class HomePage extends React.Component<ReduxType> {

    iconFr = "/assets/flags/fr32.png";
    iconEn = "/assets/flags/en32.png";
    iconLu = "/assets/flags/lu32.png";

    // Used to force refresh on click
    state = {
        test: true
    };

    handleChangeLangage = (lang: String) => {
        if (lang === "fr") {
            DICTIONARY.db = dico_json.fr;
        } else  if (lang === "en") {
            DICTIONARY.db = dico_json.en;
        } else {
            DICTIONARY.db = dico_json.lu;
        }
        this.setState({test: !this.state.test});
    }


    render() {
        return (
            <IonPage>
                <IonHeader>
                    <NavBar title={DICTIONARY.db.home_page.PAGE_TITLE}
                    displayToast={this.props.displayToast}/>
                </IonHeader>
                <IonContent>
                    <br/>
                    <br/>
                    <div className="div-center no-background">
                        <IonButton color="light" onClick={() => this.handleChangeLangage("fr")}>
                            <IonImg src={this.iconFr}/>
                        </IonButton>
                        <IonButton color="light" onClick={() => this.handleChangeLangage("en")}>
                            <IonImg src={this.iconEn}/>
                        </IonButton>
                        <IonButton color="light" onClick={() => this.handleChangeLangage("lu")}>
                            <IonImg src={this.iconLu}/>
                        </IonButton>
                    </div>
                    <br/>
                    <br/>
                    <IonItem className="no-background" lines="none">
                        <div dangerouslySetInnerHTML={{__html: DICTIONARY.db.home_page.DESCRIPTION}}/>
                    </IonItem>
                </IonContent>
                <IonFooter>
                    <IonButton routerLink="/menu"
                               size="large"
                               className="home-button"
                               color="light">{DICTIONARY.db.home_page.MENU_BUTTON_LABEL}</IonButton>
                    <IonButton routerLink="/list"
                               size="large"
                               className="home-button"
                               color="light">{DICTIONARY.db.home_page.SHOPPING_LIST_BUTTON_LABEL}</IonButton>
                    <IonCardSubtitle color='white'>menu v0.0.17-SNAPSHOT</IonCardSubtitle>
                </IonFooter>
            </IonPage>);
    }
}

export default connect(mapStateToProps, {displayToast})(HomePage);
