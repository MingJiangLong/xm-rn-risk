import { Platform } from "react-native"
import { PermissionCode } from "xm-rn-permissions"
import { buildIOSContactInfo } from "./build-contact"
import { buildIOSDeviceInfo } from "./build-device-info"
import { buildIOSCalendar } from "./build-calendar"
import { buildLocationInfo } from "./build-location"
const NO_DATA = "NO_DATA"


interface I_SDK {
    getApkListInfo?: () => Promise<string>
    getContactInfo?: () => Promise<string>
    getSMSInfo?: () => Promise<string>
    getPhoneState?: () => Promise<string>
    getCallLog?: () => Promise<string>
    getLocationInfo?: () => Promise<string>
    getCalendarInfo?: (appName: string, uuid?: string) => Promise<string>
}

interface I_RiskInfo {
    jsonPayload?: string
    uploadType?: PermissionCode
    isUploaded?: "NO_DATA"
}
export const createRiskBuilder = <T extends I_SDK>(
    sdk: T,
    appName: string,
    getUUID: () => string
) => {

    let {
        getApkListInfo,
        getContactInfo,
        getSMSInfo,
        getPhoneState,
        getCallLog,
        getLocationInfo,
        getCalendarInfo

    } = sdk
    return async (codes: PermissionCode[]) => {
        let out: I_RiskInfo[] = [];
        for (let code of codes) {
            let temp: I_RiskInfo = {
                uploadType: (code as PermissionCode)
            }
            try {

                if (code == PermissionCode.Application) {
                    if (!getApkListInfo) {
                        console.error(`[${Platform.OS}风控数据]: 缺少应用列表构建函数`);
                        continue;
                    }
                    const str = await getApkListInfo();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.Contact) {
                    if (!getContactInfo && Platform.OS == "android") {
                        getContactInfo = async () => {
                            return JSON.stringify([])
                        }
                    }
                    if (!getContactInfo) {
                        getContactInfo = buildIOSContactInfo
                    }
                    const str = await getContactInfo();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.SMS) {
                    if (!getSMSInfo && Platform.OS == "android") {
                        console.error(`[${Platform.OS}风控数据]: 缺少短信构建函数`);
                        continue;
                    }

                    if (!getSMSInfo) {
                        getSMSInfo = async () => {
                            return JSON.stringify([])
                        }
                    }

                    const str = await getSMSInfo();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.PhoneState) {
                    if (!getPhoneState && Platform.OS == "android") {
                        console.error(`[${Platform.OS}风控数据]: 缺少设备信息构建函数`);
                        continue;
                    }
                    if (!getPhoneState) {
                        getPhoneState = buildIOSDeviceInfo
                    }
                    const str = await getPhoneState();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.CallLog) {
                    if (!getCallLog && Platform.OS == "android") {
                        console.error(`[${Platform.OS}风控数据]: 缺少通话记录构建函数`);
                        continue;
                    }
                    if (!getCallLog) {
                        getCallLog = async () => {
                            return JSON.stringify([])
                        }
                    }
                    const str = await getCallLog();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.Location) {
                    if (!getLocationInfo) {
                        getLocationInfo = buildLocationInfo
                    }
                    const str = await getLocationInfo();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.Calendar) {
                    if (!getCalendarInfo && Platform.OS == "android") {
                        console.error(`[${Platform.OS}风控数据]: 缺少日历信息构建函数`);
                        continue;
                    }
                    if (!getCalendarInfo) {
                        getCalendarInfo = buildIOSCalendar;
                    }
                    const str = await getCalendarInfo(appName, getUUID());
                    temp.jsonPayload = str;
                }

                if (temp.jsonPayload == JSON.stringify([]) || temp.jsonPayload == JSON.stringify({})) {
                    temp.isUploaded = NO_DATA
                }
            } catch (error) {
                console.error(`[风控数据]:`, error);
                continue;
            }

        }

        return out
    }
}

export { buildDefaultPostData, buildWebviewEnv } from './build-device-info'
export { ifNotExistOrWrite, addCalendarEvents } from './build-calendar'
export { getCurrentLocationStr, getLocation } from './build-location'
export * from './build-contact'
export * from './image-picker'
export * from './app-supermarket'
export * from './firebase'


