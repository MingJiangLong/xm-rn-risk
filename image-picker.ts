import { PermissionCode, requestPermission } from "xm-rn-permissions"
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
const IMAGE_DEFAULT_OPTION = {
    mediaType: 'photo',
    maxHeight: 1920,
    maxWidth: 1080,
    includeBase64: true,
    quality: .5,
} as const



export const openCamera = async (options?: Parameters<typeof launchCamera>[0]) => {
    const requestResult = await requestPermission(PermissionCode.Camera)
    if (requestResult != "granted") return;
    const result = await launchCamera({
        ...IMAGE_DEFAULT_OPTION,
        ...options
    })
    const assets = result?.assets
    const imageInfo = assets?.[0];
    if (!imageInfo) return undefined;
    return {
        mimeType: imageInfo.type,
        base64: imageInfo.base64,
        uri: imageInfo.uri,
        name: imageInfo.fileName,
    } as const
}

/**
 * 打开相册
 * @param options 
 * @returns 
 */
export const openGallery = async (options?: Parameters<typeof launchImageLibrary>[0]) => {
    const result = await launchImageLibrary({
        ...IMAGE_DEFAULT_OPTION,
        ...options
    })
    const assets = result?.assets
    const imageInfo = assets?.[0]
    if (!imageInfo) return undefined;
    return {
        base64: `${imageInfo?.base64}`,
        uri: imageInfo.uri,
        name: imageInfo?.fileName,
        mimeType: imageInfo?.type,
    } as const
}