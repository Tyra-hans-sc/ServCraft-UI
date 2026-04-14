import React, { useState, useMemo, useEffect, useRef, use } from 'react';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import Fetch from '../../utils/Fetch';
import PS from '../../services/permission/permission-service';

import { getTablerIconForContentType } from "@/PageComponents/Message/MessageItems/MessageAttachmentItem";
import {
  ActionIcon,
  AspectRatio, Badge,
  Box,
  Flex,
  Loader,
  Menu,
  Text,
  Textarea,
  Tooltip
} from "@mantine/core";
import styles from "@/PageComponents/Message/MessageItems/MessageItem.module.css";
import {
  IconCheck, IconChevronDown,
  IconEye,
  IconFileText,
  IconLock,
  IconLockAccess, IconLockOpen, IconTrash
} from "@tabler/icons-react";
import Image from "next/image";
import { IconDownload, IconPencil } from "@tabler/icons";
import ConfirmAction from "@/components/modals/confirm-action";


import { Attachment } from "@/interfaces/api/models"
import { useMutation } from "@tanstack/react-query";
import { showNotification } from "@mantine/notifications";
import { attachmentTypeOptions, attachmentTypeOptionsNonImage } from "@/components/shared-views/attachments";
import PreviewAttachmentComponent from "@/PageComponents/Attachment/PreviewAttachmentComponent";
import moment from "moment";
import PreviewImages from './PreviewImages'
import { downloadAttachment } from '@/utils/utils';

const iconSize = 50

// Define type for the Attachment prop
interface AttachmentProps {
  attachment: Attachment;
  attachments: Attachment[];
  setAttachmentItems?: (attachments: Attachment[]) => void;
  removeAttachment: (data: any) => void;
  taskItems?: Array<{
    IsActive: boolean;
    Complete: boolean;
    ItemDataResult: string[];
  }>;
  smallThumb?: boolean;
}

// Define type for confirm options
interface ConfirmOptions {
  confirmButtonText: string;
  onConfirm: (promptText?: string) => void;
  showCancel: boolean;
  display: boolean;
  heading: string;
  text?: string;
  isPrompt?: boolean;
  promptDefault?: string;
}

const updateAttachment = async (attachment: Attachment) => {
  const res = await Fetch.put({
    url: `/Attachment`,
    params: attachment,
  });

  if (res.ID) {
    return res
  } else {
    throw new Error(res.serverMessage || res.message || 'Something went wrong')
  }
}

const destroyAttachmentHttp = async (attachmentId: number) => {
  const res = await Fetch.destroy({
    url: `/Attachment?id=${attachmentId}`,
  })

  if (res.ID) {
    return res;
  } else {
    throw new Error(res.serverMessage || res.message || 'Failed to delete attachment');
  }
};

const toggleSecureAttachment = async (attachment: Attachment) => {
  const updatedAttachment = {
    ...attachment,
    IsSecure: !attachment.IsSecure,
  };

  return await updateAttachment(updatedAttachment);
};

const openInNewTab = async (attachment) => {
  let url = await Fetch.get({
    url: `/Attachment/AttachmentUrl?id=${attachment.ID}&download=${false}`
  });
  if (url) {
    window.open(url, "_blank");
  }
};

const updateAttachmentList = (attachment: Attachment, attachments: Attachment[]) => {
  return attachments.map((item) => {
    if (item.ID === attachment.ID) {
      return { ...item, ...attachment };
    }
    return item;
  });
}
// Component Definition
const AttachmentItem: React.FC<AttachmentProps> = ({ attachment: initialAttachment, attachments, setAttachmentItems, removeAttachment, taskItems = [], smallThumb = false }) => {

  const [attachment, setAttachment] = useState<Attachment>(initialAttachment);
  useEffect(() => {
    setAttachment(initialAttachment)
  }, [initialAttachment]);


  // const toast = useContext<any>(ToastContext);
  // const [showOverlay, setShowOverlay] = useState(false);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [showAttachmentDetails, setShowAttachmentDetails] = useState(false);
  const [permissionSecure] = useState<boolean>(PS.hasPermission(Enums.PermissionName.AttachmentSecure));

  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>(Helper.initialiseConfirmOptions());

  const descriptionMaxLength = 200;

  const attachmentMutation = useMutation(['attachment', attachment], updateAttachment, {
    onSuccess: (data) => {
      if (setAttachmentItems) {
        setAttachmentItems(updateAttachmentList(data, attachments));
      }
      // setAttachment(data);
      showNotification({
        id: 'attachmentDescription' + attachment.ID,
        message: !attachment.IsActive ? 'Attachment removed' : 'Attachment updated successfully',
        color: 'scBlue',
        autoClose: 1000
      })
      removeAttachment({});
    },
    onError: (error: Error) => {
      showNotification({
        id: 'attachmentDescription' + attachment.ID,
        message: error.message,
        color: 'yellow.7',
        autoClose: 4000
      })
    },
  }
  )

  const deleteMutation = useMutation(['deleteAttachment', attachment], destroyAttachmentHttp, {
    onSuccess: (data) => {
      showNotification({
        id: 'deleteAttachment' + attachment.ID,
        message: 'Attachment deleted successfully',
        color: 'scBlue',
        autoClose: 1000,
      });
      removeAttachment(attachment);
      setAttachment(data)
    },
    onError: (error: Error) => {
      showNotification({
        id: 'deleteAttachment' + attachment.ID,
        message: error.message,
        color: 'yellow.7',
        autoClose: 4000,
      });
    },
  });

  const secureMutation = useMutation(['toggleSecureAttachment', attachment], toggleSecureAttachment, {
    onSuccess: (data) => {
      setAttachment(data);
      removeAttachment({});
      showNotification({
        id: 'secureAttachment' + attachment.ID,
        message: `Attachment is now ${data.IsSecure ? 'secured' : 'not secured'}`,
        color: 'scBlue',
        autoClose: 1000,
      });
    },
    onError: (error: Error) => {
      showNotification({
        id: 'secureAttachment' + attachment.ID,
        message: error.message,
        color: 'yellow.7',
        autoClose: 4000,
      });
    },
  });

  const changeDescription = () => {
    setCurrentFileDescription(p => p.trim())
    attachmentMutation.mutate({ ...attachment, Description: currentFileDescription });
  };

  const changeType = (newAttachmentType) => {
    +newAttachmentType !== +(attachment.AttachmentType ?? 0) && attachmentMutation.mutate({ ...attachment, AttachmentType: !!newAttachmentType ? +newAttachmentType : Enums.AttachmentType.Other });
  };


  const toggleSecure = () => {
    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      confirmButtonText: attachment.IsSecure ? "Confirm Not Secured" : "Confirm Secured",
      onConfirm: () => secureMutation.mutate(attachment),
      display: true,
      heading: attachment.IsSecure ? "Confirm Not Secured" : "Confirm Secured",
      text: `Are you sure you want to mark this attachment as ${attachment.IsSecure ? "not secured" : "secured"}?`,
    });
  };

  const deleteAttachment = () => {

    let tasksLinked = taskItems && taskItems.filter(x => x.IsActive && x.Complete && x.ItemDataResult && x.ItemDataResult.includes(attachment.ID || '')).length > 0;

    if (tasksLinked) {
      setConfirmOptions({
        ...Helper.initialiseConfirmOptions(),
        confirmButtonText: "Ok",
        onConfirm: () => {
        },
        showCancel: false,
        display: true,
        heading: "Cannot Delete Attachment",
        text: "This attachment is linked to a completed task. Mark the task as incomplete first.",
      });
      return;
    }

    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      confirmButtonText: "Delete Attachment",
      onConfirm: () => deleteMutation.mutate(attachment?.ID as any),
      display: true,
      heading: "Delete Attachment",
      text: "Are you sure you want to delete this attachment?",
    });
  };

  const IconComponent = useMemo(() => (
    attachment.ContentType
      ? getTablerIconForContentType(attachment.ContentType)
      : IconFileText
  ), [attachment.ContentType])

  const [currentFileDescription, setCurrentFileDescription] = useState<string>(attachment.Description || '');
  const [currentAttachmentType, setCurrentAttachmentType] = useState<number>(attachment.AttachmentType || Enums.AttachmentType.Other);


  const descriptionChanged = useMemo(() => currentFileDescription !== attachment.Description, [currentFileDescription, attachment.Description]);

  useEffect(() => {
    if (attachments) {
      const updatedAttachment = attachments.find(a => a.ID === attachment.ID)
      if (updatedAttachment?.Description !== attachment.Description) {
        setCurrentFileDescription(updatedAttachment?.Description || attachment.Description || '');
      }

    }
  }, [attachments, setAttachmentItems])

  const fileDescriptionInputRef = useRef<HTMLTextAreaElement>(null)

  const [attachmentTypeMenuOpen, setAttachmentTypeMenuOpen] = useState<boolean>(false);

  const smallThumbAttachmentTypeStyle = useMemo(() => {
    if (smallThumb) {
      return { className: styles.attachmentCardIcon };
    }

    return {};

  }, [smallThumb]);

  const attachmentType = useMemo(() => (
    <Menu shadow="sm"
      width={145}
      position={'bottom-start'}
      opened={attachmentTypeMenuOpen}
      onChange={setAttachmentTypeMenuOpen}
      offset={1}
    >
      <Menu.Target>
        <span onClick={e => e.stopPropagation()} style={{ cursor: 'pointer' }}>
          <Badge
            p={0} px={2} py={1} color={'dark.4'}
            style={{ cursor: 'pointer', textTransform: 'none' }}
            radius={4}
            fw={400}
            rightSection={
              <IconChevronDown size={15} stroke={'3'} style={{ rotate: attachmentTypeMenuOpen ? '-180deg' : '0deg', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            }
          >
            {Enums.getEnumStringValue(Enums.AttachmentType, attachment.AttachmentType, true)}
          </Badge>
        </span>
      </Menu.Target>
      <Menu.Dropdown
        p={0}
        py={3}
        bg={'scBlue.0'}
      >
        {
          (attachment?.ContentType?.includes("image/") === true ? attachmentTypeOptions : attachmentTypeOptionsNonImage).map(option => (
            <Menu.Item
              className={styles.attachmentTypeMenuItem}
              py={1}
              key={'attachmentTypeOption' + option.value}
              bg={+option.value === attachment.AttachmentType ? 'scBlue.1' : undefined}
              rightSection={+option.value === attachment.AttachmentType ? <IconCheck color={'var(--mantine-color-scBlue-7)'} size={17} /> : null}
              onClick={e => {
                e.stopPropagation()
                changeType(option.value)
              }}
            >
              <Text size={'sm'}>
                {option.label}
              </Text>
            </Menu.Item>
          ))
        }
      </Menu.Dropdown>
    </Menu>
  ), [attachment.AttachmentType, attachmentTypeMenuOpen]);

  const attachmentCard =
    <Flex
      pos={'relative'}
      w={'100%'}
      h={'100%'}
      direction={'column'}
      className={styles.imageHoverEffect}  // Add this line
      style={{
        cursor: 'pointer'
      }}
    >

      {
        attachment.ContentType?.startsWith('image') ?
          <Image
            className={styles.image}
            alt={''}
            src={attachment.UrlThumb || attachment.Url || ''}
            placeholder={'blur'}
            blurDataURL={attachment.UrlThumb}
            style={{
              // objectFit: 'cover', // :)
              objectFit: 'contain', // :(
              border: '0px solid transparent',
              borderTopLeftRadius: '5px',
              borderTopRightRadius: '5px',
              objectPosition: 'top',
              userDrag: 'none', // Prevents dragging in webkit browsers
              WebkitUserDrag: 'none', // Safari specific
            } as any}
            fill
          />
          :
          <IconComponent
            size={iconSize}
            style={{
              zIndex: 0,
              position: 'absolute',
              left: `calc(50% - ${iconSize / 2}px)`,
              top: `calc(50% - ${iconSize / 2}px)`,
              color: 'initial'
            }}
            stroke={2}
          />
      }

      <Flex
        w={'100%'}
        style={{ zIndex: 2 }}
        gap={5}
        p={5}
        className={styles.attachmentToolContainer + (attachmentTypeMenuOpen ? ' ' + styles.opened : '')}
      >

        <div className={smallThumb ? styles.attachmentCardIcon : ""}>
          {attachmentType}
        </div>
        <Flex
          onClick={e => e.stopPropagation()}
          style={{ zIndex: 2 }}
          gap={5}
          p={0}
          ml={'auto'}
        >
          {
            <ActionIcon size={'sm'}
              color={'dark.4'}
              className={styles.attachmentCardIcon}
              onClick={(e) => {
                e.stopPropagation();
                deleteAttachment();
              }}
            >
              {
                deleteMutation.isLoading ? <Loader color={'white'} size={13} /> :
                  <IconTrash size={17} />
              }
            </ActionIcon>
          }

          <ActionIcon
            size={'sm'}
            color={'dark.4'}
            className={styles.attachmentCardIcon}
            onClick={async (e) => {
              e.stopPropagation();
              await downloadAttachment(attachment);
            }}
          >
            <IconDownload size={17} />
          </ActionIcon>

          {
            attachment.ContentType?.startsWith('image') && attachment.Url && !smallThumb &&
            <ActionIcon size={'sm'}
              color={'dark.4'}
              className={styles.attachmentCardIcon}
              onClick={(e) => {
                e.stopPropagation();
                setShowAttachmentPreview(true);

              }}
            >
              <IconEye size={17} />
            </ActionIcon>
          }

          {
            !attachment.ContentType?.startsWith('image') &&
            <ActionIcon size={'sm'}
              color={'dark.4'}
              className={styles.attachmentCardIcon}
              onClick={(e) => {
                e.stopPropagation();
                setShowAttachmentDetails(true);
              }}
            >
              <IconPencil size={17} />
            </ActionIcon>
          }

          {
            permissionSecure && <ActionIcon size={'sm'}
              color={'dark.4'}
              className={!attachment.IsSecure ? styles.attachmentCardIcon : ''}
              onClick={(e) => {
                e.stopPropagation();
                toggleSecure();
              }}
            >
              {
                secureMutation.isLoading ? <Loader color={'white'} size={13} /> :
                  attachment.IsSecure ?
                    <IconLock size={17} color={'var(--mantine-color-yellow-4)'} /> :
                    <IconLockOpen size={17} />
              }
            </ActionIcon>
          }
        </Flex>


      </Flex>
    </Flex>;


  return (

    <Box
      className={styles.attachmentCard + ' ' + styles.attachmentCardHoverBlue}
    >
      <AspectRatio
        ratio={16 / 9}
        pos={'relative'}
      >
        {
          (
            attachment.IsSecure && !permissionSecure ?
              <Flex
                pos={'relative'}
                style={{ cursor: 'not-allowed' }}
              >
                <Text size={'xs'}
                  lineClamp={2}
                  c={'white'}
                  style={{
                    zIndex: 1,
                    textShadow: `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`
                  }}
                  ta={'right'}
                  pos={'absolute'}
                  bottom={5} right={5}
                >
                  Secure File
                </Text>
                <IconLockAccess
                  // size={iconSize}
                  style={{
                    zIndex: 0,
                    position: 'absolute',
                    left: `calc(50% - ${iconSize / 2}px)`,
                    top: `calc(50% - ${iconSize / 2}px)`,
                    color: 'initial'
                  }}
                  stroke={2}
                />
              </Flex> :
              <Box
                h={'100%'}
                onClick={e => {
                  e.stopPropagation()
                  if (attachment.ContentType?.startsWith('image')) {
                    setShowAttachmentPreview(true);
                  } else {
                    openInNewTab(attachment)
                  }
                }}
              >
                {attachmentCard}
              </Box>
          )
        }

        <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />
        {(showAttachmentDetails) &&
          <PreviewAttachmentComponent
            attachment={attachment}
            onClose={
              () => {
                setShowAttachmentPreview(false)
                setShowAttachmentDetails(false)
              }
            }
            onUpdateAttachment={(values) => {
              attachmentMutation.mutate({ ...attachment, ...values })
              setCurrentFileDescription(values?.Description || '')
              setCurrentAttachmentType(+(values?.AttachmentType || Enums.AttachmentType.Other))
            }}
            initialTab={'details'}
          />
        }
        {
          (showAttachmentPreview) &&
          <PreviewImages
            attachments={attachments}
            attachment={attachment}
            setAttachmentItems={setAttachmentItems}
            onClose={() => setShowAttachmentPreview(false)}
            onAttachmentUpdate={(updatedAttachment) => {
              setAttachment(prev => ({ ...prev, ...updatedAttachment }));
            }}
          />
        }

      </AspectRatio>

      <Box pos={'relative'} h={50}>

        <Box pos={'absolute'} bg={'white'} w={'100%'} bottom={0}>
          <Textarea
            ref={fileDescriptionInputRef}
            error={/*currentFileDescription.trim().length === 0 ? 'Please provide a file description' : */descriptionMaxLength < currentFileDescription.length ? 'Attachment name too long' : null}
            onClick={e => e.stopPropagation()}
            c={'dark.7'}
            rows={1}
            minRows={1}
            maxRows={3}
            maxLength={200}
            autosize
            w={'100%'}
            mt={-1}
            // mb={-2}
            // mb={-1}
            style={{
              justifySelf: 'end',
            }}
            classNames={{
              input: styles.cardInput
            }}
            styles={{}}
            rightSectionProps={{
              onClick: e => e.stopPropagation()
            }}
            value={currentFileDescription}
            onChange={(e) => setCurrentFileDescription(e.currentTarget.value)}
            onBlur={(e) => {
              e.stopPropagation();
              (descriptionChanged && currentFileDescription.trim() && descriptionMaxLength > currentFileDescription.length) && changeDescription();
            }}
            placeholder={'No File Description'}
            rightSection={
              descriptionChanged ?
                <Tooltip openDelay={300} color={'scBlue'} label={descriptionMaxLength < currentFileDescription.length ? 'Name too long' : 'Confirm file name'}>
                  <ActionIcon disabled={!currentFileDescription.trim() || descriptionMaxLength < currentFileDescription.length} size={'xs'} onClick={(e) => {
                    e.stopPropagation();
                    changeDescription();
                  }}>
                    {
                      attachmentMutation.isLoading ?
                        <Loader color={'white'} size={13} /> :
                        <IconCheck size={16} />
                    }
                  </ActionIcon>
                </Tooltip> :
                <Tooltip openDelay={300} color={'dark'} label={'Edit file name'}>
                  <ActionIcon variant={'transparent'} size={'xs'} onClick={(e) => {
                    e.stopPropagation();

                    fileDescriptionInputRef.current?.select();
                    fileDescriptionInputRef.current?.focus();
                  }}>
                    {
                      // attachmentMutation.isLoading ? <Loader color={'white'} size={'sm'} /> :
                      <IconPencil color={'var(--mantine-color-dark-4)'} size={16} />
                    }
                  </ActionIcon>
                </Tooltip>
            }
          />



          <Tooltip color={'scBlue.9'} label={'Created ' + moment(attachment.CreatedDate).format('D MMMM, YYYY - hh:mm a')} openDelay={700}>
            <Text
              // mt={'auto'}
              // mr={3}
              mb={5}
              mt={3}
              ml={12}
              size='xs'
              // fw={'bolder'}
              c={'dark.6'}
            >
              {
                moment(Date.now()).diff(attachment.CreatedDate) < 1000 * 60 ? moment(attachment.CreatedDate).fromNow() :
                  moment(Date.now()).isSame(attachment.CreatedDate, 'date') ? `Today - ${moment(attachment.CreatedDate).format('h:mm a')}` :
                    moment(Date.now()).diff(attachment.CreatedDate) < 1000 * 60 * 60 * 24 * 364 ? moment(attachment.CreatedDate).format('D MMM - h:mm a') :
                      moment(attachment.CreatedDate).format('D MMM YY - hh:mm a')
              }
            </Text>
          </Tooltip>
        </Box>


      </Box>

    </Box>

  );
};
// <PreviewAttachment attachment={attachment} setShowAttachmentPreview={setShowAttachmentPreview} overlay={true} /> : ''
export default AttachmentItem;
