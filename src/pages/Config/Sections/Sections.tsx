//React
import React, {Component} from 'react';
//Redux
import {connect} from "react-redux";
import {Dispatch} from 'redux';
//Ionic
import {
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonPage,
    IonReorder,
    IonReorderGroup
} from '@ionic/react';
import {ItemReorderEventDetail} from '@ionic/core';

import * as actions from "../../../actions/actions";
import {displayToast, updateSections} from "../../../actions/actions";
import {IRootState} from "../../../reducers";
import {ActionType} from "typesafe-actions";

import DICTIONARY from '../../../services/storageService';
import NavBar from "../../../Components/NavBar";
import {Section} from "../../../Models/Section";
import {swapHorizontal, arrowBack, arrowForward} from "ionicons/icons";
//Style
import './Sections.css';

const mapStateToProps = ({sectionReducer}: IRootState) => {
    const {sectionList} = sectionReducer;
    return {sectionList};
}


const mapDispatcherToProps = (dispatch: Dispatch<ActionType<typeof actions>>) => {
    return {
        updateSections: (sections: Section[]) => dispatch(actions.updateSections(sections)),
        displayToast: (type: string, message: string) => dispatch(actions.displayToast(type, message))
    }
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;


class SectionPage extends React.Component<ReduxType> {

    state = {
        currentSection: new Section(),
        editMode: false,
        displayModal: false,
        label: ""
    }

    resetState = () => {
        this.setState({
            currentSection: new Section(),
            editMode: false,
            displayModal: false
        })
    }

    handleFilterChange = (str: string) => {
        this.setState({filter: str});
    }


    doReorder = (event: CustomEvent<ItemReorderEventDetail>) =>  {
        // The `from` and `to` properties contain the index of the item
        // when the drag started and ended, respectively
        //console.log('Dragged from index', event.detail.from, 'to', event.detail.to);
        //console.log('complete', this.props.sectionList);
        // Finish the reorder and position the item in the DOM based on
        // where the gesture ended. This method can also be called directly
        // by the reorder group
        let complete: Section[] = event.detail.complete( this.props.sectionList);

        complete.map((element, index) => {
            element.order = index;
        })
        this.props.updateSections(complete);
    }

    renderSections = () => {
        if (this.props.sectionList.length == 0) {
            return (<IonLabel>{DICTIONARY.db.INFO_MESSAGE.NO_ELEMENT}</IonLabel>)
        } else {
            return (
                // move / repeat
                <IonReorderGroup disabled={this.state.editMode} onIonItemReorder={this.doReorder}>
                    {this.props.sectionList
                        .sort((a, b) => (a.order - b.order))
                        .map(item => {
                            let icon = item.order===0?arrowForward:item.order===this.props.sectionList.length-1?arrowBack:swapHorizontal
                            return (
                                <IonReorder key={item.id}>
                                    <IonItem>
                                        <IonIcon className={"rotate-90"} icon={icon} />
                                        <IonLabel>{item.name}</IonLabel>
                                    </IonItem>
                                </IonReorder>
                            )
                        })}

                </IonReorderGroup>
            )
        }
    }

    render() {

        return (
            <IonPage>
                <IonHeader>
                    <NavBar title={DICTIONARY.db.section_page.PAGE_TITLE}
                            displayToast={this.props.displayToast}/>
                </IonHeader>

                <IonContent forceOverscroll={false}>
                    <IonButton onClick={() => this.setState({displayModal: true, currentSection: new Section()})}
                               expand='block' color="light">{DICTIONARY.db.ingredient_page.ADD_BUTTON_LABEL}</IonButton>
                    {this.renderSections()}
                </IonContent>
            </IonPage>
        );
    }
}

export default connect(mapStateToProps, {displayToast, updateSections})(SectionPage);