import { useEffect } from 'react';

const useTableResize = (columns) => {

    let focusedID = "";
    let endX = -1;
    let resizing = false;

    const windowOnMouseMove = (ev) => {
    };
    
    
    
    useEffect(() => {
        columns.forEach(column => {

            let id = `resize${column.id}`;
            let item = document.getElementById(id);
            console.log(item);
            let items = document.getElementsByClassName(column.id);
            console.log(items);

            items.forEach(itemm => {
                itemm.style.width = "500px !important";
            });
        });
    }, [columns]);
    
    
    
    useEffect(() => {

        // columns.forEach(column => {
        //     console.log(column);
        // });

        window.addEventListener("mousemove", windowOnMouseMove);

        columns.forEach(column => {

            let id = `resize${column.id}`;
            let item = document.getElementById(id);
            console.log(item);
            let items = document.getElementsByClassName(column.id);
            console.log(items);

            items.forEach(itemm => {
                itemm.style.width = "500px !important";
            });
        });


        return () => {
            window.removeEventListener("mousemove", windowOnMouseMove);
        };
    }, []);

};

export default useTableResize;