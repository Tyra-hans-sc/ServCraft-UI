import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as Enums from '@/utils/enums';
import Helper from '@/utils/helper';
import styles from './Breadcrumbs.module.css'
import {ActionIcon, Flex, Menu, Text} from '@mantine/core';
import {IconChevronRight} from "@tabler/icons";
import {useMediaQuery} from "@mantine/hooks";

function Breadcrumbs(props: any) {

  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const extraClass = ' ' + (props.color === 'white' ? " crumb-white" : "");

  const mobileView = useMediaQuery('(max-width: 800px)')

  const getBreadCrumb = () => {
    let crumbString = sessionStorage[Enums.Cookie.servCrumbs]; //Storage.getCookie(Enums.Cookie.servCrumbs);
    if (crumbString) {
      return JSON.parse(crumbString);
    } else {
      return null;
    }
  };

  const updateBreadcrumb = (crumbs: any) => {
    setBreadcrumbs(crumbs.filter(x => x.text !== 'Dashboard'));
    //Storage.setCookie(Enums.Cookie.servCrumbs, JSON.stringify(crumbs));
    sessionStorage[Enums.Cookie.servCrumbs] = JSON.stringify(crumbs);
  };

  useEffect(() => {
    initialiseCurrentPage();
  }, []);

  const isFirst = useRef(true);

  useEffect(() => {
    if (props.currPage && props.currPage.type === "list") {
      initialiseCurrentPage();
    }
  }, [props.currPage]);

  const initialiseCurrentPage = () => {
    const localCrumbs = getBreadCrumb();
    if (localCrumbs) {
      if (props.currPage) {
        const last = localCrumbs.length - 1;

        if (props.currPage.type == 'list') {
          let newCrumbs = [{ text: 'Dashboard', link: '/' }];
          newCrumbs.push(props.currPage);
          updateBreadcrumb(newCrumbs);
          return;
        }

        if (props.currPage.type == localCrumbs[last].type) {
          let newCrumbs = [{ text: 'Dashboard', link: '/' }];
          newCrumbs.push(props.currPage);
          updateBreadcrumb(newCrumbs);
          return;
        }

        if (props.currPage.type == 'edit' && localCrumbs[last].type == 'create') {
          let newCrumbs = [...localCrumbs];
          newCrumbs.splice(last, 1);
          newCrumbs.push(props.currPage);
          updateBreadcrumb(newCrumbs);
          return;
        }

        let currPageIndex = -1;
        for (let x = 0; x < localCrumbs.length; x++) {
          if (localCrumbs[x].text == props.currPage.text && localCrumbs[x].link == props.currPage.link) {
            currPageIndex = x;
          }
        }

        if (currPageIndex == -1) {
          let newCrumbs = [...localCrumbs];
          newCrumbs.push(props.currPage);
          updateBreadcrumb(newCrumbs);
        } else if (currPageIndex == localCrumbs.length - 1) {
          updateBreadcrumb(localCrumbs);
        } else {
          let newCrumbs = localCrumbs.slice(0, currPageIndex + 1);
          updateBreadcrumb(newCrumbs);
        }
      } else {
        let newCrumbs = [{ text: 'Dashboard', link: '/' }];
        updateBreadcrumb(newCrumbs);
      }

    } else {
      let newCrumbs = [{ text: 'Dashboard', link: '/' }];
      if (props.currPage) {
        newCrumbs.push(props.currPage);
      }
      updateBreadcrumb(newCrumbs);
    }
  };

  return (
    <Flex className={styles.breadcrumbs} align={'center'} gap={5}>
      {
        mobileView &&
          <Menu transitionProps={{ transition: 'rotate-right', duration: 50 }}>
            <Menu.Target>
              <ActionIcon size={'sm'} variant={'transparent'}>
                <IconChevronRight color={props.color ?? 'var(--mantine-color-scBlue-9)'} stroke={2.1} size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>

              {
                breadcrumbs.map((item: any, key) =>
                    (key !== breadcrumbs.length - 1) &&
                    <Link
                        key={'bclinkitem' + key}
                        style={{
                          textDecoration: 'none'
                        }}
                        // legacyBehavior={true}
                        href={Helper.getLinkRedirect(item.link)}
                        prefetch={false}
                    >
                      <Menu.Item>
                        <Text onClick={() => Helper.nextLinkClicked(item.link)} size={'sm'}>{item.text}</Text>
                      </Menu.Item>
                    </Link>
                )
              }
            </Menu.Dropdown>
      </Menu>
      }
      {props.crumbs
        ? <Text>Crumbs in use! {props.crumbs.join('-')}</Text> /*props.crumbs.map((item, key) =>
          <div className={`${item.suppressLink ? styles.suppressedCrumb : ''} crumb` + extraClass} key={key}>
            {item.suppressLink ? `${item.text}` :
              <Link
                  style={{
                    textDecoration: 'none'
                  }}
                  // legacyBehavior={true}
                  href={Helper.getLinkRedirect(item.link)}
                  prefetch={false}
              >
                <span onClick={() => Helper.nextLinkClicked(item.link)}>{item.text}</span>
              </Link>
            }
            {props.color == 'white'
              ? <img src="/icons/arrow-breadcrumb-white.svg" alt="arrow" />
              : <img src="/icons/arrow-breadcrumb.svg" alt="arrow" />
            }
          </div>
        )*/
        : breadcrumbs.map((item: any, key) =>
          (!mobileView || key === breadcrumbs.length - 1) &&
            <Flex className={"crumb" + extraClass} align={'center'} gap={5} key={'breadcrumb'+key}>
              <Link
                  style={{
                    textDecoration: 'none'
                  }}
                  // legacyBehavior={true}
                  href={Helper.getLinkRedirect(item.link)}
                  prefetch={false}
              >
                <Text onClick={() => Helper.nextLinkClicked(item.link)} fw={key === breadcrumbs.length - 1 ? 600 : 400}>{item.text}</Text>
              </Link>
              {
                key !== breadcrumbs.length - 1 &&
                  <IconChevronRight color={props.color ?? 'var(--mantine-color-scBlue-9)'} stroke={2.1} size={16} />
              }
            </Flex>
        )
      }
    </Flex>
  )
}

Breadcrumbs.defaultProps = {
  text: 'Button',
};

export default Breadcrumbs
