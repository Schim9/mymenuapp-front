import React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import * as actions from "../../../actions/actions";
import {displayToast, importData} from "../../../actions/actions";
import {ActionType} from "typesafe-actions";
import DICTIONARY, {ERROR, INFO} from "../../../services/storageService";
import {IonAlert, IonButton, IonContent, IonFooter, IonHeader, IonPage} from "@ionic/react";
import NavBar from "../../../Components/NavBar";
import {Ingredient} from "../../../Models/Ingredient";
import {Dish} from "../../../Models/Dish";
import {Menu} from "../../../Models/Menu";
import {Section} from "../../../Models/Section";

const mapStateToProps = () => {
    return { };
}


const mapDispatcherToProps = (dispatch: Dispatch<ActionType<typeof actions>>) => {
    return {
        displayToast: (type: string, message: string) => dispatch(actions.displayToast(type, message)),
        importData: (menus: Menu[],
                     dishes: Dish[],
                     ingredients: Ingredient[],
                     sections: Section[]) => dispatch(actions.importData(menus, dishes, ingredients, sections))
    }
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

class ImportPage extends React.Component<ReduxType> {

    state = {
        displayAlert: false,
        version: "",
        exportDate: "",
        lastEditionDate: "",
        ingredientList: [],
        dishesList: [],
        menuList: [],
        sectionList: []
    }

    resetState = () => {
        this.setState({
            version: "",
            exportDate: "",
            lastEditionDate: "",
            ingredientList: [],
            dishesList: [],
            menuList: [],
            sectionList: []
        });
    }

    handleFileSelection = (f: FileList) => {
        let currentFile = f.item(0) as File;

        const reader = new FileReader()
        reader.onload = async (read) => {
            let text: string = (read.target?.result) as string
            if (currentFile.type !== "application/json") {
                this.resetState();
                this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.INVALID_FILE_FORMAT);
            } else {
                let obj;
                try {
                    obj = JSON.parse(text);

                    if (!obj.sections || !Section.checkSectionJsonFormat(obj.sections)) {
                        this.resetState();
                        this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.INVALID_SECTION_LIST);
                    } else if (!obj.ingredients || !Ingredient.checkIngredientJsonFormat(obj.ingredients)) {
                        this.resetState();
                        this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.INVALID_INGREDIENT_LIST);
                    } else if  (!obj.dishes || !Dish.checkDishJsonFormat(obj.dishes)) {
                        this.resetState();
                        this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.INVALID_DISH_LIST);
                    } else if  (!obj.menus || !Menu.checkMenuJsonFormat(obj.menus)) {
                        this.resetState();
                        this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.INVALID_MENU_LIST);
                    } else{
                        this.setState({
                            version: obj.version,
                            exportDate: obj.export,
                            lastEditionDate: new Date(currentFile?.lastModified).toLocaleDateString() + " " +new Date(currentFile?.lastModified).toLocaleTimeString(),
                            ingredientList: obj.ingredients,
                            dishesList: obj.dishes,
                            menuList: obj.menus,
                            sectionList: obj.sections
                        });
                    }
                } catch (e) {
                    this.resetState();
                    this.props.displayToast(ERROR, DICTIONARY.db.ERROR_MESSAGE.INVALID_FILE_FORMAT);
                }


            }


        };
        reader.readAsText(currentFile)


    }

    render() {

        return <IonPage>
            <IonHeader>
                <NavBar title="IMPORT"
                        displayToast={this.props.displayToast}/>
            </IonHeader>

            <IonContent>
                <div>
                    <input type="file" onChange={ (e) => this.handleFileSelection(e.target.files as FileList) } />
                </div>
                <div>
                    <p>Version du fichier {this.state.version}</p>
                    <p>Date d'export {this.state.exportDate}</p>
                    <p>Date d'édition {this.state.lastEditionDate}</p>
                    <p>Nombre d'ingrédients  {this.state.ingredientList.length}</p>
                    <p>Nombre de recettes  {this.state.dishesList.length}</p>
                    <p>Nombre de menu  {this.state.menuList.length}</p>
                </div>
            </IonContent>
            <IonFooter>
                <IonButton disabled={this.state.version.trim().length===0}
                            size="large"
                           className="home-button"
                           onClick={() => this.setState({displayAlert: true})}
                           color="light">{DICTIONARY.db.import_page.IMPORT_BUTTON_LABEL}</IonButton>
            </IonFooter>
            <IonAlert
                isOpen={this.state.displayAlert}
                onDidDismiss={() => this.setState({displayAlert: false})}
                header={DICTIONARY.db.import_page.ALERT_TITLE}
                subHeader={DICTIONARY.db.import_page.ALERT_SUBTITLE}
                message={DICTIONARY.db.import_page.ALERT_MESSAGE}
                buttons={[
                    {
                        text: DICTIONARY.db.import_page.ALERT_DISMISS,
                        role: 'cancel',
                        cssClass: 'secondary'
                    },
                    {
                        text: DICTIONARY.db.import_page.ALERT_CONFIRM,
                        handler: () => {
                            this.props.importData(this.state.menuList,
                                this.state.dishesList,
                                this.state.ingredientList,
                                this.state.sectionList);
                            this.props.displayToast(INFO, DICTIONARY.db.INFO_MESSAGE.CHANGE_APPLIED);
                            this.resetState();
                        }
                    }
                ]}
            />
        </IonPage>
    }

}

export default connect(mapStateToProps, {displayToast, importData})(ImportPage);