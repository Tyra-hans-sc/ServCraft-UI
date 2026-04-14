import React, { useState, useRef, useEffect} from 'react';
import Helper from '../../utils/helper';
import SearchModal from './search-modal';
import Storage from '../../utils/storage';
import * as Enums from '../../utils/enums';
import {ActionIcon, CloseButton, TextInput, Tooltip} from "@mantine/core";
import {IconSearch} from "@tabler/icons";

function GlobalSearch({navbarwidth}) {

    const iconMode = navbarwidth < 750;

    const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);

    const getAccessStatus = () => {
        let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
        if (subscriptionInfo) {
            setAccessStatus(subscriptionInfo.AccessStatus);
        }
    };

    useEffect(() => {
        getAccessStatus();
    }, []);

    const searchRef = useRef();

    const [searchVal, setSearchVal] = useState('');

    const [showSearchModal, setShowSearchModal] = useState(false);

    useEffect(() => {
        console.log('search changed', showSearchModal)
        if (!showSearchModal) {
            setSearchVal('');
        }
    }, [showSearchModal]);

    useEffect(() => {
        if (searchVal.length > 2) {
            setShowSearchModal(true);
        }
    }, [searchVal]);

    function clearSearch() {
        setSearchVal('');
        // setSearchResults(undefined);
        // setSearchFocus(true);
        // setSearchCleared(true);
    }

    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
        return (<></>);
    }

  return (
    <>
      <div className='search-container'>
          {
              iconMode ?
                  <Tooltip label={'Search'} color={'scBlue'}>
                      <ActionIcon variant={'outline'} radius={'xl'} size={'compact-md'}
                                  style={{
                                      border: '2.5px solid',
                                      padding: 3
                                  }}
                                  onClick={() => setShowSearchModal(true)}
                      >
                          <IconSearch stroke={'3.6'} size={10} mr={-5} />
                      </ActionIcon>
                  </Tooltip>
                  :
                  <TextInput
                      name={Helper.newGuid() + "-autocomplete-off"}
                      ref={searchRef}
                      type={'search'}
                      inputMode={'search'}
                      autoComplete={'off'}
                      autoCapitalize={'off'}
                      autoCorrect={'off'}
                      spellCheck={false}
                      onChange={(e) => setSearchVal(e.currentTarget.value)}
                      value={searchVal}
                      placeholder={"Search here..."}
                      w={'calc(100% - 600px)'}
                      miw={250}
                      maw={400}
                      // maw={'calc(100% - 50%)'}
                      mt={0}
                      /*onChange={(event) =>
                          handleSearchChange(event.currentTarget.value)
                      }*/
                      leftSection={<IconSearch size={16}/>}
                      variant={'filled'}
                      rightSection={searchVal && <CloseButton onClick={clearSearch}/>}
                  />
          }

        {/*<div className='search'>
          <input
            name={Helper.newGuid() + "-autocomplete-off"}
            ref={searchRef}
            onChange={(e) => setSearchVal(e.target.value)}
            value={searchVal}
            placeholder={"Search here..."}
            autoComplete="new-password"
          />
          <div className='action'>
            {searchVal
              ? <img src="/icons/cross-black.svg" alt="clear" className="clear" onClick={() => clearSearch()} />
              : <img className="search-img" src="/sc-icons/search.svg" alt="search button" />
            }
          </div>
        </div>*/}
      </div>

      {showSearchModal ? <SearchModal show={showSearchModal} setShow={setShowSearchModal} incomingValue={searchVal} setIncomingValue={setSearchVal} forceShow={iconMode} /> : ""}
      {/*{<SearchModal show={true} setShow={setShowSearchModal} incomingValue={searchVal} setIncomingValue={setSearchVal} />}*/}

      {/*<style jsx>{`
                .search-container {
                    position: absolute;
                    left: 1rem;
                    width: 300px;
                }
                .search {
                    background-color: ${colors.backgroundGrey};
                    border-radius: ${layout.bigRadius};
                    border: ${colors.darkPrimary} 1px solid;
                    box-sizing: border-box;
                    display: flex;
                    height: 32px;
                    position: relative;
                    width: 100%;
                    pointer-events: auto;
                    padding-left: 1rem;
                  }
                  .search-img {
                      width: 14px;
                  }

                  input {
                    background: none;
                    border: none;
                    box-shadow: none;
                    color: ${colors.subHeading}; 
                    font-size: 14px;
                    height: 100%;
                    outline: none;
                    font-family: ${fontFamily};
                    width: 100%;
                  }
                  label {
                    color: ${colors.labelGrey}; 
                    font-size: ${fontSizes.label};
                    text-align: left;
                  }
                  ::-webkit-input-placeholder { 
                    color: ${colors.blueGrey};
                  }
                  input:-webkit-autofill {
                    -webkit-box-shadow: 0 0 0 30px ${colors.formGrey} inset !important;
                  }
                 
                  .row {
                    display: flex;
                  }
                  .align-center {
                    align-items: center;
                  }
                  .button {
                    align-items: center;
                    background-color: ${colors.bluePrimary};
                    border-radius: 3px;
                    color: ${colors.white};
                    cursor: pointer;
                    display: flex;
                    height: 40px;
                    flex-shrink: 0;
                    margin-left: 2rem;
                    padding: 0px 12px;
                  }
                  .button-clear {
                    background: none;
                    color: ${colors.bluePrimary};
                    cursor: pointer;
                    margin-left: 0;
                  }

                  .dark-loader {
                    display: block;
                  }
                  
                  .action {
                    align-items: center;
                    display: flex;
                    justify-content: center;
                    width: 2.5rem;
                  }

                  .clear {
                    cursor: pointer;
                  }                                  
            `}</style>*/}
    </>
  )
}

export default GlobalSearch;
