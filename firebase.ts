import { addTimeout, to } from "xm-rn-utils";

import { getApp } from '@react-native-firebase/app'
import {
    deleteToken, getMessaging, isDeviceRegisteredForRemoteMessages,
    registerDeviceForRemoteMessages
} from '@react-native-firebase/messaging'
import { getAnalytics } from '@react-native-firebase/analytics'
import { Platform } from "react-native";



export const getMessagingID = async () => {
    const app = getApp();
    const messaging = getMessaging(app)
    if (Platform.OS == "ios" && !isDeviceRegisteredForRemoteMessages(messaging)) {
        await registerDeviceForRemoteMessages(messaging);
    }
    const token = await messaging.getToken()
    return token;
}

const getFirebaseAnalyticsID = async () => {
    const app = getApp();
    const analytics = getAnalytics(app);
    const token = await analytics.getAppInstanceId()
    return token;
}





export const deleteFirebaseMessagingToken = addTimeout(
    () => {
        const app = getApp();
        const messaging = getMessaging(app);
        return deleteToken(messaging);
    }
)



/**
 * 提供接口需要的推送token和归因id
 */

export const getFirebaseTokens = async () => {
    let info: Partial<{
        deviceToken: string | null | undefined
        appInstanceId: string | null | undefined
    }> = {}

    let [error, deviceToken] = await to(getMessagingID)()
    if (!error) {
        info = {
            ...info,
            deviceToken
        }
    }
    let [_error2, appInstanceId] = await to(getFirebaseAnalyticsID)()
    if (!_error2) {
        info = {
            ...info,
            appInstanceId
        }
    }
    return info;
}





