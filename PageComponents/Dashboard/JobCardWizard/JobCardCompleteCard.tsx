import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {Box, Button, Flex, Text, Title, Loader, CloseButton, Anchor, ModalProps } from '@mantine/core';
import { IconExternalLink, IconCheck } from '@tabler/icons-react';
import styles from './JobCardCompleteCard.module.css';
import DownloadService from '@/utils/download-service';
import { Document, Page, pdfjs } from 'react-pdf';
import { useElementSize, useViewportSize } from '@mantine/hooks';
import * as Enums from '@/utils/enums';
import Storage from '@/utils/storage';
import { useMutation, useQuery } from '@tanstack/react-query';
import Fetch from '@/utils/Fetch';
import { showNotification } from '@mantine/notifications';
import Helper from '@/utils/helper';
import Constants from '@/utils/constants';

type JobCardCompleteCardProps = {
  jobId: string;
  jobNumber?: string | null;
  modalProps:ModalProps
  onClose?: () => void;
};

const JobCardCompleteCard: FC<JobCardCompleteCardProps> = ({modalProps, jobId, jobNumber, onClose }) => {
  const viewJobHref = useMemo(() => `/job/${jobId}`, [jobId]);
  // Default endpoint to preview/print the job card (documentType=1 is the default Job Document)
  const endPoint = useMemo(() => `GetJobDocument?documentType=1&jobCardID=${jobId}`, [jobId]);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const lastUrlRef = useRef<string | null>(null);
  const { ref: previewRef, width: previewWidth } = useElementSize();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  const {data:jobItem, isFetched:jobItemFetched, isFetching:isJobItemFetching} = useQuery({
    queryKey: ['jobItem', jobId],
    queryFn: async () => {
      const res = await Fetch.get({
        url: `/Job/${jobId}`,
        params: { jobID: jobId },
      } as any);
      return res;
    }}) 
  // Configure pdf.js worker (use CDN to avoid bundler issues)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      } catch {
        // ignore
      }
    }
  }, []);

  // Eagerly obtain a blob URL for embedding in iframe
  useEffect(() => {
    let cancelled = false;

    const makePreview = async () => {
      try {
        // Creates Object URL for preview
        const res = await DownloadService.fetchFileObjectUrl('GET', `/Job/${endPoint}`);
        if (!cancelled) {
          // Revoke previous URL
          if (lastUrlRef.current) {
            URL.revokeObjectURL(lastUrlRef.current);
          }
          lastUrlRef.current = res.url;
          setObjectUrl(res.url);
        }
      } catch (e) {
        // Silent fail – iframe area will show placeholder
        // console.error('Failed to load preview', e);
      }
    };

    makePreview();
    return () => {
      cancelled = true;
    };
  }, [endPoint]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lastUrlRef.current) {
        URL.revokeObjectURL(lastUrlRef.current);
        lastUrlRef.current = null;
      }
    };
  }, []);

  const handlePrint = async () => {
    try {
      await DownloadService.downloadFile('GET', `/Job/${endPoint}`, null, false, true);
    } catch (e) {
      // no-op
    }
  };

    const messageMutation = useMutation(
        ['messageMutation'],
        async (params:any) => {
            await Fetch.post({
                url: '/Message',
                params
            } as any).then(
                (messageRes) => {
                    if (messageRes && messageRes.HttpStatusCode == 200) {
                        Helper.mixpanelTrack(Constants.mixPanelEvents.createCommunication, {
                            "itemID":jobId
                        } as any);
                        return messageRes
                    } else {
                        throw new Error(messageRes.serverMessage || messageRes.message || 'Message could not be sent')
                    }
                }
            )

        }
        ,
        {
            onSuccess: (messageRes) => {
                showNotification({
                    id: 'messageSent',
                    message: 'Message sent successfully',
                    color: 'scBlue',
                    autoClose: 3000
                })
                // setFormIsDirty(false);
                },
            onError: (err: Error) => {
                if (err.message.includes("(429)")) {
                    showNotification({
                        id: 'messageSent',
                        title: 'Message could not be sent',
                        message: "You have reached your limit sending messages, try again in a short while",
                        color: 'yellow.7',
                        autoClose: 3000
                    })
                } else {
                    showNotification({
                        id: 'messageSent',
                        title: 'Message could not be sent',
                        message: err.message || '',
                        color: 'yellow.7',
                        autoClose: 3000
                    })
                }
                // setFormIsDirty(false);
            }
        }
    );
 
    const sendToMyEmail = () => {
        if(jobItemFetched){
            console.log("Contact: ", jobItem.Contact)
            messageMutation.mutate({
                module: Enums.Module.JobCard,
                itemId: jobItem.ID,
                storeId: jobItem.StoreID,
                messageType: Enums.MessageType.Email,
                contacts: [jobItem.Contact],
                employees: [],
                subject: `Your First Job Card Has Been Created`,
                moduleAttachments: [],
                localAttachments: [],
                emailBody: `<p>Dear {{RecipName}},<br><br>
                Congratulations! You have successfully created your first job card.
                <br><br>
                Please find the details below:<br>
                Job Card ID: {{JbcdNo}}
                <br><br>
                You can review and update the complete job card by clicking the link below:<br> 
                {{Link}}
                <br><br>
                Alternatively, you may refer to the attached copy of the job card for your records.
                <br><br>
                Kind regards,<br>
                ServCraft Team</p>`,
                forms: [],
                documents: ['job_card'],
                messageRecipientList: [{ 'RecipientID': jobItem.Contact.ID, UserType: Enums.UserType.Customer, 'SendEmail':jobItem.Contact.SendEmail, 'SendSMS':false }],
                attachments: [],
                formHeaders: [],
                attachQuote: false,
                attachInvoice: false,
                attachJobCard: true,
                attachWorkShop: false,
                attachSignOff: false,
                attachJobSheet: false,
                attachPurchaseOrder: false,
            })
        }
    }
    
  return (
    <Box w={750} className={styles.container} maw={{base: '85vw', sm: '80vw'}} p={{ base:'18px 24px 18px', sm:'24px 32px 24px'}} pos={'relative'} >
            <CloseButton onClick={modalProps.onClose}  pos={'absolute'} right={10} top={15} style={{zIndex: 5}} />
    <Box pos={'relative'}>
        <Title order={4} ta={'center'}>
          Your job card is ready!
        </Title>
        <Text c={'gray.7'} style={{ fontSize:'max(12px, var(--mantine-font-size-sm))'}} ta={'center'}>You can close the job card from the Actions menu when you’re done.</Text>
      </Box>
      <Flex align={'center'} justify={'center'} className={styles.topRow} mt={'xs'}>
        <Button
          variant={'outline'}
          color={'scBlue'}
          component={Link as any}
          href={viewJobHref}
          rightSection={<IconExternalLink size={16} />}
        >
          View Job
        </Button>
      </Flex>

      <Box className={styles.previewWrapper}>
        <Box className={styles.iframeBox} ref={previewRef as any}>
          {objectUrl ? (
            <Document
              file={objectUrl || undefined}
              loading={
                <Flex h={370} align={'center'} justify={'center'} direction={'column'} gap={'xs'}>
                  <Loader color={'scBlue'} size={22} />
                  <Text c={'dark.6'}>Loading JobCard…</Text>
                </Flex>
              }
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages || 1);
                setDocError(null);
              }}
              onLoadError={(err) => {
                setDocError(err?.message || 'Failed to load PDF');
              }}
              onSourceError={(err) => {
                setDocError((err as any)?.message || 'Failed to load PDF source');
              }}
              externalLinkTarget="_blank"
            >
              {docError ? (
                <Flex h={370} align={'center'} justify={'center'} direction={'column'} gap={'xs'}>
                  <Text c={'yellow.7'}>Could not render PDF preview</Text>
                  <Text c={'gray.6'} size={'sm'}>Use the Print button to open it in a new tab.</Text>
                </Flex>
              ) : (
                <Page pageNumber={1} width={Math.max(100, Math.floor(previewWidth))}
                      renderAnnotationLayer={false} renderTextLayer={false} />
              )}
            </Document>
          ) : (
            <Flex h={370} align={'center'} justify={'center'} direction={'column'} gap={'xs'}>
              <Text c={'dark.6'}>Preview will appear here once available.</Text>
              <Text c={'gray.6'} size={'sm'}>
                If the PDF cannot be embedded due to browser or server settings, use the Print button to open it in a new tab.
              </Text>
            </Flex>
          )}
        </Box>
      </Box>

      <Flex className={styles.footer} pt={'md'}>
        <Box style={{ fontSize:'max(14px, var(--mantine-font-size-sm))'}} >
        Missing fields? &nbsp;<Anchor fw={600} style={{ fontSize:'max(14px, var(--mantine-font-size-sm))'}} component={Link} underline={'never'} href={'settings/document/manage'}  color={'scBlue'}>
        Customize in job settings.
        </Anchor>
        </Box>
        <Flex gap={'xs'} justify={"flex-end"} align={'flex-end'}>
      <Button variant={'subtle'} color={'dark.7'} disabled={messageMutation.isSuccess || isJobItemFetching} 
        className={styles.myButton}
        onClick={() => sendToMyEmail()}
        leftSection={
           messageMutation.isLoading ? <Loader size='xs' color={'var(--mantine-color-gray-7)'}></Loader>:
           messageMutation.isSuccess &&<IconCheck stroke={2} color={'var(--mantine-color-gray-7)'}></IconCheck>
        }
        >
        {isJobItemFetching?'Loading':messageMutation.isSuccess ? 'Sent!' :'Send to my email'}
        </Button>
        <Button color={'scBlue'} onClick={handlePrint}>Download</Button>
        </Flex>
     </Flex>
    </Box>
  );
};

export default JobCardCompleteCard;
