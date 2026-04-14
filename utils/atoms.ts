import {atom} from 'jotai'
// import {WhatsNewDetail} from "@/PageComponents/Dashboard/WhatsNew/WhatsNewData";
import { JobCard } from "@/interfaces/api/models";

const dataAtom = atom({});
export const readWriteAtom = atom(
    (get) => get(dataAtom),
    (get, set, id: string, newVal) => {
        const data = get(dataAtom);
        const updatedData = { ...data, [id]: newVal };
        set(dataAtom, updatedData)
    }
)

/*export const triggerWhatsNewViewedAtom = atom(0)

export const showWhatsNewAtom = atom(false)

export const whatsNewBlinkingAttentionModeAtom = atom(false)
export const whatsNewContentNotViewedYetAtom = atom<any[]>([])

export const hasLoggedInAtom = atom<boolean>(false)*/

// Global password-change prompt state (triggered post-login if weak)
export const passwordChangePromptAtom = atom<{ open: boolean; title?: string; message?: string; }>({
    open: false,
    title: undefined,
    message: undefined
})

const filterStatesAtom = atom({})
export const readWriteFilterStatesAtom = atom(
    (get) => get(filterStatesAtom),
    (get, set, filterName: string, newVal) => {
        const data = get(filterStatesAtom);
        const updatedData = { ...data, [filterName]: newVal };
        set(filterStatesAtom, updatedData)
    }
)

export const openModalsAtom = atom<string[]>([])

export const inventoryDrawerAtom = atom<{
    selectedInventory: any | null;
}>({
    selectedInventory: null
})

export const savedInventoryAtom = atom<any | null>(null)

// Atom for tracking job drag operations
export const jobDragStateAtom = atom<{
    isDragging: boolean;
    job: JobCard | null;
}>({
    isDragging: false,
    job: null
})

export const justCompletedSetupAtom = atom<boolean>(false)

export const forceInitialSetupAtom = atom<boolean>(false)
