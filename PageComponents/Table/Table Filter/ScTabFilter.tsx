import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {ScFilterOptionTabsProps, ScTableQueryStateProps} from "@/PageComponents/Table/table-model";
import {Text, Tabs, lighten} from "@mantine/core";
import {useRouter} from "next/router";
import {useQuery} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import tabStyles from './ScTabFilter.module.css';

const fetchStatusCounts = async (url) => {
    let pathname = "";
    if (typeof window !== "undefined") {
        pathname = window.location.pathname;
    }
    const res = await Fetch.get({url, caller: pathname} as any)
    if(res.Results) {
        return res
    } else {
        throw new Error(res.serverMessage || res.message || 'Unexpected Server Response')
    }
}

const ScTabFilter: FC<
    ScFilterOptionTabsProps &
    {
        onChange: (newValue: string[]) => void
        initialValues: ScTableQueryStateProps
        tableName: string
        // used to refetch the status counts when the table is refetched
        forceRefetchDepVal: any
    }
> = (props) => {

    const router = useRouter()

    const [statusCount, setStatusCounts] = useState({})

    const statusQuery = useQuery(
        ['statusQuery', props.tableName, props.forceRefetchDepVal],
        () => fetchStatusCounts(props.statusCountsEndpoint),
        {
            enabled: !!props.statusCountsEndpoint,
            onError: console.error,
        }
    )

    // Update status counts when query data changes
    useEffect(() => {
        if (statusQuery.data?.Results) {
            setStatusCounts(statusQuery.data.Results.length !== 0 && statusQuery.data.Results.reduce((a, b) => (
                {...a, [b.Key]: b.Value}
            ), {}))
        }
    }, [statusQuery.data])

    const getTabValue = useCallback(
        (tab: string) => {
            return (props.tabs[tab].value)
        }, [props.tabs]
    )

    useEffect(() => {
        const tab = router.asPath.split('?tab=')[1]
        if(tab && props.tabs[tab]) {
            setActiveTab(tab)
            props.onChange && props.onChange(getTabValue(tab))
        }
    }, [router.asPath])

    useEffect(() => {
        if (props.initialValues && props.initialValues[props.filterName]) {
            const tab = router.asPath.split('?tab=')[1]
            if(!tab || !props.tabs[tab]) {
                // console.log('setting active tab from initial values', props.initialValues[props.filterName])
                if(props.initialValues[props.filterName].length === 0 ) {
                    setActiveTab('all')
                    handleTabChange('all')
                    router.replace(router.asPath.split('?')[0] + '?tab=all')
                } else {
                    for (const key in props.tabs) {
                        if(props.tabs.hasOwnProperty(key) && props.initialValues[props.filterName].every(x =>  props.tabs[key].value.some(y => y.toLowerCase() === x.toLowerCase()))/* props.tabs[key].value[0]?.toLowerCase() === props.initialValues[props.filterName][0]?.toLowerCase()*/) {
                            setActiveTab(key)
                            handleTabChange(key)
                        }
                    }
                }
            }
        }
    }, [])

    const [activeTab, setActiveTab] = useState<string | null>(Object.entries(props.tabs).find(([, x]) => x.access)?.[0] || 'all');

    const handleTabChange = (newTabName: string | null) => {
        setActiveTab(newTabName)
        props.onChange && props.onChange(getTabValue(newTabName as string))
        router.replace(router.asPath.split('?')[0] + '?tab=' + newTabName)
    }

    return <>
        <Tabs color={'scBlue'} value={activeTab} onChange={handleTabChange}
              classNames={{
                  tab: tabStyles.scTab,
              }}
              styles={(theme) => ({
                  tabsList: {
                      display: 'flex',
                      borderBottom: 0,
                  },
                  root: {
                      marginBottom: 10
                  }
              })}
        >
            <Tabs.List mb={0} pb={0}>
                {
                    Object.entries(props.tabs).map(
                        ([tabName, d]) => d &&
                            <Tabs.Tab
                                value={tabName}
                                key={tabName + 'tab'}
                                rightSection={
                                    !!statusCount[d.enumVal] &&
                                    /*<Badge px={5} radius={'lg'} size={'md'}
                                           style={(t) => ({
                                               backgroundColor: t.colors.scBlue[6],
                                               color: '#fff'
                                           })}
                                           miw={20}
                                    >
                                        {statusCount[d.enumVal]}
                                    </Badge>*/
                                    <Text size={'sm'}>( {statusCount[d.enumVal]} )</Text>
                            }
                            >
                                {d.label}
                            </Tabs.Tab>
                    )
                }
            </Tabs.List>
        </Tabs>
    </>
}

export default ScTabFilter
