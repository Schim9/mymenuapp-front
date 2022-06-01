import {getCloudServerAddress} from "./storageService";

export enum HTTP_CODE {
    OK = 200
}

export enum HTTP_COMMAND {
    GET =1 ,
    POST = 2,
    PUT = 3,
    DELETE = 0
}

export async function callApi(command: HTTP_COMMAND, endpoint: string, param?: any): Promise<any> {
    try {
        let serverAddress: string = await getCloudServerAddress()

        switch (command) {
            case HTTP_COMMAND.GET:
                let responseGet = await fetch(
                    `${serverAddress}/api/${endpoint}/${param}`
                );
                return responseGet.json();
            case HTTP_COMMAND.POST:
                let responsePost = await fetch(`${serverAddress}/api/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(param as Object)
                });
                return responsePost.json();
            case HTTP_COMMAND.PUT:
                let responsePut = await fetch(`${serverAddress}/api/${endpoint}`, {
                    method: 'PUT',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(param as Object)
                });
                return responsePut.json();
            case HTTP_COMMAND.DELETE:
                let responseDelete = await fetch(`${serverAddress}/api/${endpoint}`, {
                    method: 'DELETE',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(param as Object)
                });
                return responseDelete.json();
            default:
                return Promise.reject(`Unknown HTTP Command: ${command}`);
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}


export async function testUrl(url: string): Promise<boolean> {
    try {

        let response = await fetch(
            `${url}/api/status`
        );
        let responseJson = await response.json();
        return response.status === HTTP_CODE.OK &&
            responseJson.appCode === "MY_MENU_APP";
    } catch (error) {
        console.error(error);
        return false;
    }
}

