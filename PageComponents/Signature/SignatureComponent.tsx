import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import signatureService from '@/services/signature/signature-service';
import useInitialTimeout from '@/hooks/useInitialTimeout';
import SCInput from '@/components/sc-controls/form-controls/sc-input';
import * as Enums from '@/utils/enums';
import EmployeeSelector from '@/components/selectors/employee/employee-selector';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Flex, Menu, Skeleton, Title } from '@mantine/core';
import { Signature, SignatureTemplate, Attachment } from '@/interfaces/api/models';
import { NewSignatureRequest } from '@/interfaces/internal/models';
import helper from '@/utils/helper';
import time from '@/utils/time';
import { colors, layout } from '@/theme';
import SubscriptionContext from '@/utils/subscription-context';
import QRCode from "react-qr-code";
import storage from '@/utils/storage';
import ToastContext from '@/utils/toast-context';
import useRefState from '@/hooks/useRefState';
import Image from 'next/image';
import SCModal from '@/components/sc-controls/layout/sc-modal';
import SignatureTerms from './SignatureTerms';
import { env } from 'process';


const SignatureComponent: FC<{
    id?: string
    request?: NewSignatureRequest
    storeID?: string | null
    onUpdate: (signature: Signature) => void
}> = ({ id, request, storeID = null, onUpdate }) => {

    const [signature, setSignature, getSignatureValue] = useRefState<Signature | null>(null);
    const signatureRef = useRef();
    const [isSigning, setIsSigning, getIsSigningValue] = useRefState(false);
    const [signatureData, setSignatureData] = useState<any>(null);
    const subscriptionContext = useContext<any>(SubscriptionContext);
    const [accessStatus, setAccessStatus] = useState<number>();
    const signatureBackupRef = useRef<Signature | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSignatureTerms, setShowSignatureTerms] = useState(false);

    const toast = useContext(ToastContext);

    useInitialTimeout(0, () => {
        refreshSignature();
        setAccessStatus(subscriptionContext?.subscriptionInfo?.AccessStatus);
    });

    const windowVisibility = async (e) => {
        if (document.visibilityState === "visible") {
            let newSign: Signature | null = await refreshSignature(true);
            if (signature?.Attachment?.ID !== newSign?.Attachment?.ID) {
                refreshSignature();
            }
        }
    };

    useEffect(() => {

        window.addEventListener("visibilitychange", windowVisibility);

        return () => {
            window.removeEventListener("visibilitychange", windowVisibility);
        };
    }, []);

    const refreshSignature = async (blockUpdate: boolean = false) => {
        let signatureTemp: Signature;
        let idToGet = signature?.ID ?? id;
        if (idToGet) {
            signatureTemp = await signatureService.getSignature(idToGet);
        }
        else if (request) {
            signatureTemp = await signatureService.newSignature(request);
            !blockUpdate && onUpdate(signatureTemp);
        }
        else {
            // shouldn't get here ever
            signatureTemp = {
                ItemID: null,
                Key: null,
                SignatureTemplateID: null
            } as any;
        }

        if (!blockUpdate) {
            setIsSigning(!signatureTemp?.Attachment?.Url);
            setSignature(signatureTemp);
        }

        return signatureTemp;
    };

    useEffect(() => {

        if (!getIsSigningValue()) return;

        pollForSignatureUpdate();

    }, [isSigning]);

    const pollForSignatureUpdate = () => {

        setTimeout(async () => {
            let sign = await refreshSignature(true);

            if (time.toISOString(time.parseDate(sign.ModifiedDate)) !== time.toISOString(time.parseDate(getSignatureValue()?.ModifiedDate ?? null))) {
                setIsSigning(false);
                setSignature(sign);
                onUpdate(sign);
                (toast as any).setToast({
                    message: 'Signature captured successfully',
                    show: true,
                    type: Enums.ToastType.success
                });
            }
            else if (getIsSigningValue()) {
                pollForSignatureUpdate();
            }

        }, 5000);
    };

    const updateSignature = (updateMethod: (modifiedSignature: Signature) => void) => {
        let signatureTemp = { ...signature } as Signature;
        updateMethod(signatureTemp);
        setSignature(signatureTemp);
    };

    const signedByChanged = (value) => {
        updateSignature((signatureTemp) => {
            signatureTemp.SignedBy = value;
        });
    };

    const setSelectedEmployee = (employee: any) => {
        updateSignature((signatureTemp) => {
            signatureTemp.Employee = employee;
            signatureTemp.EmployeeID = employee?.ID ?? null;
            signatureTemp.SignedBy = employee?.FullName ?? "";
        });
    };

    const setSelectedContact = (contact: any) => {
        updateSignature((signatureTemp) => {
            signatureTemp.CustomerContact = contact;
            signatureTemp.CustomerContactID = contact?.ID ?? null;
            signatureTemp.SignedBy = contact?.FullName ?? "";
        });
    };

    const signatureCallback = () => {
        let temp = (signatureRef.current as any).toDataURL().replace("data:image/png;base64,", "");
        setSignatureData(temp);
    };

    const clearSignature = () => {
        (signatureRef.current as any).clear();
        setSignatureData(null);
    };

    const isReSigning = useMemo(() => {
        return isSigning && !!signature?.Attachment;
    }, [isSigning, signature]);

    const reSignSignature = () => {
        signatureBackupRef.current = {
            ...signature,
            Employee: { ...signature?.Employee },
            Attachment: { ...signature?.Attachment },
            CustomerContact: { ...signature?.CustomerContact },
            SupplierContact: { ...signature?.SupplierContact }
        };
        randomNumber.current = Math.random();
        setIsSigning(_ => true);
        setTimeout(() => {
            clearSignature();
        }, 10);
    };

    const cancelReSignSignature = () => {
        setSignature(signatureBackupRef.current);
        setIsSigning(_ => false);
    };

    const validateSignature: () => boolean = () => {
        let isValid = true;

        let isSigned = !!signatureData;
        isValid = isSigned && isValid;
        let hasName = !!(signature?.SignedBy);
        isValid = hasName && isValid;

        return isValid;
    };

    const saveSignature: () => Promise<boolean> = async () => {
        if (!validateSignature() || !signature) return false;

        setIsSubmitting(true);
        const id = helper.newGuid();

        let attachment: Attachment = {
            ID: id,
            AttachmentType: Enums.AttachmentType.Signature,
            ContentType: 'image/png',
            Description: `Signature ${signature.Key}`,
            ItemID: signature.ID,
            FileBase64: signatureData,
            FileName: `${id}.png`,
            UserType: Enums.UserType.Employee,
            FileSize: signatureData.length,
            Module: Enums.Module.Signature
        };

        let signatureToSave = { ...signature };

        signatureToSave.Attachment = undefined;
        signatureToSave.AttachmentID = attachment.ID;
        signatureToSave.SignedDate = time.toISOString(time.now());
        signatureToSave.SignatureSource = Enums.SignatureSource.WebApp;

        let savedSignature = await signatureService.saveSignature({
            Signature: signatureToSave,
            Attachment: attachment
        });

        setIsSubmitting(false);

        if (savedSignature) {
            setSignature(savedSignature);
            onUpdate(savedSignature);
            setIsSigning(false);
            (toast as any).setToast({
                message: 'Signature captured successfully',
                show: true,
                type: Enums.ToastType.success
            });
            return true;
        } else {
            (toast as any).setToast({
                message: 'Signature did not save',
                show: true,
                type: Enums.ToastType.error
            });
        }

        return false;
    };

    const randomNumber = useRef(Math.random());
    const signatureZone = useMemo(() => {
        return `${window.location.origin}/tenantzone/signature?t=${storage.getCookie(Enums.Cookie.tenantID)}&i=${signature?.ID}&_=${randomNumber.current}`;
    }, [signature, randomNumber.current]);

    const signatureTerms = useMemo(() => {
        return signature?.Terms ?? signature?.SignatureTemplate?.Terms;
    }, [signature]);

    const renderManageSignature = () => {
        return <>
            {signature?.SignatureTemplate?.UserInstruction && isSigning && <div className="user-instruction">
                {signature?.SignatureTemplate?.UserInstruction}
            </div>}

            {signatureTerms && <SignatureTerms
                label='View Terms'
                terms={signatureTerms}
                maxWidth='590px'
                minWidth='590px'
            />}

            {signature?.SignatureTemplate?.SignatureType === Enums.SignatureType.Employee ?
                <EmployeeSelector
                    required={true}
                    selectedEmployee={signature?.Employee}
                    setSelectedEmployee={setSelectedEmployee}
                    error={""}
                    accessStatus={accessStatus}
                    storeID={storeID}
                    label='Signed by Employee'
                    canClear={isSigning}
                    readOnly={!isSigning}
                />
                :
                <SCInput
                    value={signature?.SignedBy}
                    name='SignedBy'
                    label='Signed By'
                    onChange={(x) => signedByChanged(x.value)}
                    readOnly={!isSigning}
                />
            }

            {signature?.Attachment?.UrlThumb && !isSigning ?
                <>

                    <div className="current-signature">
                        {signature.SignatureTemplate?.HideSignature ?
                            <div className="thumb" style={{ width: "36.5rem", marginTop: "1rem", display: "flex", alignItems: "center" }} >
                                <img src="/specno-icons/done.svg" height={100} />
                                <span style={{ opacity: 0.7, fontSize: "0.8rem" }}>Signature is hidden</span>
                            </div>
                            :
                            <div style={{ minHeight: "300px", width: "600px" }}>
                                <Image
                                    style={{ marginTop: "1rem", paddingBottom: "3rem" }}
                                    src={signature.Attachment.Url || signature.Attachment.UrlThumb}
                                    placeholder={'blur'}
                                    blurDataURL={signature.Attachment.Url || signature.Attachment.UrlThumb}
                                    quality={40}
                                    objectFit={'contain'}
                                    objectPosition={'center'}
                                    layout={'fill'}
                                    alt='Signature'
                                ></Image>
                            </div>
                        }
                        <Flex justify={"space-between"}>
                            <div className="signed-date">Signed on {time.formatDate(time.parseDate(signature?.SignedDate))} at {time.toISOString(time.parseDate(signature?.SignedDate), false, true, false, "-", false)}</div>
                            <div className="re-sign-button">
                                {signature?.SignatureTemplate?.AllowResign && <Button
                                    onClick={reSignSignature}
                                    size={'xs'}
                                >
                                    Re-sign
                                </Button>}
                            </div>
                        </Flex>

                    </div>
                </>
                :
                <>
                    <div className={`signature-pad ${false ? 'error' : ''}`}>
                        <div className="m-signature-pad">
                            <SignatureCanvas minWidth={1.5} ref={signatureRef} onEnd={signatureCallback} />
                        </div>
                    </div>



                    <Flex justify={"space-between"}>
                        <Button
                            onClick={clearSignature}
                            disabled={!signatureData}
                            size={'xs'}
                            variant={'outline'}
                        >
                            Clear
                        </Button>
                        {isReSigning &&
                            <Button
                                onClick={cancelReSignSignature}
                                size={'xs'}
                                variant={'outline'}
                            >
                                Cancel
                            </Button>
                        }
                        <Button
                            onClick={saveSignature}
                            disabled={!signatureData || !(signature?.SignedBy) || isSubmitting}
                            size={'xs'}
                        >
                            {isSubmitting ? "Uploading..." : signatureTerms ? "Confirm" : "Confirm"}
                        </Button>
                    </Flex>
                </>
            }

            {
                signature?.SignatureTemplate?.UseQRCode && isSigning &&

                <div className="qr-code">
                    <div style={{ marginBottom: "1rem", fontSize: "0.75rem" }}>
                        Signing on a different device? Scan the QR Code below.
                        <br />
                        <b>Please do not close this popup while the signature is being taken.</b>
                    </div>
                    <QRCode
                        size={150}
                        value={signatureZone}
                    />
                    {process.env.NODE_ENV === "development" &&
                        <div style={{ marginTop: "0.5rem" }}>
                            <a className="signature-zone-link" href={signatureZone} target='_blank'>{signatureZone}</a>
                        </div>
                    }
                </div>
            }

            <style jsx>{`

                .current-signature {
                    position: relative;
                }
                
                .user-instruction {
                    font-style: italic;
                    font-size: 0.9rem;
                }

                .terms {
                    margin: 1rem 0;
                    color: ${colors.bluePrimary};
                    font-size: 0.8rem;
                    width: 600px;
                    height: 1rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .terms:after {
                    content: "test"
                }

                .signed-date {
                    font-size: 0.75rem;
                    position: relative;
                    left: 0;
                    top: 1rem;
                }

                .re-sign-button {
                    position: relative;
                    right: 0;
                    top: 0.5rem;
                }

                .cancel-re-sign {
                    position: relative;
                    right: 0;
                    top: 0.5rem;
                }

                .qr-code {
                    border-radius: ${layout.cardRadius};
                    background: #e9ecef;
                    padding: 0.5rem;
                    margin-top: 1rem;
                    width: 590px;
                    text-align: center;
                }

                .signature-zone-link {
                    text-decoration: none;
                    color: black;
                    font-weight: bold;
                    font-size: 0.75rem;
                }

            `}</style>
        </>
    };

    return (<>

        <div>
            {signature ? renderManageSignature() : <>
                <div style={{ width: "36.5rem", height: "17rem" }}>
                    <Skeleton height={"2rem"} width={"36.5rem"} />
                    <div style={{ height: "1rem" }}></div>
                    <Skeleton height={"14rem"} width={"36.5rem"} />
                </div>
            </>
            }
        </div>

        <style jsx>{`
      
        `}</style>
    </>);
};

export default SignatureComponent;