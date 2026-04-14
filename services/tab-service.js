import Helper from '../utils/helper';

const updateTabs = (tabs, id) => {
    let tab = tabs.find(x => x.id === id);
    tab.isActive = true;

    let otherTabs = tabs.filter(x => x.id !== id);
    for (var item of otherTabs) {
      item.isActive = false;
    }
    let temp = [...otherTabs, tab];
    return Helper.sortObjectArray(temp, 'id');
};

export default {
    updateTabs,
};
