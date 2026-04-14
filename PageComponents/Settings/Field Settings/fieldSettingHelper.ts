import { FieldSetting } from "@/PageComponents/Settings/Field Settings/FieldSettings";
import * as Enums from '@/utils/enums'

export const systemNameVsFormName = {
    CustomField1: 'CustomTextField1',
    CustomField2: 'CustomTextField2',
    CustomField3: 'CustomTextField3',
    CustomField4: 'CustomTextField4',
    CustomCheckbox1: 'CustomFilter1',
    CustomCheckbox2: 'CustomFilter2',
    Supplier: 'SupplierName',
    OtherNumber: 'SerialNumber',
}
export const altSystemNameVsFormName = {
    CustomTextField1: 'CustomText1',
    CustomTextField2: 'CustomText2',
    CustomTextField3: 'CustomText3',
    CustomTextField4: 'CustomText4',
    CustomCheckbox1: 'CustomBoolean1',
    CustomCheckbox2: 'CustomBoolean2',
}

export const FormNameVsSystemName = {
    CustomField1: 'CustomTextField1',
    CustomText1: 'CustomText1',
    CustomField2: 'CustomTextField2',
    CustomText2: 'CustomText2',
    CustomField3: 'CustomTextField3',
    CustomText3: 'CustomText3',
    CustomField4: 'CustomTextField4',
    CustomText4: 'CustomText4',
    CustomFilter1: 'CustomCheckbox1',
    CustomBoolean1: 'CustomBoolean1',
    CustomFilter2: 'CustomCheckbox2',
    CustomBoolean2: 'CustomBoolean2',
    SerialNumber: 'OtherNumber',
    SupplierName: 'Supplier'
}

export const getFormNameForSystemName = (name, module?: number) => {
    if (module === Enums.Module.Inventory) {
        return { ...systemNameVsFormName, ...altSystemNameVsFormName }[name] || name
    }
    return systemNameVsFormName[name] || name
}
export const getSystemNameForFormName = (name) => {
    return FormNameVsSystemName[name] || name
}

export const isOptionGroupNameCoveredByFieldSettings = (groupName: string) => {
    return groupName === 'Custom Settings' || groupName.includes('Validation Settings')
}