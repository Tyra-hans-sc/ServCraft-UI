import {useState} from "react";
import NoSSR from '../../../utils/no-ssr';
import { TileLayout } from "@progress/kendo-react-layout";

function SCTileLayout({columns, rowHeight, positions, setPositions, items}) {

    const [gap, setGap] = useState({
        rows: 10,
        columns: 10,
    });

    const handleReposition = (e) => {
        setPositions(e.value);
    };

    return (
        <NoSSR>
            <TileLayout 
                columns={columns}
                rowHeight={rowHeight}
                positions={positions}
                gap={gap}
                items={items}
                onReposition={handleReposition}
                
            />
        </NoSSR>
    )
}

export default SCTileLayout;
