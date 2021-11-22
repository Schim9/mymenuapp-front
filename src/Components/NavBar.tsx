import React from "react";
import {book, cart, cloud, cloudDownload, cloudUpload, home, map, menu, nutrition, restaurant} from "ionicons/icons";
import {IonButton, IonButtons, IonIcon, IonItem, IonLabel, IonList, IonModal, IonTitle, IonToolbar} from "@ionic/react";
import DICTIONARY, {exportData} from "../services/storageService";

import './NavBar.css';

class NavBar extends React.Component<NavBarProps> {

    static defaultProps = { displayToast: () => console.log("Default click")};

    state = {
        displayModal: false
    }


    renderModal = () => {

        return (
            <IonModal
                cssClass={"navbar-modal"}
                isOpen={this.state.displayModal}
                onDidDismiss={() => {
                    this.setState({displayModal: false});
                }}>

                <IonList>
                    <IonItem onClick={() => this.setState({displayModal: false})} routerLink="/home">
                        <IonIcon icon={home}/>
                        <IonLabel className="nav-element">{DICTIONARY.db.navbar.HOME_PAGE_BUTTON_LABEL}</IonLabel>
                    </IonItem>
                    <IonItem onClick={() => this.setState({displayModal: false})} routerLink="/menu">
                        <IonIcon icon={book}/>
                        <IonLabel className="nav-element">{DICTIONARY.db.home_page.MENU_BUTTON_LABEL}</IonLabel>
                    </IonItem>
                    <IonItem onClick={() => this.setState({displayModal: false})} routerLink="/list">
                        <IonIcon icon={cart}/>
                        <IonLabel className="nav-element">{DICTIONARY.db.home_page.SHOPPING_LIST_BUTTON_LABEL}</IonLabel>
                    </IonItem>
                    <IonItem onClick={() => this.setState({displayModal: false})} routerLink="/ingredients">
                        <IonIcon icon={nutrition}/>
                        <IonLabel className="nav-element">{DICTIONARY.db.navbar.INGREDIENT_BUTTON_LABEL}</IonLabel>
                    </IonItem>
                    <IonItem routerLink="/dishes"  onClick={() => this.setState({displayModal: false})}>
                        <IonIcon icon={restaurant}/>
                        <IonLabel className="nav-element">{DICTIONARY.db.navbar.DISH_BUTTON_LABEL}</IonLabel>
                    </IonItem>
                    <IonItem routerLink="/section" onClick={() => this.setState({displayModal: false})}>
                        <IonIcon icon={map}/>
                        <IonLabel className="nav-element">{DICTIONARY.db.navbar.SECTION_BUTTON_LABEL}</IonLabel>
                    </IonItem>
                    <IonItem routerLink="/cloud" onClick={() => this.setState({displayModal: false})}>
                        <IonIcon icon={cloud}/>
                        <IonLabel className="nav-element">{DICTIONARY.db.navbar.CLOUD_BUTTON_LABEL}</IonLabel>
                    </IonItem>
                    <IonItem onClick={() => this.setState({displayModal: false}, () => exportData(this.props.displayToast))}>
                        <IonIcon icon={cloudUpload}/>
                        <IonLabel className="nav-element">{DICTIONARY.db.navbar.EXPORT_DATA}</IonLabel>
                    </IonItem>
                    <IonItem  routerLink="/import" onClick={() => this.setState({displayModal: false})}>
                        <IonIcon icon={cloudDownload}/>
                        <IonLabel className="nav-element">{DICTIONARY.db.navbar.IMPORT_DATA}</IonLabel>
                    </IonItem>
                </IonList>
            </IonModal>
        )
    }

    render() {
        return (
            <IonToolbar>
                <IonButtons slot="start">
                    <IonButton slot="end"
                               expand='block'
                               onClick={() => this.setState({displayModal: true})}>
                        <IonIcon icon={menu}/>
                    </IonButton>
                </IonButtons>
                <IonTitle>{this.props.title}</IonTitle>
                {this.renderModal()}
            </IonToolbar>
        )
    }


}

type NavBarProps = {
    title: string,
    displayToast: any
}


export default NavBar;
