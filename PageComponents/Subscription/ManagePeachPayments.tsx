import Fetch from '@/utils/Fetch';
import ToastContext from '@/utils/toast-context';
import { FC, useContext, useEffect, useState } from 'react';

const ManagePeachPayments: FC<{}> = ({ }) => {

    const toast = useContext(ToastContext);

    const [url, setUrl] = useState("");

    useEffect(() => {

        const result = Fetch.post({
            url: `/Subscription/PeachPayment`,
            params: {
                // api decides what goes on here
            },
            toastCtx: toast
        }) as any;

        if (result.url) {
            setUrl(result.url);
        }

    }, []);

    return (<>
        <div style={{width: "calc(100% - 2rem)", height: "calc(100vh - 100px)", marginTop: "1rem", marginLeft: "1rem"}}>
            <iframe src={url} height={"100%"} width={"100%"} />
        </div>
        <style jsx>{`
            
        `}</style>
    </>);
};

export default ManagePeachPayments;