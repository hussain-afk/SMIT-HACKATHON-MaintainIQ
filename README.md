# MaintainIQ — User Guide & Workflows

MaintainIQ helps teams register industrial assets, locate equipment quickly, and coordinate maintenance handovers.

## 1. Sign in and select your workspace

1. Open MaintainIQ.
2. Enter your work email and password, then select **Authenticate Security**.
3. Or select **Continue with Google Workspace** to sign in with Google.
4. After sign-in, choose your workspace:
   - **Administrative Terminal** — register assets and review handover requests.
   - **Public Portal View (Technician)** — find assets, request handovers, and report maintenance progress.
5. Use **Sign Out** in the dashboard header before leaving a shared device.

> **Note:** Never share your password. This version does not include a password-reset screen; contact your organisation’s administrator if you need access help.

## 2. Register a new asset

This workflow is available in the **Administrative Terminal**.

1. Select **Add Asset**.
2. Enter the required information:
   - **Asset Name** — for example, `Forklift Unit 4`.
   - **Serial Number** — for example, `SN-2049-A`.
   - **Category** — choose Machinery, Facilities, Fleet, or IT.
3. Add a short description when it will help the next operator identify the equipment.
4. Save the asset.

New assets begin with an **Active** status.

## 3. Find an asset quickly

Use the search bar at the top of either dashboard.

- Type an asset name, serial number, or category.
- Results filter while you type.
- During an urgent incident, search by the serial number for the fastest exact match.

Example: enter `SN-2049-A` to find the matching equipment record.

## 4. Request a maintenance handover

This workflow is available from an asset’s detail page in the technician portal.

1. Open the required asset from its card or QR-linked detail page.
2. Keep **1. Request Handover** selected.
3. Enter:
   - Your name
   - Estimated time needed
   - Notes describing the issue, condition, or work required
4. Select **Send Handover Request**.

The asset moves to **Pending Approval** while an administrator reviews the request.

> **Note:** The current handover form records the requesting technician, estimate, and notes. It does not yet provide a separate receiving-operator field. An administrator is the reviewer who accepts or declines the request.

## 5. Review and decide a handover

This workflow is available in the **Administrative Terminal**.

1. Find the request in **Pending Handover Requests**.
2. Review the asset name, serial number, technician name, estimated duration, and notes.
3. Choose one action:
   - **Approve Handover** — changes the asset to **Under Maintenance**.
   - **Reject** — changes the asset back to **Active**.

After either decision, the request is removed from the pending list.

## 6. Report maintenance progress

After a handover is approved:

1. Return to the asset detail page.
2. Select **2. Report Progress**.
3. Choose the current status:
   - **Active** — equipment is available for normal use.
   - **Under Maintenance** — maintenance work is ongoing.
   - **Inactive** — equipment is unavailable or requires attention.
4. Add clear technician notes.
5. Submit the update.

The progress area stays locked until an administrator approves the handover and the asset reaches **Under Maintenance**.

## Status reference

| Status | What it means | What to do |
| --- | --- | --- |
| Active | Asset is available for normal operation. | Monitor or use normally. |
| Pending Approval | A technician has requested maintenance handover. | Administrator reviews the request. |
| Under Maintenance | Handover is approved and maintenance can be reported. | Technician performs and records work. |
| Inactive | Asset is unavailable or has a fault. | Escalate and document the condition. |

> A rejected request returns the asset to **Active**. The current interface shows a confirmation message but does not keep a separate rejected-request history.
