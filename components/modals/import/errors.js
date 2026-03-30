import React from 'react';
import { colors, layout} from '../../../theme';

import SCModal from "@/PageComponents/Modal/SCModal";
import {Box, Button, Flex, Text} from "@mantine/core";
import SimpleTable from "@/PageComponents/SimpleTable/SimpleTable";

function ImportErrors({ importRecord, closeErrorModal }) {

  const errors = importRecord.Error ? JSON.parse(importRecord.Error) : [];

  const columns = React.useMemo(
    () => [
      {
        Header: 'Row',
        accessor: 'Row'
      },
      {
        Header: 'Column',
        accessor: 'Column'
      },
      {
        Header: 'Error',
        accessor: 'Error'
      },
      {
        Header: 'System Error',
        accessor: 'SystemError'
      }
    ], []
  );

  return (
      <SCModal
          open
          size={'auto'}
          withCloseButton
          onClose={closeErrorModal}
      >

          <Box miw={500} maw={'100%'}>
              <Text c={'red.7'} fw={'bolder'} size={'lg'} >
                  {`${importRecord.AttachmentDescription} errors`}
              </Text>

              <Box mt={'sm'} px={'xs'}>
                  <SimpleTable
                      mapping={[
                          {
                              label: 'Row',
                              key: 'Row',
                              // minColumnWidth: 75
                          },
                          {
                              label: 'Column',
                              key: 'Column',
                              // minColumnWidth: 75,
                          },
                          {
                              label: 'Error',
                              key: 'Error',
                              maxColumnWidth: 250,
                              rowLimit: false

                          }/*,
                          {
                              label: 'System Error',
                              key: 'SystemError'
                          }*/
                      ]}
                      data={errors.map(x => ({...x, Error: x.Error || x.SystemError}))}
                      stylingProps={{
                          darkerText: true,
                          // rows: true,
                          compact: true,

                      }}
                  />
              </Box>
{/*

              {errors.length > 0 ?
                  <div className="table-container">
                      <table className="table">
                          <thead>
                          <tr>
                              <th className="header-item-row">
                                  ROW
                              </th>
                              <th className="header-item-column">
                                  COLUMN
                              </th>
                              <th className="header-item-error">
                                  ERROR
                              </th>
                              <th className="header-item-systemerror">
                                  SYSTEM ERROR
                              </th>
                          </tr>
                          </thead>
                          <tbody>
                          {errors.map((item, index) => {
                              return (
                                  <tr key={index}>
                                      <td className="body-item-row">
                                          {item.Row}
                                      </td>
                                      <td className="body-item-column">
                                          {item.Column}
                                      </td>
                                      <td className="body-item-error">
                                          {item.Error}
                                      </td>
                                      <td className="body-item-systemerror">
                                          {item.SystemError}
                                      </td>
                                  </tr>
                              )
                          })}
                          </tbody>
                      </table>
                  </div> : <div>
                      No errors on this import.
                  </div>}
*/}

              {/* <Table columns={columns} data={errors} /> */}

              <Flex justify={'end'}>
                  <Button
                      mt={'sm'}
                      variant={'light'}
                      color={'gray.7'}
                      onClick={() => closeErrorModal()}
                  >
                      Close
                  </Button>
              </Flex>

              {/*<div className="row">
                  <LegacyButton text="Close" extraClasses="hollow" onClick={() => closeErrorModal()}/>
              </div>*/}

          </Box>

          <style jsx>{`
              .container {
                  background-color: ${colors.white};
                  border-radius: ${layout.cardRadius};
                  padding: 2rem 3rem;
                  width: 38rem;
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

              .update {
                  width: 14rem;
              }

              .column {
                  display: flex;
                  flex-direction: column;
                  flex-grow: 1;
                  margin-left: 1.5rem;
              }

              .table-container {
                  overflow-x: auto;
                  width: 100%;
                  display: flex;
                  flex-direction: column;
              }

              .table {
                  border-collapse: collapse;
                  margin-top: 1.5rem;
                  width: 100%;
              }

              .table thead tr {
                  background-color: ${colors.backgroundGrey};
                  height: 3rem;
                  border-radius: ${layout.cardRadius};
                  width: 100%;
              }

              .table th {
                  color: ${colors.darkPrimary};
                  font-size: 0.75rem;
                  font-weight: normal;
                  padding: 4px 1rem 4px 0;
                  position: relative;
                  text-align: left;
                  text-transform: uppercase;
                  transform-style: preserve-3d;
                  user-select: none;
                  white-space: nowrap;
              }

              .table th.number-column {
                  padding-right: 0;
                  text-align: right;
              }

              .table th:last-child {
                  padding-right: 1rem;
                  text-align: right;
              }

              .table th:first-child {
                  padding-left: 0.5rem;
                  text-align: left;
              }

              .table .spacer {
                  height: 0.75rem !important;
              }

              .table tr {
                  height: 4rem;
              }

              .table td {
                  font-size: 12px;
                  padding-right: 1rem;
              }

              .table td.number-column {
                  padding-right: 0;
                  text-align: right;
              }

              .table tr:nth-child(even) td {
                  background-color: ${colors.white};
              }

              .table td:last-child {
                  border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
              }

              .table td:last-child :global(div) {
                  margin-left: auto;
              }

              .table td:first-child {
                  border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
                  padding-left: 1rem;
                  text-align: left;
              }

              .table td:first-child :global(div) {
                  margin-left: 0;
              }
          `}</style>


      </SCModal>
      /*<div className="overlay" onClick={(e) => e.stopPropagation()}>

      </div>*/
  );
}

export default ImportErrors;
