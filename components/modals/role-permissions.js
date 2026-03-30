import React, { useState } from 'react'
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme'
import TextInput from '../text-input'
import Button from '../button'
import * as Enums from '../../utils/enums'

function RolePermissions({availablePermissions, currentPermissions, setAddingPermissions, savePermissions}) {

  const [selectedPermissions, setSelectedPermissions] = useState(currentPermissions);

  function togglePermission(permission) {
    let newPermissions = [];
    if (selectedPermissions.find(perm => perm.ID == permission.ID)) {
      newPermissions = selectedPermissions.filter(perm => perm.ID != permission.ID);
    } else {
      newPermissions = [
        ...selectedPermissions,
        permission
      ]
    }
    setSelectedPermissions(newPermissions);
  }

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="container">
        <div className="title">
          Add Fields to Status
        </div>
        <div className="option-container">
          {availablePermissions.map(function(permission, index){
            const permissionSelected = selectedPermissions.find(perm => perm.ID == permission.ID);
            return (
              <div className={`option ${permissionSelected ? "selected" : ""}`} onClick={() => togglePermission(permission)}>
                <div className="box"></div>
                {permission.Name}
              </div>
            )
          })}
        </div>
        <div className="row space-between">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => setAddingPermissions(false)}/>
          </div>
          <div className="update">
            <Button text="Update" onClick={() => savePermissions(selectedPermissions)}/>
          </div>
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
          width: 24rem;
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
        .label {
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        .status {
          align-items: center;
          background-color: rgba(28,37,44,0.2);
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          display: flex;
          font-size: 0.75rem;
          font-weight: bold;
          height: 2rem;
          justify-content: center;
          padding: 0 1rem;
          text-align: center;
        }
        .cancel {
          width: 6rem;
        }
        .update {
          width: 14rem;
        }
        .option-container {
          max-height: 26rem;
          overflow-y: scroll;
        }
        .option {
          align-items: center;
          cursor: pointer;
          display: flex;
          height: 2rem;
        }
        .box {
          border: 1px solid ${colors.labelGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          cursor: pointer;
          height: 1rem;
          margin-right: 1rem;
          opacity: 0.4;
          width: 1rem;
        }
        .selected .box {
          background-color: ${colors.bluePrimary};
          background-image: ${tickSvg};
          background-position: center;
          background-repeat: no-repeat;
          background-size: 70%;
          border: none;
          opacity: 1;
        }
      `}</style>
    </div>
  )
}

export default RolePermissions
