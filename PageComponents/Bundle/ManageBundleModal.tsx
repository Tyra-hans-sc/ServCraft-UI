import {FC, useState} from "react";
import SCModal from "@/PageComponents/Modal/SCModal";
import ManageBundleComponent from "@/PageComponents/Bundle/ManageBundleComponent";

const ManageBundleModal: FC<
    {
        open: boolean, setOpen: (open: boolean) => void; bundle?: any; onBundleSelected: (bundle: any) => void
    }
> = ({open, setOpen, ...props}) => {
    const [bundle, setBundle] = useState()

    return <>
        <SCModal
            open={open}
            onClose={() => {
                setOpen(false)
                setBundle(undefined)
            }}
            size={1050}
            modalProps={{
                closeOnClickOutside: false
            }}
        >
            <ManageBundleComponent
                bundle={bundle}
                onBundleCreated={setBundle}
                onConfirm={(bundle) => {
                    if(bundle) {
                        props.onBundleSelected(bundle)
                    }
                    setBundle(undefined)
                    setOpen(false)
                }}
            />
        </SCModal>
    </>
}

export default ManageBundleModal
