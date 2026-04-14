import React, {useEffect, useState} from 'react';
import {Box, Tabs, Title} from "@mantine/core";
import SCModal from "@/PageComponents/Modal/SCModal";
import {Attachment} from "@/interfaces/api/models";
import ImageWithZoom from "@/PageComponents/Attachment/ImageWithZoom";
import tabStyles from "@/styles/Tabs.module.css";
import AttachmentFormComponent from "@/PageComponents/Attachment/AttachmentFormComponent";
import ImageEditor from "@/PageComponents/Attachment/ImageEditor/ImageEditor";
import PreviewImages from './PreviewImages';

interface PreviewAttachmentProps {
  attachment: Attachment;
  onClose: () => void;
  onUpdateAttachment: (values: Partial<Attachment>) => void;
  overlay?: boolean;
  initialTab?: 'image' | 'details';
  readOnly?: boolean;
}

const PreviewAttachment: React.FC<PreviewAttachmentProps> = ({ attachment, onClose, initialTab = 'image', onUpdateAttachment, readOnly }) => {

  const isImage = attachment.ContentType?.startsWith('image/');

  // For non-image attachments, force the Details tab to be active so content is visible
  const initialTabForContent = isImage ? initialTab : 'details';

  const [activeTab, setActiveTab] = useState<string | null>(initialTabForContent);

  useEffect(() => {
    setActiveTab(isImage ? initialTab : 'details');
  }, [initialTab, isImage]);

  const handleTabChange = (newTabName: string | null) => {
    setActiveTab(newTabName)
  }

  return (

      <>
        <SCModal
            size={'auto'}
            open
            withCloseButton={!isImage}
            onClose={onClose}
            modalProps={{
                keepMounted: false,
              styles: {
                close: {marginInlineEnd: 50, right: 50},
                content: {paddingInline: 0, marginInline: 0, overflowX: 'clip'},
                body: {paddingInline: 0, marginInline: 0},
              }
            }}
            p={'xs'}
            closeButtonProps={{right: 30, top: 16}}
        >
          <>
          {isImage?
            <PreviewImages attachments={[attachment]} readOnly={readOnly} onClose={onClose} attachment={attachment} />
              :

<Tabs color={'scBlue'} value={activeTab} onChange={handleTabChange}
                keepMounted={false}
                classNames={{
                  tab: tabStyles.scTab,
                  list: tabStyles.scTabList,
                  tabLabel: tabStyles.scTabLabel
                }}
          >
              {
                  attachment.ContentType?.startsWith('image/') ?
                  <Tabs.List mb={0} pb={0}>
                      <Tabs.Tab value={'image'} key={'image'}>
                          Image
                      </Tabs.Tab>
                      <Tabs.Tab value={'details'} key={'details'}>
                          Details
                      </Tabs.Tab>
                  </Tabs.List> :
                      <Title order={5} c={'scBlue.9'}>
                          Editing Attachment
                      </Title>
              }
            <Tabs.Panel value={'image'} key={'image'}>
              <Box>
                <ImageWithZoom attachment={attachment}/>
              </Box>
            </Tabs.Panel>
            <Tabs.Panel value={'details'} key={'details'}>
              <Box>
                <AttachmentFormComponent attachment={attachment} onSubmit={(values) => {
                    onClose();
                    onUpdateAttachment(values)
                }} onClose={onClose} readOnly={readOnly}/>
              </Box>
            </Tabs.Panel>
          </Tabs>


          }
                  </>
        </SCModal>
      </>
  );
};

export default PreviewAttachment;
