import { Platform } from 'react-native';
import {
    getGroups as getContactGroups, contactsInGroup,
    Contact, getAll as getAllContacts
} from 'react-native-contacts'
import { selectContactPhone as selectContactPhone2 } from 'react-native-select-contact'
interface I_ContactGroups {
    groupName: string
    list: Contact[]
}
async function getContactsInGroup() {
    const groups = await getContactGroups();
    let temp: I_ContactGroups[] = []
    for (let item of groups) {
        const data = await contactsInGroup(item.identifier)
        temp.push({ groupName: item.name, list: data })
    }
    return temp
}
function findGroupsForContact(id: string, groups: I_ContactGroups[]) {
    return groups.reduce((total, current) => {
        const find = current.list.find((item) => item.recordID === id)
        if (find) return [current.groupName, ...total]
        return total
    }, [] as string[]).join(",")
}

export async function buildIOSContactInfo() {
    try {
        const contactsInGroups = await getContactsInGroup()
        const contacts = await getAllContacts();
        const result = contacts.map((item) => {
            const name = `${item?.givenName ?? ""} ${item?.familyName}`.trim();
            return item.phoneNumbers.map((item2) => {
                return ({
                    last_update_times: 0,
                    source: 'device',
                    contact_times: 0,
                    last_used_times: 0,
                    name,
                    last_contact_time: 0,
                    phone: item2.number,
                    create_time: `${Date.now()}`.slice(0, 10),
                    groups: findGroupsForContact(item.recordID, contactsInGroups),
                })
            })
        }).flat()
        return JSON.stringify(result)
    } catch (error) {
        console.error(`[${Platform.OS}风控数据]: 构建联系人信息失败`, error);
        throw error
    }
}
export const selectContactPhone = async (...args: Parameters<typeof selectContactPhone2>) => {
    const contact = await selectContactPhone2(...args)
    const selectedPhone = contact?.selectedPhone;
    return {
        phone: selectedPhone?.number,
        name: contact?.contact.name
    } as const
}