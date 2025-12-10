import { Linking, Platform } from "react-native"
import appReview from 'react-native-in-app-review'
import { to } from "xm-rn-utils";

const goToSupermarket = to(
    async (url?: string) => {
        const urlStr = `${url ?? ""}`
        if (urlStr.length == 0) throw new Error("url is empty");
        await Linking.openURL(urlStr)
    }
)

const goToReview = to(
    async () => {
        if (!appReview.isAvailable()) throw new Error("not supported app review")
        const result = await appReview.RequestInAppReview()
        if (result == false) throw new Error("not supported app review")
    }
)
const reviewWhenIos = async (supermarketStr?: string) => {
    const [error,] = await goToSupermarket(supermarketStr)
    if (!error) return;
    await goToReview()
}

const reviewWhenAndroid = async (supermarketStr?: string) => {
    const [error,] = await goToReview()
    if (!error) return;
    await goToSupermarket(supermarketStr)
}

export const createSupermarketReview = async (getSupermarketUrl: () => Promise<string>) => {
    const supermarketStr = await getSupermarketUrl();
    return async () => {
        if (Platform.OS == "ios") {
            await to(reviewWhenIos)(supermarketStr)
        }
        if (Platform.OS == "android") {
            await to(reviewWhenAndroid)(supermarketStr)
        }
        return Promise.resolve()
    }
}
