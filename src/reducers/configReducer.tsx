import {INIT_CLOUD_CONFIG, UPDATE_CLOUD_CONFIG} from "../actions/actions";
import {InitialState, initialStateImpl} from "./index";
import {setCloudIdentifier, setCloudServerAddress} from "../services/storageService";


export function configReducer(state: InitialState = initialStateImpl, action: any): InitialState {
    switch (action.type) {
        case INIT_CLOUD_CONFIG:
            return Object.assign(
                {},
                state,
                {
                    cloudServerAddress: action.data.cloudServerAddress,
                    cloudIdentifier: action.data.cloudIdentifier
                });
        case UPDATE_CLOUD_CONFIG:
            state.cloudServerAddress = action.data.cloudServerAddress;
            state.cloudIdentifier = action.data.cloudIdentifier;
            setCloudServerAddress(action.data.cloudServerAddress);
            setCloudIdentifier(action.data.cloudIdentifier);
            return state;
        default:
            return state;
    }
}

