import React, {FC} from "react";
import tabStyles from "@/styles/Tabs.module.css";
import {Box, ColorSwatch, Flex, Tabs, TabsProps, Text} from "@mantine/core";
import NewText from "@/PageComponents/Premium/NewText";

interface TabProps {
  text: string;
  fitContent?: boolean;
  suppressCount?: boolean;
  count?: number;
  disabled?: boolean;
  newItem?: boolean;
}

const PageTabs:FC<{tabs: TabProps[]; setSelectedTab: (text: string | null) => void; selectedTab?: string | null; showTab1Count?: boolean; tabsProps: TabsProps;}> =
    (props) => {

  return <>
    <Tabs color={'scBlue'} value={props.selectedTab} onChange={props.setSelectedTab}
          classNames={{
            tab: tabStyles.scTab,
            list: tabStyles.scTabList,
            tabLabel: tabStyles.scTabLabel
          }}
          {...props.tabsProps}
    >
      <Tabs.List mb={0} pb={0}>
        {props.tabs.map((tab, i) =>
            <Tabs.Tab value={tab.text}
                      disabled={tab.disabled}
                      key={'main-tab-' + i}
            >
              <Flex gap={10} align={'center'}>
                {tab.text} {tab.newItem && <NewText ml={-6} />}
                {
                    (i !== 0 || props.showTab1Count) && !tab.suppressCount &&
                    <Flex
                        justify={'center'}
                        align={'center'}
                        className={tabStyles.counter}
                        color={'var(--mantine-color-scBlue-5)'}
                        w={18} h={18} style={{borderRadius: '50%'}}
                    >
                      <Text ta={'center'} size={'10px'} fw={600} c={'white'} mx={'auto'}>
                        {tab.count}
                      </Text>
                    </Flex>
                }
              </Flex>
            </Tabs.Tab>
        )}
      </Tabs.List>
    </Tabs>
  </>
}

export default PageTabs
