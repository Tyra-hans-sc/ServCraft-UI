import SCModal from '@/components/sc-controls/layout/sc-modal';
import { colors } from '@/theme';
import { FloatingPosition, Menu } from '@mantine/core';
import { FC, useState } from 'react';

const SignatureTerms: FC<{
    label?: string
    terms: string | null | undefined
    position?: FloatingPosition
    maxWidth?: string
    minWidth?: string
}> = ({ label = "View Terms", terms, position = 'right', maxWidth, minWidth = "80vw" }) => {


    const [showSignatureTerms, setShowSignatureTerms] = useState(false);

    return (<>

        {terms && <>
            <div className="terms">
                <div
                    className={"hyperlink-text"}
                    dangerouslySetInnerHTML={{
                        __html: terms.replaceAll("\n", "...<br/>")
                    }}>
                </div>
                <div onClick={() => { setShowSignatureTerms(true) }} className="show-more">Show More</div>
            </div>

            {showSignatureTerms &&
                <SCModal
                    minWidth={minWidth}
                    maxWidth={(maxWidth ? maxWidth : "34rem") as any}
                    title='Terms of Acceptance'
                    onDismiss={() => { setShowSignatureTerms(false) }}
                >
                    <div style={{ maxHeight: "50vh", overflow: "auto", fontSize: "0.8rem" }} dangerouslySetInnerHTML={{
                        __html: terms.replaceAll("\n", "<br/>")
                    }}></div>

                </SCModal>
            }



        </>}

        <style jsx>{`
            .terms {
                margin: 0.5rem 0;
                font-size: 0.8rem;
                max-width: ${maxWidth};
                height: 1rem;
                position: relative;
            }

            .hyperlink-text {
                overflow: none;
                height: 1rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: calc(100% - 70px)
            }

            .show-more {
                position: absolute;
                top: 0;
                right: 0px;
                font-weight: bold ;
                text-decoration: underline;
                cursor: pointer;
                color: ${colors.bluePrimary};
            }
        
        `}</style>
    </>);
};

export default SignatureTerms;