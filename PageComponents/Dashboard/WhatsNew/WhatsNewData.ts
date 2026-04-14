import * as Enums from '@/utils/enums'
import {MantineStyleProp} from "@mantine/core";
import constants from "@/utils/constants";

interface DetailItem {
    type: 'heading' | 'list' | 'paragraph' | 'info' | 'link' | 'image'
    items: {
        text: string;
        style?: MantineStyleProp | {};
        href?: string;
        src?: string;
    }[]
}

export interface WhatsNewDetail {
    month: string
    sections: {
        title: string
        version: string
        permission?: string
        majorDetail: DetailItem[]
        minorDetail: DetailItem[]
        link?: string
    }[]
}

type WhatsNewData = WhatsNewDetail[]

export const whatsNewData: WhatsNewData = [
    {
        month: '05-05-2025',
        sections: [
            {
                version: '2.28.10',
                title: 'VAT Inclusive Pricing',
                majorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'Financial documents are now enhanced with the ability to capture Inclusive prices'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: 'To use inclusive pricing on a document, simply click on user preferences menu above the table, and toggle the inclusive pricing option. You can now also see a new Total Incl. column.'
                            }
                        ]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: 'Toggle between inclusive and exclusive prices'
                            },
                            {
                                text: 'New Total Incl. column shows VAT-inclusive total per line'
                            },
                            {
                                text: 'Seamlessly switch between pricing modes without affecting your data'
                            }
                        ]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'VAT Inclusive Pricing',
                            src: '/whats-new/vat-inclusive-pricing.png'
                        }]
                    },
                    {
                        type: 'info',
                        items: [{
                            text: 'Your inclusive/exclusive pricing preferences remain user-specific and apply only to screen views.',
                        }]
                    },
                ],
                minorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'VAT Inclusive Pricing Now Available on Quotes, Invoices, and Purchase Orders'
                            }
                        ]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: 'Toggle between inclusive and exclusive prices'
                            },
                            {
                                text: 'See VAT-inclusive total per line'
                            },
                            {
                                text: 'Easily switch between pricing modes as needed'
                            },
                            /*{
                                text: 'Check out the new feature on Quotes, Invoices, and Purchase Orders!',
                                href: '/quote/list'
                            }*/
                        ]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'VAT Inclusive Pricing',
                            src: '/whats-new/vat-inclusive-pricing.png'
                        }]
                    },
                    /*{
                        type: 'link',
                        items: [{
                            text: 'Check out the new feature on Quotes, Invoices, and Purchase Orders!',
                            href: '/quote/list'
                        }]
                    }*/
                ],
                link: '/quote/list'
            },
            {
                permission: 'feature:' + constants.features.STOCK_TAKE,
                version: '2.28.0',
                title: 'Stock Take',
                majorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'Stock take is now ready to be tried out - check out the new menu option! 🚀'
                            }
                        ]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'Stock dashboard',
                            src: '/whats-new/stock-take-dashboard.png'
                        }]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: 'Head over to stock takes and create an item template to start capturing warehouse stock levels for specific items.',
                                href: '/inventory/list?tab=stocktake'
                            },
                            {
                                text: 'Create stock takes for specific users to start capturing directly on their mobile devices in the field, on the fly.'
                            },
                            {
                                text: 'Stock take managers can verify counted quantities and adjust warehouse stock levels automatically'
                            }
                        ]
                    }
                ],
                minorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'Stock take is now ready! 🚀'
                            }
                        ]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'Stock dashboard',
                            src: '/whats-new/stock-take-dashboard.png'
                        }]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: 'Create item templates',
                                href: '/stock-take/template/create'
                            },
                            {
                                text: 'Assign items to mobile stock takers'
                            },
                            {
                                text: 'Verify counts and adjust stock levels automatically'
                            }
                        ]
                    }
                ],
                link: '/inventory/list?tab=stocktake'
            },
            {
                permission: 'feature:' + constants.features.STOCK_TAKE,
                version: '2.28.0',
                title: 'Stock Take Permissions',
                link: '/settings/employee/list',
                majorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'New Stock Take and Stock Take Manager user permissions were added'
                            }
                        ]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'Stock Take User Permissions',
                            src: '/whats-new/stock-take-permissions.png'
                        }]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: 'Normal stock takers will be able to capture stock levels, while managers will have additional access to create, update, and verify stocktakes'
                            }
                        ]
                    }
                ],
                minorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'New Stock Take Permissions',
                            }
                        ]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'Stock Take User Permissions',
                            src: '/whats-new/stock-take-permissions.png'
                        }]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: 'Stock Take permission for capturing stock levels'
                            },
                            {
                                text: 'Stock Take Manager permission for creating, updating, and verifying stocktakes'
                            }
                        ]
                    },
                    /*{
                        type: 'info',
                        items: [
                            {
                                text: 'Check out user permissions in settings',
                                href: '/settings/employee/list'
                            }
                        ]
                    },*/
                ]
            },
        ]
    },
    {
        month: '02-02-2025',
        sections: [
            {
                version: '2.27.0',
                title: 'Inventory Images',
                link: '/inventory/list',
                majorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'You can now attach images to inventory'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: 'Images make it easier to identify specific items in lists. Upload multiple items and select a primary image to show up as a thumbnail in lists!'
                            }
                        ]
                    }
                ],
                minorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'Inventory Images'
                            }
                        ]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: 'Attach multiple images to inventory items'
                            },
                            {
                                text: 'Select a primary image for thumbnail display'
                            },
                            {
                                text: 'Easily identify items in lists with visual references'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    /*{
        month: '01-01-2025',
        sections: [
            {
                version: '2.26.0',
                title: 'Communications & Attachments Updates',
                majorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'Improved User Experience Across the Platform'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: 'We\'ve made significant improvements to both the attachments system and communications tab to enhance your workflow efficiency.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'Attachments System Upgrade'
                            }
                        ]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: 'Intuitive drag and drop functionality for faster file uploads'
                            },
                            {
                                text: 'Redesigned interface with improved file previews'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'Communications Tab Enhancements'
                            }
                        ]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: 'Visual improvements for better readability'
                            },
                            {
                                text: 'Additional information displayed for better context'
                            }
                        ]
                    }
                ],
                minorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'Communications & Attachments Updates'
                            }
                        ]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: 'New drag and drop file upload system'
                            },
                            {
                                text: 'Improved attachments interface with better organization'
                            },
                            {
                                text: 'Enhanced communications tab with visual improvements'
                            }
                        ]
                    }
                ]
            },
        ]
    },*/
    {
        month: '12-12-2024',
        sections: [
            {
                version: '2.25.0',
                title: 'Goods Received Vouchers (GRVs) for Purchase Orders',
                permission: 'feature:' + constants.features.PO_GRV,
                majorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'You can now create Goods Received Vouchers (GRVs) for purchase orders!'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: 'Get started by clicking the ‘Receive Materials’ or ‘Quick Receive’ buttons on an Approved Purchase Order.'
                            }
                        ]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'PO Receive Materials',
                            src: '/whats-new/po-receive.png'
                        }]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: 'GRVs will be visible under the GRV tab and can be printed from there.'
                            },
                        ]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'PO Receive Materials',
                            src: '/whats-new/po-grv-view.png'
                        }]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: 'Received materials amend item stock levels.',
                                href: `/inventory/list?tab=stocktransaction`
                            },
                        ]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: 'GRVs can also be created directly from the Inventory transaction tab.'
                            },
                        ]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'PO Receive Materials',
                            src: '/whats-new/grv-inv-transactions.png'
                        }]
                    },
                ],
                minorDetail: [
                    {
                        type: 'heading',
                        items: [{
                            text: 'You can now generate Goods Received Vouchers (GRVs) for purchase orders!'
                        }]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text:  `Quickly receive materials from a Purchase Order`,
                            },
                            {
                                text:  `Print GRV documents`,
                            },
                            {
                                text:  'Automatic stock level adjustments from received goods',
                            },
                        ]
                    },
                    /*{
                        type: 'image',
                        items: [{
                            text: 'Intuitive Inventory Selection',
                            src: '/whats-new/inventory-sidebar.gif'
                        }]
                    },*/
                ],
                link: '/purchase/list'
            },
            {
                version: '2.24.0',
                title: 'Document Approval Permissions',
                link: '/settings/employee/list',
                majorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'Additional permissions have been added to allow for separate approval of documents!'
                            }
                        ]
                    },
                    /*{
                        type: 'paragraph',
                        items: [
                            {
                                text: 'Employee permissions can be uniquely configured via settings:',
                            }
                        ]
                    },*/
                    {
                        type: 'image',
                        items: [{
                            text: 'Financial Permissions',
                            src: '/whats-new/permissions-financial-documents.png'
                        }]
                    },
                ],
                minorDetail: [
                    {
                        type: 'paragraph',
                        items: [{
                            text: 'Additional permissions have been added to allow for separate approval of documents!'
                        }]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'Financial Permissions',
                            src: '/whats-new/permissions-financial-documents.png'
                        }]
                    },
                ]
            },
        ]
    },
    {
        month: '10-10-2024',
        sections: [
            {
                version: '2.23.0',
                title: 'Stock Control',
                minorDetail: [],
                majorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'Stock Management & Costing for Jobs'
                            },

                        ]
                    },
                    {
                        type: 'info',
                        items: [{
                            text: `We are excited to announce Stock Control and Job Costing! Now you can manage stock levels, track inventory movements, and view profit and loss for your jobs.`
                        }]
                    },
                ],
                permission: 'feature:' + constants.features.STOCK_CONTROL
            }
        ]
    },
    {

        /*
        *
            Inventory selection filters
            Inventory Sidebar updates   (Stock will be hidden for most people) (edited)
            Quote Profit
            Bundles and Sections Available on Mobile 2.2.2 and above
            Look out for Stock Control and Job Costing features being rolled out.
        * */
        month: '09-09-2024',
        sections: [
            {
                title: 'Exciting Inventory Updates & More!',
                version: '2.22.0',
                majorDetail: [
                    /*{
                        type: 'heading',
                        items: [{
                            text: 'Stock Management & Costing for Jobs Coming soon!'
                        }]
                    },
                    {
                        type: 'info',
                        items: [{
                            text: `Get ready for our next thrilling update! 🎉 We’ve been hard at work, building long awaited features—Job Stock Control and Job Costing—and we’re excited to announce that they’ll be rolling out to you over September and October! 🚀 Keep an eye out for updates—you won’t want to miss this`
                        }]
                    },*/
                    {
                        type: 'heading',
                        items: [{
                            text: `Inventory selection made easier!`,
                        }],
                    },
                    {
                        type: 'paragraph',
                        items: [{
                            text: `We have revamped the inventory selection process for quotes, invoices, or job materials.  Simply click on the inventory filter above the selection box and you'll be able to search by category, subcategory, and item type.`
                        }]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'Intuitive Inventory Selection',
                            src: '/whats-new/inventory-selection-filter.gif'
                        }]
                    },
                    {
                        type: 'heading',
                        items: [{
                            text: `New Inventory Sidebar`,
                            // style: {marginTop: ''}
                        }],
                    },
                    {
                        type: 'paragraph',
                        items: [{
                            text: 'Now you can navigate through- and edit- inventory directly from the list screen. We aim to make your inventory management experience smoother than ever!'
                        }]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'A peek at the new inventory sidebar',
                            src: '/whats-new/inventory-sidebar.gif'
                        }]
                    },
                    {
                        type: 'heading',
                        items: [{
                            text: 'Profit Calculation on Quotes! 💡',
                        }],
                    },
                    {
                        type: 'paragraph',
                        items: [{
                            text: 'Now, you can instantly see how much profit you stand to make on every quote you create. It’s a game-changer for better decision-making and maximizing your margins!'
                        }]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'Profit Calculation on Quotes',
                            src: '/whats-new/quote-profit.png'
                        }]
                    },
                ],
                minorDetail: [
                    {
                        type: 'heading',
                        items: [{
                            text: 'We have added exciting new inventory updates'
                        }]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text:  `Inventory selection made easier!`,
                            },
                            {
                                text:  `New Inventory Sidebar`,
                            },
                            {
                                text:  'Profit Estimation for Quotes',
                            },
                            {
                                text:  'Inventory Stock Management is Coming Soon!'
                            },
                        ]
                    },
                    /*{
                        type: 'image',
                        items: [{
                            text: 'Intuitive Inventory Selection',
                            src: '/whats-new/inventory-sidebar.gif'
                        }]
                    },*/
                ]
            }
        ]
    },
    {
        month: '08-08-2024',
        sections: [
            {
                title: 'Layout and Responsiveness',
                version: '2.21.0',
                majorDetail: [
                    {
                        type: 'heading',
                        items: [{
                            text: `We have given the UI a fresh overhaul!`
                        }]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: `Pages will now have a consistent appeal throughout. This update brings an improved experience for mobile and tablet users 📱`,
                            }
                        ]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'Dashboard features',
                            src: '/whats-new/responsiveness-updates.png'
                        }]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: `With the enhancements you will notice:`,
                                style: {fontStyle: 'italic', marginBottom: -1, fontSize: 14}
                            }
                        ]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: `Better form layouts across various devices.`,
                            },
                            {
                                text: `A new table look and feel within modules.`,
                            },
                            {
                                text: `A new toolbar look and feel within modules, which will now fit into any window size.`,
                            },
                            {
                                text: `Enhanced mobile and tablet experience with a revamped design and brand new mobile navigation menu.`,
                            },
                        ]
                    },
                ],
                minorDetail: []
            },
            {
                title: 'Mobile: Sections and Bundles',
                version: '^2.2.2',
                majorDetail: [
                    {
                        type: 'info',
                        items: [
                            {
                                text: `The ServCraft mobile application now also supports creating table sections and adding bundles to job materials, quotes and invoices`,
                            }
                        ]
                    },
                ],
                minorDetail: []
            },
        ]
    },
    {
        month: '07-07-2024',
        sections: [
            {
                title: 'New Dashboard Widgets Added',
                version: '2.20.0',
                majorDetail: [
                    {
                        type: 'heading',
                        items: [{
                            text: `We've updated and added new dashboard widgets! 🐱‍🏍`
                        }]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'Dashboard features',
                            src: '/whats-new/dashboard-widgets.png'
                        }]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: `"What's New" keeps you up to date with the latest features.`
                            },
                            {
                                text: `"Jobs in Status" helps you monitor the number of jobs with specific statuses.`
                            },
                            {
                                text: `Today's Appointments" allows you to keep track of daily appointments and quickly create new ones.`
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: `Feel free to close any widgets you're not actively using.`,
                                style: {fontStyle: 'italic', fontSize: 'small'}
                            }
                        ]
                    }
                ],
                minorDetail: [
                    {
                        type: 'heading',
                        items: [{
                            text: 'We have updated your Dashboard!'
                        }]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: `You can now view your daily Appointments, total Jobs, and see new release announcements, directly from your Dashboard!`,
                                style: {fontStyle: 'italic', fontSize: 'small'}
                            }
                        ]
                    },
                    {
                        type: 'image',
                        items: [{
                            text: 'Dashboard features',
                            src: '/whats-new/dashboard-widgets.png'
                        }]
                    },
                ]
            },
        ]
    },
    {
        month: '06-06-2024',
        sections: [
            {
                title: 'Sections and Bundles',
                version: '2.18.0',
                permission: Enums.PermissionName.Inventory,
                majorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'Job Material, Quote, and Invoice, lists now have Bundles! 🚀'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: 'We are excited to announce that bundles can now be added directly to your quotes and invoices.'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: `Here's what you need to know:`,
                                style: {fontStyle: 'italic', marginBottom: -1, fontSize: 14}
                            }
                        ]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: 'Manage bundles on the Inventory page.',
                                href: `/inventory/list?tab=bundles`
                            },
                            {
                                text: 'Add entire bundles with inventory directly to Job Materials, Quotes, and Invoices.',
                            },
                            {
                                text: 'Material, Quote, and Invoice lists have been overhauled to allow organizing items into sections - simply drag and drop items around!',
                            },
                            {
                                text: 'Choose to display items in detail on printed Quotes and Invoices, or hide them.',
                            }
                        ]
                    },
                    {
                        type: 'image',
                        items: [
                            {
                                text: `drag items around`,
                                src: '/whats-new/bundle-example.gif'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: `Give it a try when you create your next Job, Quote, or Invoice!`,
                                style: {fontStyle: 'italic', fontSize: 'small'}
                            }
                        ]
                    },
                ],
                minorDetail: [],
                link: '/inventory/list?tab=bundles',
            },
            {
                title: 'Bulk Messaging',
                version: '2.17.0',
                // link: '/message/list?tab=bulkMessages&help=/getting-started-with-servcraft/how-to-set-up-automatic-communications',
                link: '/message/list?tab=bulkMessages',
                permission: Enums.PermissionName.Message,
                minorDetail: [],
                majorDetail: [
                    {
                        type: 'heading',
                        items: [
                            {
                                text: 'You can now send notifications to groups of recipients at once!'
                            },
                            {
                                text: `Head over to Messaging to start creating Bulk SMSes 📨📬`
                            }
                        ]
                    },
                    {
                        type: 'list',
                        items: [
                            {
                                text: 'Draft a message to send to multiple people.'
                            },
                            {
                                text: 'Choose who will receive responses.'
                            },
                            {
                                text: 'Schedule messages.'
                            },
                            {
                                text: 'And much more!'
                            }
                        ]
                    },
                    {
                        type: 'info',
                        items: [
                            {
                                text: 'Remember that each SMS uses credits - stock up on credits before sending messages.',
                                // href: '/settings/subscription/manage'
                            },
                        ]
                    },
                ],
            },

        ]
    },
    {
        month: '05-05-2024',
        sections: [
            {
                version: '2.16.0',
                title: `What's New`,
                majorDetail: [
                    {
                        type: 'paragraph',
                        items: [
                            {
                                text: `
                                Welcome to our "What's New" thread! From now on, you’ll find all the latest updates displayed here. We're excited to share all the progress we're making with you and keep you up to date!
                                `,
                                style: {
                                    // marginTop: 10,
                                    // fontSize: 14,
                                }
                            }
                        ]
                    }
                ],
                minorDetail: []
            }
        ]
    }
]
