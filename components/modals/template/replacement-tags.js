import React, { useState, useEffect, useContext } from 'react';
import { colors, layout } from '../../../theme';
import Table from '../../table';
import Fetch from '../../../utils/Fetch';
import ToastContext from '../../../utils/toast-context';
import Search from '../../../components/search';
import SCModal from "@/PageComponents/Modal/SCModal";
import {Button} from '@mantine/core';

function ReplacementTags({module, closeReplacementModal}) {

  const toast = useContext(ToastContext);

  const columns = React.useMemo(() => [{
      Header: 'Group',
      accessor: 'Group'
    }, {
      Header: 'Name',
      accessor: 'Name'
    },
    {
      Header: 'Description',
      accessor: 'Description'
    },
  ], []);

  const [replacementTags, setReplacementTags] = useState([{}]);
  const [searching, setSearching] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  async function getReplacementTags() {
    setSearching(true);
    const response = await Fetch.get({
      url: `/Template/GetReplacementTagList?module=${module}&searchPhrase=${searchVal}`
    });
    setReplacementTags(response.Results);
    setSearching(false);
  }

  useEffect(() => {
    getReplacementTags();
  }, []);

  function copyItem(row) {
    copyToClipboard(`{{${row.original.Name}}}`);
    toast.setToast({
      message: 'Replacement tag copied',
      show: true,
      type: 'success'
    });
  }

  function copyToClipboard(itemToCopy) {
    let textField = document.createElement('textarea');
    textField.innerText = itemToCopy;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
  }

  return (
      <SCModal
          open
          decor={'none'}
          onClose={closeReplacementModal}
          size={'lg'}
      >
        <div>
          <div className="title">
            <h1>Replacement Tags</h1>
          </div>

          <div className="row">
            <div className="search-container">
              <Search
                  placeholder="Search Group and Name"
                  resultsNum={replacementTags.length}
                  searchVal={searchVal}
                  setSearchVal={setSearchVal}
                  searchFunc={getReplacementTags}
              />
            </div>
          </div>

          <div className={"table-container" + (replacementTags.length != 0 ? " table-container-visible" : "")}>
            <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
              <div className="loader"></div>
            </div>
            {replacementTags ?
                <Table columns={columns} data={replacementTags} rowClick={(row) => copyItem(row)}/>
                : ''
            }
          </div>

          <div>
            <Button
                mt={'sm'}
                variant={'outline'}
                w={'100%'}
                onClick={() => closeReplacementModal()}
            >
                Close
            </Button>
          </div>
        </div>

        <style jsx>{`
          .overlay {
            align-items: center;
            background-color: rgba(19, 106, 205, 0.9);
            bottom: 0;
            display: flex;
            justify-content: center;
            left: 0;
            position: fixed;
            right: 0;
            top: 0;
            z-index: 9999;
          }

          .container {
            background-color: ${colors.white};
            border-radius: ${layout.cardRadius};
            padding: 2rem 3rem;
            width: 38rem;
          }

          .table-container {
            height: 400px;
            overflow-y: auto;
          }

          .search-container :global(.search) {
            width: 100%;
          }

          .row {
            display: flex;
          }

          .space-between {
            justify-content: space-between;
          }

          .align-end {
            align-items: flex-end;
          }

          .title {
            color: ${colors.bluePrimary};
            font-size: 1.125rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }

          .arrow {
            padding: 0.25rem 1rem;
          }

          .close {
            width: 6rem;
          }

          .column {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            margin-left: 1.5rem;
          }

          .table-container-visible {
            display: block;
          }

          .loading-overlay {
            align-items: center;
            background-color: rgba(245, 248, 251, 0.6);
            bottom: 0;
            border-radius: 8px;
            display: none;
            justify-content: center;
            left: -1rem;
            position: absolute;
            right: -1rem;
            top: 0.5rem;
          }

          .loading-overlay-visible {
            display: flex;
          }

          .loading-overlay :global(.loader) {
            border-color: rgba(28, 37, 44, 0.2);
            border-left-color: ${colors.darkPrimary};
            border-width: 0.25rem;
            display: flex;
            height: 1.5rem;
            width: 1.5rem;
          }
        `}</style>
      </SCModal>
  );
}

export default ReplacementTags
