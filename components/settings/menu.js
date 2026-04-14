import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import * as Enums from '../../utils/enums';
import PS from '../../services/permission/permission-service';
import Storage from '../../utils/storage';
import Helper from '../../utils/helper';
import { getPagePermissions, lockedWithoutAccessPermissions } from '../../utils/auth';
import { Card } from '@mantine/core';

const hasWarehouseFeature = true; // TODO add feature for this
function SettingsMenu({ urlPath, hideShadow = false }) {

  const [permissions, setPermissions] = useState({});
  const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);
  const [multiStoreTenant, setMultiStoreTenant] = useState(false);

  const [menuGroups, setMenuGroups] = useState([]);

  useEffect(() => {

    let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);

    if (subscriptionInfo) {
      setAccessStatus(subscriptionInfo.AccessStatus);
      setMultiStoreTenant(subscriptionInfo.MultiStore);
    }

    let updatePerms = {
      ...permissions,
      MasterOfficeAdmin: PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin),
      EditCompany: PS.hasPermission(Enums.PermissionName.EditCompany, true),
      UserManagement: PS.hasPermission(Enums.PermissionName.UserManagement),
      ChangeMyPassword: PS.hasPermission(Enums.PermissionName.ChangeMyPassword),
      Integrations: PS.hasPermission(Enums.PermissionName.Integrations),
      Subscriptions: PS.hasPermission(Enums.PermissionName.Subscriptions)
    };

    if (subscriptionInfo.AccessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      updatePerms = {};
      lockedWithoutAccessPermissions.forEach(item => {
        updatePerms[item.key] = PS.hasPermission(item.value);
      });
    }

    setPermissions(updatePerms);
    updateMenuGroups(updatePerms, subscriptionInfo.MultiStore);
  }, []);

  function updateMenuGroups(perms, multiStore) {
    let groups = [];
    const groupNameCompany = "COMPANY";
    const groupNameSettings = "SETTINGS";
    const groupNameTemplates = "TEMPLATES";
    const groupNameAccount = "MY DETAILS";

    const getGroup = (name) => {
      let match = groups.find(x => x.name === name);
      if (!match) {
        match = {
          name: name,
          items: []
        };
        groups.push(match);
      }
      return match;
    };

    const newGroupItem = ({ label, url, navKey, weight, colour }) => {
      return {
        label, url, navKey, weight, colour
      };
    };



    if (perms.EditCompany) {
      let group = getGroup(groupNameCompany);
      group.items.push(newGroupItem({ label: "Details", url: "/settings/company/manage", navKey: "/settings/company" }));
    }

    if (perms.UserManagement) {
      let group = getGroup(groupNameCompany);
      group.items.push(newGroupItem({ label: "Employees", url: "/settings/employee/list", navKey: "/settings/employee" }));
    }

    if (perms.EditCompany && multiStore) {
      let group = getGroup(groupNameCompany);
      group.items.push(newGroupItem({ label: "Stores", url: "/settings/store/list", navKey: "/settings/store" }));
    }

    if (perms.Integrations) {
      let group = getGroup(groupNameCompany);
      group.items.push(newGroupItem({ label: "Integrations", url: "/settings/integration/manage", navKey: "/settings/integration" }));
    }

    if (perms.MasterOfficeAdmin) {
      let group = getGroup(groupNameCompany);
      group.items.push(newGroupItem({ label: "Payment Gateway", url: "/settings/payment/payfast", navKey: "/settings/payment" }));
    }

    if (perms.MasterOfficeAdmin) {
      let group = getGroup(groupNameCompany);
      group.items.push(newGroupItem({ label: "Imports", url: "/settings/import/list", navKey: "/settings/import" }));
    }

    if (perms.Subscriptions) {
      let group = getGroup(groupNameCompany);
      let subscribeText = "Subscription";
      let weight = "inherit";
      let colour = "inherit";
      if (accessStatus === Enums.AccessStatus.Trial) {
        subscribeText = "Subscribe";
        weight = "bold";
        // colour = "green";
      }
      group.items.push(newGroupItem({ label: subscribeText, url: "/settings/subscription/manage", navKey: "/settings/subscription", weight: weight, colour: colour }));
    }

    if (perms.MasterOfficeAdmin) {
      let group = getGroup(groupNameSettings);
      group.items.push(newGroupItem({ label: "Jobs", url: "/settings/job/manage", navKey: "/settings/job" }));
      group.items.push(newGroupItem({ label: "Projects", url: "/settings/project/manage", navKey: "/settings/project" }));
      group.items.push(newGroupItem({ label: "Customers", url: "/settings/customer/manage", navKey: "/settings/customer" }));
      group.items.push(newGroupItem({ label: "Queries", url: "/settings/query/manage", navKey: "/settings/query" }));
      group.items.push(newGroupItem({ label: "Quotes", url: "/settings/quote/manage", navKey: "/settings/quote" }));
      group.items.push(newGroupItem({ label: "Invoices", url: "/settings/invoice/manage", navKey: "/settings/invoice" }));
      group.items.push(newGroupItem({ label: "Purchases", url: "/settings/purchase/manage", navKey: "/settings/purchase" }));
      group.items.push(newGroupItem({ label: "Assets", url: "/settings/asset/manage", navKey: "/settings/asset" }));
      group.items.push(newGroupItem({ label: "Inventory", url: "/settings/inventory/manage", navKey: ["/settings/inventory", "/settings/warehouse"] }));

      group = getGroup(groupNameTemplates);
      group.items.push(newGroupItem({ label: "Triggers", url: "/settings/trigger/list", navKey: "/settings/trigger" }));
      group.items.push(newGroupItem({ label: "Documents", url: "/settings/document/manage", navKey: "/settings/document" }));
      group.items.push(newGroupItem({ label: "Forms", url: "/settings/form/list", navKey: "/settings/form" }));
      group.items.push(newGroupItem({ label: "Web Forms", url: "/settings/webform/list", navKey: "/settings/webform" }));
      group.items.push(newGroupItem({ label: "Messages", url: "/settings/template/list", navKey: "/settings/template" }));
      group.items.push(newGroupItem({ label: "Tasks", url: "/settings/task/list", navKey: "/settings/task/" }));
      group.items.push(newGroupItem({ label: "Signatures", url: "/settings/signaturetemplate/list", navKey: "/settings/signaturetemplate" }));
    }



    if (perms.ChangeMyPassword) {
      let group = getGroup(groupNameAccount);
      group.items.push(newGroupItem({ label: "Update Password", url: "/settings/change-password", navKey: "/settings/change-password" }));
    }

    setMenuGroups(groups);
  };

  const isNavCurrent = (navKey) => {
    if (typeof navKey === "string") {
      return urlPath.indexOf(navKey) > -1;
    }
    else if (Array.isArray(navKey)) {
      let matches = navKey.filter(navKeyItem => urlPath.indexOf(navKeyItem) > -1);
      return matches.length > 0;
    }

    return false;
  }

  return (
    <div className="menu">
      <Card>
        {menuGroups.map((group, groupKey) => {
          return (<div key={groupKey}>
            <p className="nav-group-heading">{group.name}</p>
            {group.items.map((item, itemKey) => {
              return (<Link legacyBehavior={true} key={itemKey} href={item.url}>
                <a className={"link " + (isNavCurrent(item.navKey) ? 'current' : '')} onClick={() => Helper.nextLinkClicked(item.url)}
                  style={{ fontWeight: item.weight, color: item.colour }}>{item.label}</a>
              </Link>);
            })}
          </div>);
        })}

      </Card>

      <style jsx>{`
        .menu {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          /* box-shadow:  0px 8px 16px 0px rgba(51,51,51,0.1); */
          box-shadow:  ${hideShadow ? "none" : shadows.card};
          box-sizing: border-box;
          flex-shrink: 0;
          height: fit-content;
          margin-right: 1rem;
          width: fit-content;
        }
        .link {
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          cursor: pointer;
          display: flex;
          padding: 0.25rem 0.5rem;
          text-decoration: none;
          width: 100%;
        }
        .link:hover {
          background-color: ${colors.backgroundGrey};
          color: ${colors.darkPrimary};
        }
        .current {
          background-color: ${colors.backgroundGrey};
          color: ${colors.darkPrimary};
        }

        .nav-group-heading {
          font-weight: bold;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

      `}</style>
    </div>
  )
}

export default SettingsMenu
