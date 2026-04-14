import {FC, useEffect, useRef, useState} from "react";
import {ActionIcon, Box, darken, Flex, TableTh, Text} from "@mantine/core";
import {IconArrowUp} from "@tabler/icons";
import {ColHeadingProps, SortProps} from "@/PageComponents/Table/table-model";
import {useWindowEvent} from "@mantine/hooks";
import tableStyles from './ScTableData.module.css';


const ScTableHeading: FC<{col: ColHeadingProps; onSort: (colName: string) => void; sortProps: SortProps; onUpdateWidth: (newWidth: number | 'auto') => void}> =
    ({col, onSort, sortProps, onUpdateWidth}) => {

    const elementSize = {width: 75}

    const [width, setWidth] = useState<string | number>(+col.width > (elementSize.width) ? col.width : (elementSize.width))

    useEffect(() => {
        if(col.width) {
            if(!dragging) {
                setWidth(col.width)
            }
            // widthRef.current = +col.width
        }
    }, [col.width])

    const [dragging, setDragging] = useState<boolean>(false)

    const handleResize = (e) => {
        if (dragging) {
            if (+width) {
                setWidth(p => {
                    return (+p + e.movementX)
                })
            } else {
                setWidth(
                    (sizeRef.current?.offsetWidth ?? 250) + e.movementX
                )
            }
        }
    }

    useWindowEvent('mouseup', () => {
        if(dragging) {
            setDragging(false)
            const size = (sizeRef.current?.offsetWidth ?? 250) - 10
            if(width < size) {
                setWidth(size)
                onUpdateWidth(size)
            } else {
                onUpdateWidth(+width)
            }
        }

    })
    useWindowEvent('mousemove', handleResize)
    const sizeRef = useRef<HTMLTableCellElement>(null)
    const headingTextElement = useRef<HTMLSpanElement>(null)

    return (
        <TableTh
            ref={sizeRef}
            style={{
                width: col.width === 'auto' ? 'min-content' : width && 100 || 'auto'
            }}
        >
            <Flex
                justify={'space-between'}
                miw={width}
                className={tableStyles.headingContainer}
                pl={'.5rem'}
                mih={'2.4rem'}
            >
                <Flex
                    style={() => ({
                        cursor: dragging ? 'ew-resize' : (col.sortable ?? true) ? 'pointer' : 'default',
                        flexGrow: 1
                        // '&:hover #dragDrop': {opacity: 1}
                    })}
                    id={'arrow'}
                    onClick={() => (col.sortable ?? true) && onSort(col.name)}
                    align={'center'}
                    px={3}
                >
                  <>
                      <Text lineClamp={2} fw={700} c={'gray.7'} size={'sm'}>
                          <span ref={headingTextElement}>{col.label}</span>
                      </Text>
                       <span style={{width: 20}} />
                  </>

                    <span style={{position: 'relative', height: '100%'}}>
                        <span style={{position: 'absolute', left: -22, top: '10%'}}>
                        {
                            sortProps.SortExpression === col.name &&
                            <ActionIcon variant={'transparent'} pos={'absolute'} color={'gray'}>
                                <IconArrowUp size={14} style={{
                                    transition: '500ms cubic-bezier(.49,.5,0,1.39)',
                                    transform: sortProps.SortDirection === 'ascending' ? 'rotate(180deg)' : ''
                                }}/>
                            </ActionIcon>
                        }
                        </span>
                    </span>
                </Flex>
                <Flex>
                    <Box
                        ml={'auto'}
                        id={'resize'}
                        className={tableStyles.headingDragContainer}
                        w={7}
                        mih={'100%'}
                        onDoubleClick={() => {
                            setWidth((sizeRef.current?.offsetWidth ?? 250) + 30)
                            onUpdateWidth((sizeRef.current?.offsetWidth ?? 250) + 30)
                        }}
                        onMouseDown={() => setDragging(true)}
                        // onMouseUpCapture={() => setDragging(0)}
                    />
                </Flex>

            </Flex>

        </TableTh>

    )
}


export default ScTableHeading