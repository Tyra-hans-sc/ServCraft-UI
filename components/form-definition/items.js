import React, { useState, useCallback, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme';
import InlineTextInput from '../inline-text-input';
import Helper from '../../utils/helper';
import Button from '../../components/button';
import Reorder, { reorder } from 'react-reorder';
import * as Enums from '../../utils/enums';
import ManageFormDefinitionField from '../modals/form-definition/manage-form-definition-field';
import ManageSection from '../modals/section/manage-section';

const FormDefinitionFields = ({ formDefinitionFields, updateFormDefinitionFields, inputErrors, accessStatus, formDefinition, updateFormDefinition, structureLocked }) => {

  const [disableReorder, setReorderToDisabled] = useState(true);
  const [sectionGroups, setSectionGroups] = useState([]);
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sections, setSections] = useState([]);

  const onReorder = (event, previousIndex, nextIndex, fromId, toId) => {

    let tempItems = [...formDefinitionFields];
    let item = tempItems.splice(previousIndex, 1);
    tempItems.splice(nextIndex, 0, item[0]);

    tempItems.map((item, i) => {
      item.DisplayOrder = i + 1;
    });

    reorder(tempItems, previousIndex, nextIndex);
    updateFormDefinitionFields(tempItems);
  };

  const handleDescriptionChange = (item, e) => {
    item.Description = e.target.value;
    updateFormDefinitionFields(item);
  };

  const [descriptionEditEnabled, setDescriptionEditEnabled] = useState(false);
  const [descriptionEditIndex, setDescriptionEditIndex] = useState(null);
  const [descriptionFocus, setDescriptionFocus] = useState(false);

  const toggleDescriptionEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setDescriptionEditIndex(index);
    setDescriptionEditEnabled(true);
    setDescriptionFocus(true);
  };

  const resetEdits = () => {
    setDescriptionEditIndex(null);
    setDescriptionEditEnabled(false);
    setDescriptionFocus(false);
  };

  const [showManageFormDefinitionFieldModal, setShowManageFormDefinitionFieldModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isNewItem, setIsNewItem] = useState(true);

  const toggleManageFormDefinitionFieldModal = (item, index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess
      || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    setShowManageFormDefinitionFieldModal(!showManageFormDefinitionFieldModal);
    setItemToEdit(item);

    setIsNewItem(item === null);
  };

  const saveFormDefinitionField = (item) => {

    if (item) {
      let formDefinitionFieldsTemp = [...formDefinitionFields];

      if (isNewItem) {
        let currentLineNumber = 0;
        let fieldsToGetLineNumber = formDefinitionFieldsTemp ?
        formDefinitionFieldsTemp.filter(x => x.IsActive && x.SectionID === item.SectionID).sort((a, b) => a.DisplayOrder - b.DisplayOrder) : [];
        if (fieldsToGetLineNumber.length > 0) {
          currentLineNumber = fieldsToGetLineNumber[fieldsToGetLineNumber.length - 1].DisplayOrder + 1;
        }
        item.ID = Helper.newGuid();
        item.DisplayOrder = currentLineNumber;
        formDefinitionFieldsTemp.push(item);
      } else {
        let editIndex = formDefinitionFieldsTemp.findIndex(x => x.ID === item.ID);
        let temp = {
          ...formDefinitionFieldsTemp[editIndex],
          Description: item.Description,
          DataType: item.DataType,
          DataOption: item.DataOption,
          Required: item.Required,
          Section: item.Section,
          SectionID: item.SectionID
        };
        formDefinitionFieldsTemp[editIndex] = temp;
      }

      if (item.Section && !item.Section.IsActive) {
        item.Section.IsActive = true;
        let formDefTemp = { ...formDefinition };
        let sectionIdx = formDefTemp.Sections ? formDefTemp.Sections.findIndex(x => x.ID === item.SectionID) : -1;
        if (sectionIdx > -1) {
          formDefTemp.Sections[sectionIdx].IsActive = true;
        }
        updateFormDefinition(formDefTemp);
      }

      updateFormDefinitionFields(formDefinitionFieldsTemp);
      getFormDefinitionFieldSections(formDefinitionFieldsTemp);
    }

    setItemToEdit(null);
    setShowManageFormDefinitionFieldModal(false);
  };

  // const updateFormDefinitionField = (item) => {
  //   let temp = [...formDefinitionFields];    
  //   let index = temp.findIndex(x => x.ID == item.ID);
  //   if (index > -1) {
  //     temp[index] = item;
  //     updateFormDefinitionFields(temp);
  //   }
  // };

  const removeFormDefinitionFields = (item) => {
    let temp = [...formDefinitionFields];
    let indexToRemove = temp.findIndex(x => x.ID == item.ID);
    if (indexToRemove > -1) {
      temp.splice(indexToRemove, 1);
      updateFormDefinitionFields(temp);

    }
  };

  const removeSection = (sectionGroup) => {
    let sectionsTemp = [...sections];
    let sectionIdx = sectionsTemp.findIndex(x => x.ID === sectionGroup.id);
    if (sectionIdx > -1) {
      sectionsTemp[sectionIdx].IsActive = false;
      setSections(sectionsTemp);
    }

    let formDefFieldTemp = [...formDefinitionFields];
    let fields = formDefFieldTemp.filter(x => x.SectionID === sectionGroup.id && x.IsActive).sort((a, b) => a.DisplayOrder - b.DisplayOrder);
    let unsectionedFields = formDefFieldTemp.filter(x => x.SectionID === null && x.IsActive).sort((a, b) => a.DisplayOrder - b.DisplayOrder);
    let displayOrder = unsectionedFields.length > 0 ? unsectionedFields[unsectionedFields.length - 1].DisplayOrder + 1 : 0;
    fields.forEach(field => {
      field.Section = null;
      field.SectionID = null;
      field.DisplayOrder = displayOrder;
      displayOrder++;
    });
    updateFormDefinitionFields(formDefFieldTemp);

    let formDefTemp = { ...formDefinition };
    sectionIdx = formDefTemp.Sections ? formDefTemp.Sections.findIndex(x => x.ID === sectionGroup.id) : -1;
    if (sectionIdx > -1) {
      formDefTemp.Sections[sectionIdx].IsActive = false;
      updateFormDefinition(formDefTemp);
    }

    getFormDefinitionFieldSections(formDefFieldTemp);
  };

  useEffect(() => {
    getFormDefinitionFieldSections();
  }, []);

  useEffect(() => {
    getFormDefinitionFieldSections();
  }, [formDefinition, formDefinitionFields]);



  const editFormDefinitionField = (formDefinitionField, index) => {
    toggleManageFormDefinitionFieldModal(formDefinitionField, index);
  };

  const getFormDefinitionFieldSections = (fdfields = formDefinitionFields) => {
    let groups = [];
    let sectionsTemp = [];
    let defaultGroup = {
      id: null,
      displayOrder: -1,
      heading: "",
      repeatable: false,
      childGroups: [],
      items: fdfields.filter(x => !x.SectionID).sort((a, b) => a.DisplayOrder - b.DisplayOrder).map(x => {
        return {
          field: x, displayOrder: x.DisplayOrder
        };
      })
    };
    groups.push(defaultGroup);

    fdfields.filter(x => x.SectionID).sort((a, b) => a.DisplayOrder - b.DisplayOrder).forEach(field => {
      let idx = groups.findIndex(x => x.id === field.SectionID);
      let sectionField = {
        field: field,
        displayOrder: field.DisplayOrder
      };
      if (idx > -1) {
        groups[idx].items.push(sectionField);
      } else {
        sectionsTemp.push(field.Section);
        groups.push({
          id: field.SectionID,
          parentID: field.Section.ParentSectionID,
          displayOrder: field.Section.DisplayOrder,
          heading: field.Section.Heading,
          repeatable: field.Section.Repeatable,
          items: [sectionField],
          childGroups: []
        });
      }
    });

    groups = groups.sort((a, b) => a.displayOrder - b.displayOrder);
    groups.filter(x => x.displayOrder > -1).forEach((group, idx) => {
      group.displayOrder = idx;
      group.items.forEach(item => {
        item.field.Section.DisplayOrder = idx;
      });
    });

    let groupsForNesting = [];
    groupsForNesting = groups.filter(group => !group.parentID).sort((a, b) => a.displayOrder - b.displayOrder);
    groupsForNesting.forEach((gfn, idx) => {
      gfn.displayOrder = idx;
      gfn.childGroups = groups.filter(group => !!group.parentID && group.parentID === gfn.id).sort((a, b) => a.displayOrder - b.displayOrder);
      gfn.childGroups.forEach((cg, cIdx) => {
        cg.displayOrder = cIdx;
      });
    });

    setSectionGroups(groupsForNesting);
    setSections(sectionsTemp);
  };

  const editingSectionOnSave = (section) => {
    setIsEditingSection(false);
    setEditingSection(null);

    console.log(section);

    if (section) {
      let formDefDummy = { ...formDefinition };

      if (!formDefDummy.Sections) {
        formDefDummy.Sections = [];
      }

      let idx = formDefDummy.Sections.findIndex(x => x.ID === section.ID);
      if (idx > -1) {
        formDefDummy.Sections[idx] = section;
      }

      let formDefFieldsDummy = [...formDefinitionFields];
      formDefFieldsDummy.filter(x => x.SectionID === section.ID).forEach(x => x.Section = section);

      updateFormDefinition(formDefDummy);
      updateFormDefinitionFields(formDefFieldsDummy);
      getFormDefinitionFieldSections(formDefFieldsDummy);
    }
  };

  const borderDragStyle = `2px solid ${colors.bluePrimary}aa`;

  const onDragOver = useCallback((e, field, section) => {
    let rect = e.target.getBoundingClientRect();
    let center = (rect.y + rect.height + rect.y) / 2;
    let position = e.pageY;
    let above = position <= center;
    let target = e.target;
    while (target.tagName !== "TR") {
      target = target.parentElement;
    }

    if (above) {
      target.style.borderTop = borderDragStyle;
      target.style.borderBottom = "none";
    } else {
      target.style.borderBottom = borderDragStyle;
      target.style.borderTop = "none";
    }

    e.preventDefault();
  });

  const onDragLeave = useCallback((e, field, section) => {
    let rect = e.target.getBoundingClientRect();
    let center = (rect.y + rect.height + rect.y) / 2;
    let position = e.pageY;
    let above = position <= center;

    let target = e.target;
    while (target.tagName !== "TR") {
      target = target.parentElement;
    }
    target.style.borderBottom = "none";
    target.style.borderTop = "none";

    e.preventDefault();
  });


  const onDrop = useCallback((e, field, section) => {

    let rect = e.target.getBoundingClientRect();
    let center = (rect.y + rect.height + rect.y) / 2;
    let position = e.pageY;
    let above = position <= center;

    let target = e.target;
    while (target.tagName !== "TR") {
      target = target.parentElement;
    }
    target.style.borderBottom = "none";
    target.style.borderTop = "none";

    let item = JSON.parse(e.dataTransfer.getData("item"));

    let dragField = item.field;
    let dragSection = item.section;
    let dropField = field;
    let dropSection = section;

    let fieldsTemp = [...formDefinitionFields];
    let defTemp = { ...formDefinition };
    let sectionsTemp = [...sections];
    let canUpdate = false;

    // drag section onto section
    if (dragSection && dropSection) {

      // do nothing
      if (dragSection.id === dropSection.id) return;

      // normalise
      sectionsTemp = sectionsTemp.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
      sectionsTemp.filter(x => x.IsActive).forEach((section, idx) => section.DisplayOrder = idx);

      let thisDragSection = sectionsTemp.find(x => x.ID === dragSection.id);
      let thisDropSection = sectionsTemp.find(x => x.ID === dropSection.id);
      let newDisplayOrder = above ? thisDropSection.DisplayOrder : thisDropSection.DisplayOrder + 1;
      thisDragSection.DisplayOrder = newDisplayOrder;

      // shift everything down that needs to be
      sectionsTemp.filter(x => x.IsActive && x.DisplayOrder >= newDisplayOrder && x.ID !== thisDragSection.ID).forEach((section, idx) => section.DisplayOrder++);
      // normalise
      sectionsTemp.filter(x => x.IsActive).sort((a, b) => a.DisplayOrder - b.DisplayOrder).forEach((section, idx) => section.DisplayOrder = idx);

      fieldsTemp.filter(x => x.SectionID).forEach(field => {
        let sectionMatch = sectionsTemp.find(x => x.ID === field.SectionID);
        field.Section.DisplayOrder = sectionMatch.DisplayOrder;
        defTemp.Sections.find(x => x.ID === field.SectionID).DisplayOrder = sectionMatch.DisplayOrder;
      });

      canUpdate = true;
    }

    // drag field onto section
    if (dragField && dropSection) {

      let thisField = fieldsTemp.find(x => x.ID === dragField.ID);
      let oldSectionID = thisField.SectionID;
      thisField.Section = sections.find(x => x.ID === dropSection.id);
      thisField.SectionID = thisField.Section.ID;

      let preSorted = fieldsTemp.filter(x => x.SectionID === dropSection.id).sort((a, b) => a.DisplayOrder - b.DisplayOrder);
      preSorted.forEach((fld, idx) => fld.DisplayOrder = idx);
      thisField.DisplayOrder = preSorted.length > 0 ? preSorted[preSorted.length - 1].DisplayOrder + 1 : 0;

      fieldsTemp.filter(x => x.SectionID === oldSectionID).sort((a, b) => a.DisplayOrder - b.DisplayOrder).forEach((fld, idx) => fld.DisplayOrder = idx);
      fieldsTemp.filter(x => x.SectionID === dropSection.id).sort((a, b) => a.DisplayOrder - b.DisplayOrder).forEach((fld, idx) => fld.DisplayOrder = idx);

      canUpdate = true;
    }

    // drag field onto field
    if (dragField && dropField) {

      // do nothing
      if (dragField.ID === dropField.ID) return;

      let oldSectionID = dragField.SectionID;
      let newSectionID = dropField.SectionID;
      let newDisplayOrder = above ? dropField.DisplayOrder : dropField.DisplayOrder + 1;
      let thisField = fieldsTemp.find(x => x.ID === dragField.ID);
      thisField.SectionID = dropField.SectionID;
      thisField.Section = dropField.Section;
      fieldsTemp.filter(x => x.SectionID === newSectionID && x.DisplayOrder >= newDisplayOrder).forEach(x => x.DisplayOrder++);
      thisField.DisplayOrder = newDisplayOrder;
      fieldsTemp.filter(x => x.SectionID === oldSectionID).sort((a, b) => a.DisplayOrder - b.DisplayOrder).forEach((fld, idx) => fld.DisplayOrder = idx);
      fieldsTemp.filter(x => x.SectionID === newSectionID).sort((a, b) => a.DisplayOrder - b.DisplayOrder).forEach((fld, idx) => fld.DisplayOrder = idx);
      canUpdate = true;
    }

    // drag field onto default non-section
    if (dragField && !dropField && !dropSection) {

      let oldSectionID = dragField.SectionID;
      let thisField = fieldsTemp.find(x => x.ID === dragField.ID);
      thisField.SectionID = null;
      thisField.Section = null;

      let preSorted = fieldsTemp.filter(x => !x.SectionID).sort((a, b) => a.DisplayOrder - b.DisplayOrder);
      preSorted.forEach((fld, idx) => fld.DisplayOrder = idx);
      thisField.DisplayOrder = preSorted.length > 0 ? preSorted[preSorted.length - 1].DisplayOrder + 1 : 0;

      fieldsTemp.filter(x => !x.SectionID).sort((a, b) => a.DisplayOrder - b.DisplayOrder).forEach((fld, idx) => fld.DisplayOrder = idx);
      fieldsTemp.filter(x => x.SectionID === oldSectionID).sort((a, b) => a.DisplayOrder - b.DisplayOrder).forEach((fld, idx) => fld.DisplayOrder = idx);

      canUpdate = true;
    }

    if (canUpdate) {
      setSections(sectionsTemp);
      updateFormDefinitionFields(fieldsTemp, true);
      updateFormDefinition(defTemp);
      getFormDefinitionFieldSections(fieldsTemp);
    }
  });


  const plotSectionGroups = (sectionGroupsToPlot) => {
    return <>
      {sectionGroupsToPlot.map((section, sectionIdx) => {
        let isDefault = section.id === null;
        let heading = section.heading;
        let repeatable = section.repeatable;
        let items = section.items;
        let childGroups = section.childGroups;
        let parentID = section.parentID;
        let isChild = !!parentID;

        return (<>
          {sectionIdx > 0 && !parentID ? <>
            <tr style={{ height: "2rem" }}>
              <td colSpan={4}></td>
            </tr>
          </> : ""}

          {isDefault ? "" :
            <tr style={{ height: "2rem", position: "relative" }}
              onDragOver={(e) => onDragOver(e, null, section)}
              onDrop={(e) => onDrop(e, null, section)}
              onDragLeave={(e) => onDragLeave(e, null, section)}>
              <td style={{ background: isChild ? colors.lightGreyYellowStatus : colors.lightGreyStatus }}>
                <DraggableRow locked={structureLocked} isBlue={false} field={null} section={section} />
              </td>
              <td className="section-name" style={{ textAlign: "center", background: isChild ? colors.lightGreyYellowStatus : colors.lightGreyStatus }} colSpan={2}
                onClick={() => { if (structureLocked) return; setEditingSection(sections.find(x => x.ID === section.id)); setIsEditingSection(true); }}>
                <b>{`${heading}${repeatable ? " (Repeatable Section)" : ""}${isChild ? " - Child Section" : ""}`}</b>
              </td>
              <td style={{ background: isChild ? colors.lightGreyYellowStatus : colors.lightGreyStatus }}>
                {!structureLocked && accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ?
                  <img src="/icons/trash-white.svg" alt="delete" onClick={() => removeSection(section)} /> : ""}
              </td>
            </tr>
          }
          {items.map((item, key) => {
            let field = item.field;
            return (
              <tr key={key} style={{ height: "2rem", color: colors.bluePrimary }}
                onDragOver={(e) => onDragOver(e, field, null)}
                onDrop={(e) => onDrop(e, field, null)}
                onDragLeave={(e) => onDragLeave(e, field, null)} >
                <td>
                  <DraggableRow locked={structureLocked} isBlue={true} field={field} section={null} />
                </td>
                <td onClick={() => editFormDefinitionField(field, key)}>{field.Description}</td>
                <td onClick={() => editFormDefinitionField(field, key)}>{Enums.FormDefinitionFieldTypes[field.DataType]}</td>
                <td>
                  {!structureLocked && accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ?
                    <img src="/icons/trash-bluegrey.svg" alt="delete" onClick={() => removeFormDefinitionFields(field)} /> : ""}
                </td>
              </tr>
            );
          })}

          {!!childGroups && childGroups.length > 0 && plotSectionGroups(childGroups)}

        </>);
      })}

      <style jsx>{`
      
      .section-name {
        color: ${colors.bluePrimary};
      }
      .section-name:hover {
        text-decoration: underline;
      }
      :global(.container) {
        width: 100%;
        display: flex;
        flex-direction: column;
      }
      :global(.table-container) {
        overflow-x: auto;
        width: 100%;
        display: flex;
        flex-direction: column;
      }
      :global(.table) {
        border-collapse: collapse;
        margin-top: 1.5rem;
        width: 100%;
      }
      :global(.table thead tr) {
        background-color: ${colors.backgroundGrey};
        height: 3rem;
        border-radius: ${layout.cardRadius};
        width: 100%;
      }
      :global(.table th) {
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
      :global(.table th.number-column) {
        padding-right: 0;
        text-align: right;
      }
      :global(.table th:last-child) {
        padding-right: 1rem;
        text-align: right;
      }
      .table th:first-child {
        padding-left: 0.5rem;
        text-align: left;
      }
      :global(.table .spacer) {
        height: 0.75rem !important;
      }
      :global(.table tr) {
        height: 4rem;
        cursor: pointer;
      }
      :global(.table td) {
        font-size: 12px;
        padding-right: 1rem;
      }
      :global(.table td.number-column) {
        padding-right: 0;
        text-align: right;
      }
      :global(.table tr:nth-child(even) td) {
        background-color: ${colors.background};
      }
      :global(.table td:last-child) {
        border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
        text-align: right;
      }
      :global(.table td:last-child)) :global(div){
        margin-left: auto;
      }
      :global(.table td:first-child) {
        border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
        padding-left: 1rem;
        text-align: left;
      }
      :global(.table td:first-child) :global(div){
        margin-left: 0;
      }

      .reorder-placeholder {

      }
      .reorder-dragged {
        width: 100%;
        height: 4rem !important;
      }
      .reorder-dragged td {
        font-size: 12px;
        min-width: 6rem;
        padding-right: 1rem;
      }

      .header-container {
        background-color: ${colors.backgroundGrey};
        border-radius: ${layout.cardRadius};
        box-sizing: border-box;
        color: ${colors.darkPrimary};
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin-top: 0.5rem;
        padding: 1.25rem 1rem;
        position: relative;
        width: 100%;
      }

      .header-item-move {
        width: 1%;
        min-width: 30px;
      }
      .header-item-code {
        width: 5%;
        min-width: 80px;
      }
      .header-item-desc {
        width: 50%;
      }
      .header-item-discount {
        width: 5%;
        min-width: 120px;
      }
      .header-item-taxrate {
        width: 5%;
        min-width: 120px;
      }
      .header-item-qty {
        width: 5%;
      }
      .header-item-price {
        width: 5%;
        min-width: 120px;
      }
      .header-item-amt {
        width: 5%;
        min-width: 120px;
      }
      .header-item-status {
        width: 5%;
        min-width: 120px;          
      }
      .header-item-delete {
        width: 1%;
        min-width: 30px;
      }
      .body-item-move {
        cursor: move;
      }
      .body-item-code {
        color: ${colors.bluePrimary};
        cursor: pointer;
      }
      .body-item-amt {
        text-align: right;
      }
      .body-item-status {
        
      }
      .status-error {
        color: ${colors.warningRed};
      }
      .status-synced {
        color: ${colors.green};
      }
      .total-container {
        margin-top: 1rem;
      }
      .total-row {
        line-height: 24px;
      }
      .grand-total {
        margin-top: 8px;
        margin-bottom: 8px;
        font-weight: bold;
      }
      .row {
        display: flex;
        justify-content: space-between;
      }
      .column {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      .column-fixed {
        display: flex;
        flex-direction: column;
        width: 500px;
      }
      .justify-end {
        justify-content: flex-end;
      }
      .end {
        align-items: flex-end;
      }
      .error {
        border: 1px solid ${colors.warningRed};
      }
      
      `}</style>
    </>
  }

  return (
    <div className="container">
      <div className="table-container">
        {formDefinitionFields.length > 0 ?
          <table className={`${inputErrors.FormItems ? 'error' : ''} table`}>
            <thead>
              <tr onDragOver={(e) => onDragOver(e, null, null)}
                onDrop={(e) => onDrop(e, null, null)}
                onDragLeave={(e) => onDragLeave(e, null, null)}>
                <th className="header-item-move">
                </th>
                <th className="header-item-desc">
                  DESCRIPTION
                </th>
                <th className="header-item-type">
                  TYPE
                </th>
                <th className="header-item-delete">
                </th>
              </tr>
            </thead>


            <tbody>

              { plotSectionGroups(sectionGroups) }

            </tbody>
          </table>
          : ''
        }
      </div>

      {!structureLocked && accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ? <>
        <div className="row">
          <Button text="Add Item" icon="plus-circle-blue" extraClasses="hollow auto" onClick={() => toggleManageFormDefinitionFieldModal(null, -1)} />
        </div>
      </> : ''}

      {showManageFormDefinitionFieldModal ?
        <ManageFormDefinitionField formDefinitionField={itemToEdit} saveFormDefinitionField={saveFormDefinitionField} isNew={isNewItem}
          formDefinition={formDefinition} updateFormDefinition={updateFormDefinition} structureLocked={structureLocked} /> : ''
      }

      {isEditingSection ? <>
        <ManageSection
          onSave={editingSectionOnSave}
          module={Enums.Module.FormDefinition}
          dontSubmit={!formDefinition || !formDefinition.ID}
          itemID={formDefinition && formDefinition.ID ? formDefinition.ID : null}
          sectionID={editingSection ? editingSection.ID : null}
          newSection={editingSection ? editingSection : null}
          displayOrder={editingSection ? editingSection.DisplayOrder : formDefinition && formDefinition.Sections ? formDefinition.Sections.length : 0}
        />
      </> : ""}

      <style jsx>{`
        .section-name {
          color: ${colors.bluePrimary};
        }
        .section-name:hover {
          text-decoration: underline;
        }
        .container {
          width: 100%;
          display: flex;
          flex-direction: column;
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
          cursor: pointer;
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
          background-color: ${colors.background};
        }
        .table td:last-child {
          border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
          text-align: right;
        }
        .table td:last-child :global(div){
          margin-left: auto;
        }
        .table td:first-child {
          border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
          padding-left: 1rem;
          text-align: left;
        }
        .table td:first-child :global(div){
          margin-left: 0;
        }

        .reorder-placeholder {

        }
        .reorder-dragged {
          width: 100%;
          height: 4rem !important;
        }
        .reorder-dragged td {
          font-size: 12px;
          min-width: 6rem;
          padding-right: 1rem;
        }

        .header-container {
          background-color: ${colors.backgroundGrey};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          display: flex;
          flex-direction: row;
          justify-content: center;
          margin-top: 0.5rem;
          padding: 1.25rem 1rem;
          position: relative;
          width: 100%;
        }

        .header-item-move {
          width: 1%;
          min-width: 30px;
        }
        .header-item-code {
          width: 5%;
          min-width: 80px;
        }
        .header-item-desc {
          width: 50%;
        }
        .header-item-discount {
          width: 5%;
          min-width: 120px;
        }
        .header-item-taxrate {
          width: 5%;
          min-width: 120px;
        }
        .header-item-qty {
          width: 5%;
        }
        .header-item-price {
          width: 5%;
          min-width: 120px;
        }
        .header-item-amt {
          width: 5%;
          min-width: 120px;
        }
        .header-item-status {
          width: 5%;
          min-width: 120px;          
        }
        .header-item-delete {
          width: 1%;
          min-width: 30px;
        }
        .body-item-move {
          cursor: move;
        }
        .body-item-code {
          color: ${colors.bluePrimary};
          cursor: pointer;
        }
        .body-item-amt {
          text-align: right;
        }
        .body-item-status {
          
        }
        .status-error {
          color: ${colors.warningRed};
        }
        .status-synced {
          color: ${colors.green};
        }
        .total-container {
          margin-top: 1rem;
        }
        .total-row {
          line-height: 24px;
        }
        .grand-total {
          margin-top: 8px;
          margin-bottom: 8px;
          font-weight: bold;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .column-fixed {
          display: flex;
          flex-direction: column;
          width: 500px;
        }
        .justify-end {
          justify-content: flex-end;
        }
        .end {
          align-items: flex-end;
        }
        .error {
          border: 1px solid ${colors.warningRed};
        }
      `}</style>
    </div>
  );
};

export default FormDefinitionFields;

export function DraggableRow({ isBlue, field, section, locked = false }) {

  const [dragging, setDragging] = useState(false);

  const onDragStart = (e) => {
    e.dataTransfer.setData("item", JSON.stringify({ field, section }));
    setDragging(true);
  };

  const onDragEnd = (e) => {
    setDragging(false);
  };



  return locked ? ("") : (<>
    <img src={`/icons/hamburger${isBlue ? "-blue" : ""}.svg`} height="24" onDragStart={onDragStart} onDragEnd={onDragEnd} />
  </>);
};

