📢 Use this project, [contribute](https://github.com/vtex-apps/shipment-tracker) to it or open issues to help evolve it using [Store Discussion](https://github.com/vtex-apps/store-discussion).

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# Shipment Tracker

Shipment Tracker is a VTEX IO native solution that allows stores to provide built in shipment tracking for their customers. The carriers supported currently are USPS, UPS, Fedex, and Canada Post. Updates can be seen in the orders page, along with email updates being sent out to the customer.

## Configuration
### Step 1 Installing the Shipment Tracker app

Using your terminal, log in to the desired VTEX account and run the following command:

`vtex install vtex.shipment-tracker@0.x`

### Step 2 - Adding in Carriers 

1. In the admin page, scroll down to the carriers section. Currently, the app is configured to provide tracking information for USPS, UPS, FedEx, and Canada Post
2. For the carrier(s) you would like to use, fill in the required fields such as user ID, password, etc. This can be found on the carrier websites, after creating an account and requesting developer access.

## Modus Operandi

The app may be configured to use a **scheduler** where an administrator is responsible for activating regular database updates.

To activate the scheduler, simply toggle the switch in the admin panel.

## Customization

In order to apply CSS customizations in this and other blocks, follow the instructions given in the recipe on [Using CSS Handles for store customization](https://vtex.io/docs/recipes/style/using-css-handles-for-store-customization).
