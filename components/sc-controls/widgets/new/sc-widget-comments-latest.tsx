import { WidgetConfig } from "@/PageComponents/Dashboard/DashboardModels";
import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import SCWidgetCard from "./sc-widget-card";
import SCWidgetTitle from "@/components/sc-controls/widgets/new/sc-widget-title";
import Fetch from "@/utils/Fetch";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Flex, Group, Loader, LoadingOverlay, ScrollArea, Stack, Text, Tooltip } from "@mantine/core";
import EmployeeAvatar from "@/PageComponents/Table/EmployeeAvatar";
import { formatDate } from "@/PageComponents/Table/table-helper";

import { IconMessageCircleDown } from "@tabler/icons-react";
import Helper from "@/utils/helper";
import * as Enums from "@/utils/enums";
import { useRouter } from "next/router";
import Time from "@/utils/time";
import styles from './sc-widget-comments-latest.module.css'

interface CommentsResponse {
    HttpStatusCode?: number,
    Message?: number,
    TotalResults?: number,
    ReturnedResults?: number,
    Results?: Comment[],
}
interface Comment {
    ItemID: string,
    CommentText: string,
    Module: number,
    UserType: number,
    Reference: string,
    CustomerView: boolean,
    Notify: boolean,
    EmployeeName: string,
    StoreID: string,
    ID: string,
    IsActive: boolean,
    CreatedBy: string,
    CreatedDate: string,
    ModifiedBy: string,
    ModifiedDate: string,
    RowVersion: string,
}

const noResultsSvg = <svg width="115" height="99" viewBox="0 0 115 99" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M66.9913 98.5C93.448 98.5 114.897 77.0512 114.897 50.5C114.897 23.9488 93.448 2.5 66.9913 2.5C40.5347 2.5 19.0859 23.9488 19.0859 50.5C19.0859 77.0512 40.5347 98.5 66.9913 98.5Z" fill="#F5F5F5" />
    <path d="M85.364 31.5078C101.675 31.5078 114.833 43.3703 114.833 57.9535C114.833 66.3334 110.483 73.8427 103.632 78.74V89.7318C103.632 91.2555 101.893 92.0173 100.805 91.1466L91.4535 83.855C89.4961 84.1815 87.5388 84.3992 85.4727 84.3992C69.1616 84.3992 56.0039 72.5367 56.0039 57.9535C56.0039 43.3703 69.1616 31.5078 85.364 31.5078Z" fill="#E5E6E9" />
    <g filter="url(#filter0_d_2097_88054)">
        <path d="M44.9433 8.92676C26.7835 8.92676 12.1035 22.0952 12.1035 38.3108C12.1035 47.6702 16.9969 56.0501 24.6087 61.3828V73.5718C24.6087 75.2042 26.4573 76.1837 27.7622 75.0954L38.2013 67.042C40.3762 67.4773 42.551 67.6949 44.8345 67.6949C62.9943 67.6949 77.6743 54.5265 77.6743 38.3108C77.6743 22.0952 62.9943 8.92676 44.9433 8.92676Z" fill="white" />
    </g>
    <rect x="28.166" y="29.7148" width="34.0157" height="2.83465" rx="1.41732" fill="#EFEFEF" />
    <rect x="28.166" y="36.3271" width="19.8425" height="2.83465" rx="1.41732" fill="#EFEFEF" />
    <rect x="28.166" y="43.8857" width="34.0157" height="2.83465" rx="1.41732" fill="#EFEFEF" />
    <rect x="71.8984" y="14.501" width="27.3877" height="27.3877" rx="13.6938" fill="url(#paint0_linear_2097_88054)" />
    <path d="M84.3672 30.7603C84.3089 30.5271 84.3089 30.2938 84.3089 30.0023C84.3089 29.0109 84.7171 28.1362 85.7667 27.3782L86.6414 26.7367C87.1662 26.3285 87.3995 25.862 87.3995 25.2789C87.3995 24.4625 86.8164 23.6461 85.5918 23.6461C84.3089 23.6461 83.7258 24.6958 83.7258 25.6871C83.7258 25.9203 83.7258 26.0953 83.7841 26.2702L81.4516 26.2119C81.3933 25.9787 81.335 25.6871 81.335 25.3955C81.335 23.4129 82.7928 21.5469 85.5335 21.5469C88.3325 21.5469 89.8486 23.3546 89.8486 25.1623C89.8486 26.6201 89.0906 27.6114 88.0409 28.3695L87.2829 28.8943C86.6414 29.3608 86.2916 29.9439 86.2916 30.6437V30.7603H84.3672ZM85.3585 31.9266C86.1749 31.9266 86.8164 32.568 86.8164 33.3844C86.8164 34.2008 86.1749 34.8422 85.3585 34.8422C84.5422 34.8422 83.9007 34.2008 83.9007 33.3844C83.959 32.6263 84.5422 31.9266 85.3585 31.9266Z" fill="white" />
    <defs>
        <filter id="filter0_d_2097_88054" x="0.764946" y="0.422831" width="88.2475" height="89.3051" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="2.83464" />
            <feGaussianBlur stdDeviation="5.66928" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2097_88054" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2097_88054" result="shape" />
        </filter>
        <linearGradient id="paint0_linear_2097_88054" x1="77.6596" y1="17.8091" x2="99.4843" y2="46.9085" gradientUnits="userSpaceOnUse">
            <stop stop-color="#205EF1" />
            <stop offset="1" stop-color="#013FD1" />
        </linearGradient>
    </defs>
</svg>

const getComments = async (count, storeID) => {
    return await Fetch.get({
        url: `/Comment/CommentRetrieveTop?count=${count}&storeid=${storeID}`
    } as any) as CommentsResponse;

    // return {} as CommentsResponse
    /*setShowLoadMore(request.Results.length > 0);
    setComments(request.Results);
    setCommentCount(count => count + 5);*/
};

const ScWidgetCommentsLatest: FC<{
    widget: WidgetConfig
    onDismiss: (() => void) | undefined,
    storeId: string | null
}> = ({ widget, onDismiss, storeId = null }) => {

    const [numberOfCommentsToShow, setNumberOfCommentsToShow] = useState(40)
    const [fetchingMore, setFetchingMore] = useState(false)

    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const commentsQuery = useQuery(['latestComments', numberOfCommentsToShow, storeId], () => getComments(numberOfCommentsToShow, storeId),
        {
            onSettled: (data) => {
                /*if(scrollContainerRef.current!.scrollTop > (scrollContainerRef.current!.scrollHeight / 2)) {
                    scrollContainerRef.current!.scrollTo({ top: scrollContainerRef.current!.scrollHeight, behavior: 'smooth' })
                } else {
                    scrollContainerRef.current!.scrollTo({ top: 0, behavior: 'smooth' })
                }*/
                setFetchingMore(false)
            },
            keepPreviousData: true,
            // if last two messages occurred within 10 minutes fetch every 30 seconds else fetch every minute - (fetching only happens when document window is within focus)
            refetchInterval: (data, query) => {
                const results = data?.Results
                return results && results.length > 3 && ((Time.getTimeDifference(
                    results[1].CreatedDate, results[0].CreatedDate
                ) / 60000) < 10) ? (30 * 1000) : (60 * 1000)
            }
        }
    )

    useEffect(() => {
        if (scrollContainerRef.current && fetchingMore) {
            scrollContainerRef.current!.scrollTo({ top: scrollContainerRef.current!.scrollHeight, behavior: 'smooth' })
        } else {
            scrollContainerRef.current!.scrollTo({ top: 0, behavior: 'smooth' })
        }

    }, [commentsQuery.data]);

    const onLoadMore = () => {
        setFetchingMore(true)
        if (!commentsQuery.isFetching) {
            setNumberOfCommentsToShow(n => n + 10)
        }
        // scrollContainerRef.current!.scrollTo({ top: scrollContainerRef.current!.scrollHeight, behavior: 'smooth' })
    }

    const noMoreComments = useMemo(
        () => (!commentsQuery.isFetching && (commentsQuery.data?.Results?.length || 0) < numberOfCommentsToShow),
        [commentsQuery.data, commentsQuery.isFetching, numberOfCommentsToShow]
    )

    const router = useRouter()

    const navigateToItem = async (comment: Comment) => {
        await Helper.waitABit();
        let url = '';
        switch (comment.Module) {
            case Enums.Module.Customer:
                url = `customer/${comment.ItemID}`;
                break;
            case Enums.Module.JobCard:
                url = `job/${comment.ItemID}`;
                break;
            case Enums.Module.Asset:
                url = `asset/${comment.ItemID}`;
                break;
            case Enums.Module.Invoice:
                url = `invoice/${comment.ItemID}`;
                break;
            case Enums.Module.Quote:
                url = `quote/${comment.ItemID}`;
                break;
            case Enums.Module.PurchaseOrder:
                url = `purchase/${comment.ItemID}`;
                break;
            case Enums.Module.Query:
                url = `query/${comment.ItemID}`;
                break;
        }
        router.push('/' + url)
        // Helper.nextRouter(Router.replace, url, '', true);
    };


    return (<>
        <SCWidgetCard onDismiss={onDismiss} height={widget.heightPX}>
            <SCWidgetTitle title="Comments" />

            <ScrollArea
                pos={'relative'}
                h={`calc(100% - 78px)`}
                // style={{borderBottom: '1px solid red'}}
                viewportRef={scrollContainerRef}
            >
                <LoadingOverlay visible={commentsQuery.isLoading} loaderProps={{ color: 'scBlue' }} />
                {
                    <Stack gap={0}>
                        {
                            commentsQuery.data?.Results?.map(
                                x => (
                                    <Box key={x.ID}
                                        p={'var(--mantine-spacing-sm)'}
                                        // className={styles.commentsContainer}
                                        onClick={() => navigateToItem(x)}
                                    >
                                        <Flex justify={'space-between'}>
                                            <Group gap={'xs'}>
                                                <EmployeeAvatar
                                                    name={x.EmployeeName ?? ""}
                                                    useUnassignedMode={false}
                                                />
                                                <Text size={'sm'}>
                                                    {x.Reference}
                                                </Text>
                                            </Group>
                                            <Text c={'dimmed'} size={'sm'} fw={500}>
                                                {formatDate(x.CreatedDate)}
                                                <span className={`${styles.visibilityTag} ${x.CustomerView ? styles.public : styles.private}`}>{x.CustomerView ? "Public" : "Internal"}</span>
                                            </Text>
                                        </Flex>
                                        <Text c={'dimmed'} mt="xs" maw={(scrollContainerRef.current?.offsetWidth ?? 500) - 40}>
                                            {x.CommentText}
                                        </Text>
                                    </Box>
                                )
                            )

                        }
                    </Stack>
                }

                {
                    // commentsQuery?.isFetching && <>TODO</>
                }

                {
                    commentsQuery?.isSuccess && !commentsQuery.data?.Results?.length && <>
                        <Flex
                            // w={'100%'}
                            mt={70}
                            direction={'column'}
                            align={'center'}
                        >
                            {noResultsSvg}
                            <Text size={'sm'} fw={700} c={'dimmed'} mt={'var(--mantine-spacing-md)'}>
                                No Comments Yet
                            </Text>
                            <Text size={'sm'} fw={400} c={'dimmed'}>
                                Comments on any item will appear here
                            </Text>
                        </Flex>
                    </>
                }

            </ScrollArea>

            <Flex align={'center'} justify={'flex-end'}>
                <Box>
                    <Tooltip color={'scBlue'} label={'No more comments'} disabled={!noMoreComments} >
                        <Box
                            pos={'absolute'}
                            right={12}
                            bottom={12}>
                            <Button
                                // disabled
                                disabled={noMoreComments}
                                /*styles={(t, params, par) => ({
                                    root: {
                                        '&:hover': {
                                            backgroundColor: t.fn.lighten(t.colors.scBlue[5], .8)
                                        }
                                    }
                                })}*/
                                rightSection={
                                    fetchingMore && <Loader size={17} color={'scBlue'} /> ||
                                    <IconMessageCircleDown size={18} />
                                }
                                size={'xs'}
                                variant={'subtle'}
                                color={'scBlue'}
                                onClick={onLoadMore}
                            >
                                Load Older Comments
                            </Button>
                        </Box>
                    </Tooltip>
                </Box>


            </Flex>


        </SCWidgetCard>

    </>)
}

export default ScWidgetCommentsLatest;
