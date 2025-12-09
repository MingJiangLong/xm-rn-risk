import { Platform } from "react-native"
import DeviceInfo from 'react-native-device-info'
import { addTimeout, toFixed } from "xm-rn-utils";
import Jailbreak from 'react-native-jailbreak'

export const fetchIpAddress = addTimeout(
    async function () {
        try {
            let resp = await fetch("https://icanhazip.com/")
            return (await resp?.text()).trim();
        } catch (e) {
            return DeviceInfo.getIpAddress();
        }
    }
)


export async function buildIOSDeviceInfo() {

    const batteryCharging = await DeviceInfo.isBatteryCharging();
    let chargingStatus = 3
    if (batteryCharging) { chargingStatus = 2; }
    const result = {
        appChannel: Platform.OS,
        model: DeviceInfo.getDeviceId(),
        manufacturer: 'apple',
        systemVersion: DeviceInfo.getSystemVersion(),
        batteryPercentage: toFixed(await DeviceInfo.getBatteryLevel()),
        appName: DeviceInfo.getApplicationName(),
        appPackage: DeviceInfo.getBundleId(),
        appVersionName: DeviceInfo.getVersion(),
        chargingStatus: chargingStatus, //充电状态 充电状态2:充电中;3:未充电;  5:已满电;1:其他未知状态
        rooted: await Jailbreak.check(),  //是否越狱
        publicIpAddress: await fetchIpAddress(), //
        deviceNo: await DeviceInfo.getUniqueId(),
        deviceName: await DeviceInfo.getDeviceName(),
    };
    return JSON.stringify(result)
}

export const buildDefaultPostData = async () => {
    const phoneName = Platform.select({
        android: `${DeviceInfo.getBrand()} ${DeviceInfo.getModel()}`,
        ios: await DeviceInfo.getDeviceName()
    })

    const version = Platform.select({
        android: `android ${DeviceInfo.getSystemVersion()}`,
        ios: `iOS ${DeviceInfo.getSystemVersion()}`
    })

    const deviceID = Platform.select({
        ios: await DeviceInfo.syncUniqueId(),
        android: await DeviceInfo.getAndroidId()
    })

    const temp = {
        reqSource: Platform.select({
            ios: 'Ios',
            android: 'Android'
        }) ?? "Android",
        phoneName,
        appVersion: DeviceInfo.getVersion(),
        androidversion: version,
        deviceID,
    }
    return Promise.resolve(temp);
}
export const buildWebviewEnv = async () => {
    const iosName = await DeviceInfo.getDeviceName();
    const androidName = `${DeviceInfo.getBrand()} ${DeviceInfo.getModel()}`
    const phoneName = Platform.select({
        ios: iosName,
        android: androidName
    }) ?? ""
    const deviceId = Platform.select({
        android: await DeviceInfo.getAndroidId(),
        ios: await DeviceInfo.getUniqueId()
    }) ?? ""
    const androidVersion = `android ${DeviceInfo.getSystemVersion()}`
    const iosVersion = `iOS${DeviceInfo.getSystemVersion()}`

    const version = Platform.select({
        android: androidVersion,
        ios: iosVersion
    }) ?? ""

    return {
        appName: DeviceInfo.getApplicationName(),
        appPackageName: DeviceInfo.getBundleId(),
        appVersion: DeviceInfo.getVersion(),
        platform: Platform.select({
            ios: 'Ios',
            android: 'Android'
        }) ?? "Android",
        deviceId,
        phoneName: phoneName,
        androidVersion: version,
        appType: "rn",
    }
}

