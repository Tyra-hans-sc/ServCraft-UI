import React, { useState, useEffect, useContext, useRef } from 'react';
import { Pager } from '@progress/kendo-react-data-tools';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import Storage from '../../utils/storage';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import ToastContext from '../../utils/toast-context';

function KendoPager({ pageSizeChanged, pageChanged, parentPageNumber, totalResults, searchValue, ignoreCookieInitialPageSize = null }) {

  const toast = useContext(ToastContext);

  const [pageSizes, setPageSizes] = useState([10, 20, 50, 100]);
  const pageSizeCookieIgnored = !isNaN(parseInt(ignoreCookieInitialPageSize));

  const getPageSize = () => {
    if (pageSizeCookieIgnored) {
      setPageSize(ignoreCookieInitialPageSize);
      pageSizeChanged(ignoreCookieInitialPageSize);
    } else {
      let size = parseInt(Storage.getCookie(Enums.Cookie.pageSize));
      if (size > 0) {
        setPageSize(size);
        pageSizeChanged(size);
      } else {
        size = 10;
        setPageState({ ...pageState, take: size });
      }
    }
  };

  useEffect(() => {
    getPageSize();
  }, []);

  let firstLoad = useRef(true);
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    resetPageState();
  }, [searchValue]);

  useEffect(() => {
    if (parentPageNumber === undefined || !pageState || pageState.take < 10) return;
    if ((parentPageNumber - 1) * pageState.take !== pageState.skip) {
      resetPageState();
    }
  }, [parentPageNumber]);

  const setPageSize = async (pageSize) => {

    setTimeout(() => {
      setPageState({ ...pageState, take: pageSize });
    }, 10);

    if (pageSizeCookieIgnored) {
      return;
    }

    let originalSize = parseInt(Storage.getCookie(Enums.Cookie.pageSize));
    Storage.setCookie(Enums.Cookie.pageSize, pageSize);

    if (window.location.href.toLowerCase().indexOf("customerzone") > -1) {
      return;
    }

    if (originalSize == pageSize) {
      return;
    }

    await Fetch.put({
      url: `/Employee/pagesize?pageSize=${pageSize}`,
      toastCtx: toast
    });
  };

  const initialPageState = {
    skip: 0,
    take: 10,
    buttonCount: 5,
    info: true,
    type: 'numeric',
    pageSizes: true,
    previousNext: true,
  };

  const resetPageState = () => {
    setPageState({ ...pageState, skip: 0 });
  };

  const [pageState, setPageState] = useState(initialPageState);
  let { skip, take, ...rest } = pageState;

  const handlePageChange = (event) => {
    const { skip, take } = event;

    if (take != pageState.take) {
      setPageSize(take);
      pageSizeChanged(take);
    }

    if (skip != pageState.skip) {
      pageChanged((skip / take) + 1);
    }

    setPageState({ ...pageState, skip: skip, take: take });
  };

  return (
    <div className={`kendopager ${totalResults === 0 ? "hidden" : ""}`}>
      <Pager
        skip={skip}
        take={take}
        buttonCount={pageState.buttonCount}
        info={pageState.info}
        onPageChange={handlePageChange}
        pageSizes={pageState.pageSizes ? pageSizes : undefined}
        previousNext={pageState.previousNext}
        total={totalResults}
      />
    </div>
  )
}

export default KendoPager;
