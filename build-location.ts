import { addTimeout, TimeoutError } from "xm-rn-utils"
import Location from "@react-native-community/geolocation"
export interface I_LocationInfo {
    latitude: number
    longitude: number
    is_current: boolean
}

export function getLocation() {
    const fetchLocationPromise = new Promise<I_LocationInfo>((s, e) => {
        Location.setRNConfiguration({ skipPermissionRequests: true })
        Location.getCurrentPosition((info: any) => {
            s({
                latitude: info.coords.latitude,
                longitude: info.coords.longitude,
                is_current: true
            })
        }, (error: any) => {
            const code = error?.code;
            if (code == 2) return e(new TimeoutError(error))
            e(error)
        }, { timeout: 10000, enableHighAccuracy: false },
        );
    })
    return addTimeout(() => fetchLocationPromise)()
}


const fetchLocationDescUrl = addTimeout(
    function (latitude: number, longitude: number) {
        return `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
    }
)

export async function getCurrentLocationStr() {
    const location = await getLocation();
    let url = fetchLocationDescUrl(location.latitude, location.longitude)
    const res = await fetch(url, { method: "GET" })
    const tempData = await res.text()
    const resJson = JSON.parse(tempData)
    return {
        ...resJson?.address,
        ...location
    } as {
        city: string
        state: string
        country: string
        postcode: string
        province?: string
    }
}

export async function buildLocationInfo() {
    try {
        const result = await getLocation()
        return JSON.stringify(result);
    } catch (error) {
        if (error instanceof TimeoutError) {
            console.error("[风控数据] 获取地理位置超时");
            return JSON.stringify({})
        }
        console.error("[risk data] 获取地理位置错误", error);
        throw error
    }
}



