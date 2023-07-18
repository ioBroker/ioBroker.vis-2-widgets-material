import Generic from './Generic';

const simpleState = (device, role, style, settings) => {
    const set = device.states.find(state => state.common.role === role);
    if (!set) {
        return null;
    }
    if (device.common.icon) {
        if (settings) {
            delete settings.iconSmall;
            delete settings.iconEnabledSmall;
            settings.icon = device.common.icon;
        } else {
            settings = { icon: device.common.icon };
        }
    }
    return {
        tpl: 'tplMaterial2SimpleState',
        data: {
            widgetTitle: Generic.t(device.deviceType).replace('vis_2_widgets_material_', ''),
            wizardId: device._id,
            values_count: 0,
            g_common: true,
            oid: set?._id,
            circleSize: 0,
            withNumber: false,
            withStates: false,
            ...(settings || {}),
        },
        style,
    };
};

const ICONS = {
    motion:       'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMy41IDUuNWMxLjEgMCAyLS45IDItMnMtLjktMi0yLTJzLTIgLjktMiAycy45IDIgMiAyek05LjggOC45TDcgMjNoMi4xbDEuOC04bDIuMSAydjZoMnYtNy41bC0yLjEtMmwuNi0zQzE0LjggMTIgMTYuOCAxMyAxOSAxM3YtMmMtMS45IDAtMy41LTEtNC4zLTIuNGwtMS0xLjZjLS40LS42LTEtMS0xLjctMWMtLjMgMC0uNS4xLS44LjFMNiA4LjNWMTNoMlY5LjZsMS44LS43Ii8+PC9zdmc+',
    fire:         'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMy41LjY3cy43NCAyLjY1Ljc0IDQuOGMwIDIuMDYtMS4zNSAzLjczLTMuNDEgMy43M2MtMi4wNyAwLTMuNjMtMS42Ny0zLjYzLTMuNzNsLjAzLS4zNkM1LjIxIDcuNTEgNCAxMC42MiA0IDE0YzAgNC40MiAzLjU4IDggOCA4czgtMy41OCA4LThDMjAgOC42MSAxNy40MSAzLjggMTMuNS42N3pNMTEuNzEgMTljLTEuNzggMC0zLjIyLTEuNC0zLjIyLTMuMTRjMC0xLjYyIDEuMDUtMi43NiAyLjgxLTMuMTJjMS43Ny0uMzYgMy42LTEuMjEgNC42Mi0yLjU4Yy4zOSAxLjI5LjU5IDIuNjUuNTkgNC4wNGMwIDIuNjUtMi4xNSA0LjgtNC44IDQuOHoiLz48L3N2Zz4=',
    flood:        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0yMS45OCAxNEgyMmgtLjAyek01LjM1IDEzYzEuMTkgMCAxLjQyIDEgMy4zMyAxYzEuOTUgMCAyLjA5LTEgMy4zMy0xYzEuMTkgMCAxLjQyIDEgMy4zMyAxYzEuOTUgMCAyLjA5LTEgMy4zMy0xYzEuMTkgMCAxLjQuOTggMy4zMSAxdi0yYy0xLjE5IDAtMS40Mi0xLTMuMzMtMWMtMS45NSAwLTIuMDkgMS0zLjMzIDFjLTEuMTkgMC0xLjQyLTEtMy4zMy0xYy0xLjk1IDAtMi4wOSAxLTMuMzMgMWMtMS4xOSAwLTEuNDItMS0zLjMzLTFjLTEuOTUgMC0yLjA5IDEtMy4zMyAxdjJjMS45IDAgMi4xNy0xIDMuMzUtMXptMTMuMzIgMmMtMS45NSAwLTIuMDkgMS0zLjMzIDFjLTEuMTkgMC0xLjQyLTEtMy4zMy0xYy0xLjk1IDAtMi4xIDEtMy4zNCAxYy0xLjI0IDAtMS4zOC0xLTMuMzMtMWMtMS45NSAwLTIuMSAxLTMuMzQgMXYyYzEuOTUgMCAyLjExLTEgMy4zNC0xYzEuMjQgMCAxLjM4IDEgMy4zMyAxYzEuOTUgMCAyLjEtMSAzLjM0LTFjMS4xOSAwIDEuNDIgMSAzLjMzIDFjMS45NCAwIDIuMDktMSAzLjMzLTFjMS4xOSAwIDEuNDIgMSAzLjMzIDF2LTJjLTEuMjQgMC0xLjM4LTEtMy4zMy0xek01LjM1IDljMS4xOSAwIDEuNDIgMSAzLjMzIDFjMS45NSAwIDIuMDktMSAzLjMzLTFjMS4xOSAwIDEuNDIgMSAzLjMzIDFjMS45NSAwIDIuMDktMSAzLjMzLTFjMS4xOSAwIDEuNC45OCAzLjMxIDFWOGMtMS4xOSAwLTEuNDItMS0zLjMzLTFjLTEuOTUgMC0yLjA5IDEtMy4zMyAxYy0xLjE5IDAtMS40Mi0xLTMuMzMtMWMtMS45NSAwLTIuMDkgMS0zLjMzIDFjLTEuMTkgMC0xLjQyLTEtMy4zMy0xQzMuMzggNyAzLjI0IDggMiA4djJjMS45IDAgMi4xNy0xIDMuMzUtMXoiLz48L3N2Zz4=',
    windowOpened: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzYxcHgiCgkgaGVpZ2h0PSIzNjFweCIgdmlld0JveD0iMCAwIDM2MSAzNjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM2MSAzNjE7Ij4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMjYzLjMwM2MwLDMuOTEtMy4xNTYsNy4wODItNy4wNSw3LjA4MgoJCWwtMTU3Ljg4NSwwLjAyMWMtMy44OTQsMC03LjA1LTMuMTcxLTcuMDUtNy4wODN2LTE1Ny41YzAtMy45MTEsMy4xNTYtNy4wODMsNy4wNS03LjA4M2wxNTcuODg1LTAuMDIxCgkJYzMuODk0LDAsNy4wNSwzLjE3Miw3LjA1LDcuMDgzVjI2My4zMDN6Ii8+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggc3R5bGU9ImZpbGw6Y3VycmVudENvbG9yOyIgZD0iTTIyOC41LDIwNS41ODRjMi4yMTMsMCw0LjQyNiwwLDYuNjM5LDBjMi43MjYsMCw1LTIuMjc0LDUtNXMtMi4yNzQtNS01LTUKCQkJCWMtMi4yMTMsMC00LjQyNiwwLTYuNjM5LDBjLTIuNzI2LDAtNSwyLjI3NC01LDVTMjI1Ljc3NCwyMDUuNTg0LDIyOC41LDIwNS41ODRMMjI4LjUsMjA1LjU4NHoiLz4KCQk8L2c+Cgk8L2c+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMTAzLjIwOGMwLDIuNDg1LTIuNzExLDQuNS02LjA1Myw0LjUKCQlsLTE1OS44OCwwLjAyMWMtMy4zNDIsMC02LjA1Mi0yLjAxNS02LjA1Mi00LjV2LTljMC0yLjQ4NSwyLjcxLTQuNSw2LjA1Mi00LjVsMTU5Ljg4LTAuMDIxYzMuMzQyLDAsNi4wNTMsMi4wMTUsNi4wNTMsNC41VjEwMy4yMDgKCQl6Ii8+Cgk8cGF0aCBzdHlsZT0iZGlzcGxheTpub25lO2ZpbGw6bm9uZTtzdHJva2U6Y3VycmVudENvbG9yO3N0cm9rZS13aWR0aDoxMDtzdHJva2UtbWl0ZXJsaW1pdDoxMDsiIGQ9Ik0yNjQuNzMyLDI2NS4xNzgKCQljMC41ODQsMi44ODctMS42MjksNS4yMjgtNC45NDIsNS4yMjhIMTAyLjQ1N2MtMy4zMTMsMC02LjQ3NC0yLjM0MS03LjA1OC01LjIyOEw3NC4yNCwxMzAuNjMzCgkJYy0wLjU4NC0yLjg4NywxLjYyOC01LjIyOCw0Ljk0Mi01LjIyOGgxNTcuMzMzYzMuMzEzLDAsNi40NzQsMi4zNCw3LjA1OCw1LjIyOEwyNjQuNzMyLDI2NS4xNzh6Ii8+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggc3R5bGU9ImZpbGw6Y3VycmVudENvbG9yOyIgZD0iTTIzMi44MjYsMjgwLjkwNWMtMC4zMzksMy4zNTYtMTguODEzLTAuNzgyLTIwLjkxOS0xLjA2Yy0xNS4wMjQtMS45OC0zMC4wNDktMy45Ni00NS4wNzMtNS45NAoJCQkJYy0xNS4wMjUtMS45OC0zMC4wNDktMy45Ni00NS4wNzQtNS45NGMtNC44MzUtMC42MzgtOS42NzEtMS4yNzUtMTQuNTA3LTEuOTEyYy0xLjQ1Ni0wLjE5Mi02LjIwMS0wLjA1NS02LjQxMi0yLjE0NwoJCQkJYy0wLjYyMS02LjE1NywwLTEyLjY5OSwwLTE4Ljg3OGMwLTE0LjUsMC0yOSwwLTQzLjVjMC0yNy4zNTksMC01NC43MTgsMC04Mi4wNzZjMC0xLjcxLDAtMy40MiwwLTUuMTMKCQkJCWMwLTIuNTUxLDUuMTg0LTEuMDE1LDYuNDEyLTAuODUzYzExLjgxMywxLjU1NywyMy42MjUsMy4xMTQsMzUuNDM4LDQuNjdjMjcuOTA4LDMuNjc4LDU1LjgxNiw3LjM1Niw4My43MjMsMTEuMDM1CgkJCQljMS40NTcsMC4xOTIsNi4yMDEsMC4wNTUsNi40MTIsMi4xNDdjMC4xNjksMS42NzMsMCwzLjQ1MSwwLDUuMTNjMCwxMS4yMTcsMCwyMi40MzQsMCwzMy42NTFjMCwzMC42NDIsMCw2MS4yODMsMCw5MS45MjUKCQkJCUMyMzIuODI2LDI2OC4zMiwyMzIuODI2LDI3NC42MTIsMjMyLjgyNiwyODAuOTA1YzAsNi40NDgsMTAsNi40NDgsMTAsMGMwLTQ4LjE1MSwwLTk2LjMwMywwLTE0NC40NTRjMC0xLjcxLDAtMy40MiwwLTUuMTMKCQkJCWMwLTcuNjE5LTYuMTM3LTEwLjc5My0xMi42NzMtMTEuNjU1Yy05LjUxMS0xLjI1My0xOS4wMjEtMi41MDctMjguNTMxLTMuNzZjLTI5LjQ3LTMuODg0LTU4Ljk0LTcuNzY4LTg4LjQxMS0xMS42NTIKCQkJCWMtMy4yOTktMC40MzUtNi41OTgtMC44Ny05Ljg5Ny0xLjMwNGMtNi41NTUtMC44NjQtMTIuNDczLDQuOS0xMi40NzMsMTEuMzhjMCw2LjUyMSwwLDEzLjA0MiwwLDE5LjU2MwoJCQkJYzAsMzAuNzA1LDAsNjEuNDEsMCw5Mi4xMTVjMCwxMS4wNTIsMCwyMi4xMDQsMCwzMy4xNTRjMCwyLjAyMy0wLjA3MSw0LjA0LDAuMTMyLDYuMDUzYzAuNzE3LDcuMTExLDYuNjA2LDkuNTYzLDEyLjc1OSwxMC4zNzQKCQkJCWMyNS42MDksMy4zNzUsNTEuMjE4LDYuNzUsNzYuODI3LDEwLjEyNWMxMy4yOTksMS43NTMsMjYuNTk4LDMuNTA2LDM5Ljg5Niw1LjI1OWMzLjIzMiwwLjQyNiw2LjQ2NSwwLjg1Miw5LjY5NywxLjI3OAoJCQkJYzcuMDYzLDAuOTMxLDEyLjAxMS00Ljc3OCwxMi42NzMtMTEuMzQ2QzI0My40NzMsMjc0LjQ5LDIzMy40NjcsMjc0LjU1MywyMzIuODI2LDI4MC45MDV6Ii8+CgkJPC9nPgoJPC9nPgo8L2c+Cjwvc3ZnPgo=',
    windowClosed: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzYxcHgiCgkgaGVpZ2h0PSIzNjFweCIgdmlld0JveD0iMCAwIDM2MSAzNjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM2MSAzNjE7Ij4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMjYzLjMwM2MwLDMuOTEtMy4xNTYsNy4wODItNy4wNSw3LjA4MgoJCWwtMTU3Ljg4NSwwLjAyMWMtMy44OTQsMC03LjA1LTMuMTcxLTcuMDUtNy4wODN2LTE1Ny41YzAtMy45MTEsMy4xNTYtNy4wODMsNy4wNS03LjA4M2wxNTcuODg1LTAuMDIxCgkJYzMuODk0LDAsNy4wNSwzLjE3Miw3LjA1LDcuMDgzVjI2My4zMDN6Ii8+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggc3R5bGU9ImZpbGw6Y3VycmVudENvbG9yOyIgZD0iTTI1OC41LDE4NS41ODRjMi4yMTMsMCw0LjQyNiwwLDYuNjM5LDBjMi43MjYsMCw1LTIuMjc0LDUtNXMtMi4yNzQtNS01LTUKCQkJCWMtMi4yMTMsMC00LjQyNiwwLTYuNjM5LDBjLTIuNzI2LDAtNSwyLjI3NC01LDVTMjU1Ljc3NCwxODUuNTg0LDI1OC41LDE4NS41ODRMMjU4LjUsMTg1LjU4NHoiLz4KCQk8L2c+Cgk8L2c+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMTAzLjIwOGMwLDIuNDg1LTIuNzExLDQuNS02LjA1Myw0LjUKCQlsLTE1OS44OCwwLjAyMWMtMy4zNDIsMC02LjA1Mi0yLjAxNS02LjA1Mi00LjV2LTljMC0yLjQ4NSwyLjcxLTQuNSw2LjA1Mi00LjVsMTU5Ljg4LTAuMDIxYzMuMzQyLDAsNi4wNTMsMi4wMTUsNi4wNTMsNC41VjEwMy4yMDgKCQl6Ii8+Cgk8cGF0aCBzdHlsZT0iZGlzcGxheTpub25lO2ZpbGw6bm9uZTtzdHJva2U6Y3VycmVudENvbG9yO3N0cm9rZS13aWR0aDoxMDtzdHJva2UtbWl0ZXJsaW1pdDoxMDsiIGQ9Ik0yNjQuNzMyLDI2NS4xNzgKCQljMC41ODQsMi44ODctMS42MjksNS4yMjgtNC45NDIsNS4yMjhIMTAyLjQ1N2MtMy4zMTMsMC02LjQ3NC0yLjM0MS03LjA1OC01LjIyOEw3NC4yNCwxMzAuNjMzCgkJYy0wLjU4NC0yLjg4NywxLjYyOC01LjIyOCw0Ljk0Mi01LjIyOGgxNTcuMzMzYzMuMzEzLDAsNi40NzQsMi4zNCw3LjA1OCw1LjIyOEwyNjQuNzMyLDI2NS4xNzh6Ii8+CjwvZz4KPC9zdmc+Cg==',
    windowTilted: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzYxcHgiCgkgaGVpZ2h0PSIzNjFweCIgdmlld0JveD0iMCAwIDM2MSAzNjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM2MSAzNjE7Ij4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMjYzLjMwM2MwLDMuOTEtMy4xNTYsNy4wODItNy4wNSw3LjA4MgoJCWwtMTU3Ljg4NSwwLjAyMWMtMy44OTQsMC03LjA1LTMuMTcxLTcuMDUtNy4wODN2LTE1Ny41YzAtMy45MTEsMy4xNTYtNy4wODMsNy4wNS03LjA4M2wxNTcuODg1LTAuMDIxCgkJYzMuODk0LDAsNy4wNSwzLjE3Miw3LjA1LDcuMDgzVjI2My4zMDN6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMTAzLjIwOGMwLDIuNDg1LTIuNzExLDQuNS02LjA1Myw0LjUKCQlsLTE1OS44OCwwLjAyMWMtMy4zNDIsMC02LjA1Mi0yLjAxNS02LjA1Mi00LjV2LTljMC0yLjQ4NSwyLjcxLTQuNSw2LjA1Mi00LjVsMTU5Ljg4LTAuMDIxYzMuMzQyLDAsNi4wNTMsMi4wMTUsNi4wNTMsNC41VjEwMy4yMDgKCQl6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2NS43MzIsMjY1LjE3OAoJCWMwLjU4NCwyLjg4Ny0xLjYyOSw1LjIyOC00Ljk0Miw1LjIyOEgxMDMuNDU3Yy0zLjMxMywwLTYuNDc0LTIuMzQxLTcuMDU4LTUuMjI4TDc1LjI0LDEzMC42MzMKCQljLTAuNTg0LTIuODg3LDEuNjI4LTUuMjI4LDQuOTQyLTUuMjI4aDE1Ny4zMzNjMy4zMTMsMCw2LjQ3NCwyLjM0LDcuMDU4LDUuMjI4TDI2NS43MzIsMjY1LjE3OHoiLz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBzdHlsZT0iZmlsbDpjdXJyZW50Q29sb3I7IiBkPSJNMjQ3LjE5NCwxOTkuNjY3YzIuMjEzLDAsNC40MjYsMCw2LjYzOSwwYzIuNzI2LDAsNS0yLjI3NCw1LTVzLTIuMjc0LTUtNS01CgkJCQljLTIuMjEzLDAtNC40MjYsMC02LjYzOSwwYy0yLjcyNiwwLTUsMi4yNzQtNSw1UzI0NC40NjksMTk5LjY2NywyNDcuMTk0LDE5OS42NjdMMjQ3LjE5NCwxOTkuNjY3eiIvPgoJCTwvZz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
    doorOpened:   'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzYxcHgiCgkgaGVpZ2h0PSIzNjFweCIgdmlld0JveD0iMCAwIDM2MSAzNjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM2MSAzNjE7Ij4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTIzOC42MDcsMjY1LjQ2YzAsMy4xNDctMi41MDYsNi4xNC01LjU5OCw2LjY4NQoJCWwtODUuODEzLDE1LjEzMWMtMy4wOTEsMC41NDUtNS41OTYtMS41NjMtNS41OTYtNC43MVY5Ny43MTNjMC0zLjE0NiwyLjUwNS02LjEzOSw1LjU5Ni02LjY4NGw4NS44MTMtMTUuMTMxCgkJYzMuMDkyLTAuNTQ1LDUuNTk4LDEuNTY0LDUuNTk4LDQuNzFWMjY1LjQ2eiIvPgoJPGc+CgkJPGc+CgkJCTxwYXRoIHN0eWxlPSJmaWxsOmN1cnJlbnRDb2xvcjsiIGQ9Ik0xNDQuNzc3LDE5NC40NTNjMy4wOC0wLjU0Myw2LjE1OS0xLjA4Nyw5LjIzOC0xLjYzYzIuNjg3LTAuNDc0LDQuMTYzLTMuNzEyLDMuNDkyLTYuMTUKCQkJCWMtMC43NzMtMi44MTEtMy40NjktMy45NjYtNi4xNS0zLjQ5MmMtMy4wOCwwLjU0My02LjE1OSwxLjA4Ny05LjIzOCwxLjYzYy0yLjY4NywwLjQ3NC00LjE2MywzLjcxMi0zLjQ5Miw2LjE1CgkJCQlDMTM5LjM5OSwxOTMuNzcxLDE0Mi4wOTYsMTk0LjkyNywxNDQuNzc3LDE5NC40NTNMMTQ0Ljc3NywxOTQuNDUzeiIvPgoJCTwvZz4KCTwvZz4KCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOmN1cnJlbnRDb2xvcjtzdHJva2Utd2lkdGg6MTA7c3Ryb2tlLW1pdGVybGltaXQ6MTA7IiBkPSJNMjM4LjYwNywyNjUuNjk4CgkJYzAsMy4xNDctMi45MzYsNS42OTgtNi41NTcsNS42OThIMTMxLjUyOGMtMy42MjEsMC02LjU1Ni0yLjU1MS02LjU1Ni01LjY5OFY4MC44NDZjMC0zLjE0NiwyLjkzNi01LjY5Nyw2LjU1Ni01LjY5N2gxMDAuNTIzCgkJYzMuNjIxLDAsNi41NTcsMi41NTEsNi41NTcsNS42OTdWMjY1LjY5OHoiLz4KPC9nPgo8L3N2Zz4K',
    doorClosed:   'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzYxcHgiCgkgaGVpZ2h0PSIzNjFweCIgdmlld0JveD0iMCAwIDM2MSAzNjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM2MSAzNjE7Ij4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTIzMi44MzYsMjgwLjkxMgoJCWMwLDMuNDA2LTIuNzEzLDYuMTY4LTYuMDU5LDYuMTY4aC05Mi44OWMtMy4zNDYsMC02LjA1OC0yLjc2Mi02LjA1OC02LjE2OFY4MC44MTZjMC0zLjQwNiwyLjcxMi02LjE2Nyw2LjA1OC02LjE2N2g5Mi44OQoJCWMzLjM0NiwwLDYuMDU5LDIuNzYxLDYuMDU5LDYuMTY3VjI4MC45MTJ6Ii8+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggc3R5bGU9ImZpbGw6Y3VycmVudENvbG9yOyIgZD0iTTEyOS44MywxODUuNjY3YzMuMzMzLDAsNi42NjcsMCwxMCwwYzYuNDQ5LDAsNi40NDktMTAsMC0xMGMtMy4zMzMsMC02LjY2NywwLTEwLDAKCQkJCUMxMjMuMzgxLDE3NS42NjcsMTIzLjM4MSwxODUuNjY3LDEyOS44MywxODUuNjY3TDEyOS44MywxODUuNjY3eiIvPgoJCTwvZz4KCTwvZz4KCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOmN1cnJlbnRDb2xvcjtzdHJva2Utd2lkdGg6MTA7c3Ryb2tlLW1pdGVybGltaXQ6MTA7IiBkPSJNMjMxLjE2MywyODBjMC0zLjMxMy0yLjY4Ny02LTYtNkgxMzMuODMKCQljLTMuMzEzLDAtNiwyLjY4Ny02LDZ2MC42NjdjMCwzLjMxMywyLjY4Nyw2LDYsNmg5MS4zMzNjMy4zMTMsMCw2LTIuNjg3LDYtNlYyODB6Ii8+CjwvZz4KPC9zdmc+Cg==',
    socket:       'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwczEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek05IDEyYy0uNTUgMC0xLS40NS0xLTFWOGMwLS41NS40NS0xIDEtMXMxIC40NSAxIDF2M2MwIC41NS0uNDUgMS0xIDF6bTUgNmgtNHYtMmMwLTEuMS45LTIgMi0yczIgLjkgMiAydjJ6bTItN2MwIC41NS0uNDUgMS0xIDFzLTEtLjQ1LTEtMVY4YzAtLjU1LjQ1LTEgMS0xczEgLjQ1IDEgMXYzeiIvPjwvc3ZnPg==',
    volume:       'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0zIDl2Nmg0bDUgNVY0TDcgOUgzem0xMy41IDNBNC41IDQuNSAwIDAgMCAxNCA3Ljk3djguMDVjMS40OC0uNzMgMi41LTIuMjUgMi41LTQuMDJ6TTE0IDMuMjN2Mi4wNmMyLjg5Ljg2IDUgMy41NCA1IDYuNzFzLTIuMTEgNS44NS01IDYuNzF2Mi4wNmM0LjAxLS45MSA3LTQuNDkgNy04Ljc3cy0yLjk5LTcuODYtNy04Ljc3eiIvPjwvc3ZnPg==',
};

export const getDeviceWidget = device => {
    const style = {
        left: '0px',
        top: '0px',
        width: '100%',
        position: 'relative',
    };
    // const widgetTitle = Generic.getText(device.common.name);

    if (device.deviceType === 'thermostat') {
        const set = device.states.find(state => state.common.role === 'level.temperature');
        const actual = device.states.find(state => state.common.role === 'value.temperature');
        style.height = 160;
        return {
            tpl: 'tplMaterial2Thermostat',
            style,
            data: {
                widgetTitle: Generic.t(device.deviceType).replace('vis_2_widgets_material_', ''),
                wizardId: device._id,
                'oid-step': '1',
                g_common: true,
                count: 5,
                'oid-temp-set': set?._id || '',
                'oid-temp-actual': actual?._id || '',
            },
        };
    }
    if (device.deviceType === 'light') {
        return simpleState(device, 'switch.light', style);
    }
    if (device.deviceType === 'dimmer') {
        return simpleState(device, 'level.dimmer', style);
    }
    if (device.deviceType === 'blind') {
        const set = device.states.find(state => state.common.role === 'level.blind');
        style.height = 120;
        return {
            tpl: 'tplMaterial2Blinds',
            style,
            data: {
                widgetTitle: Generic.t(device.deviceType).replace('vis_2_widgets_material_', ''),
                wizardId: device._id,
                sashCount: 1,
                g_common: true,
                ratio: 1,
                borderWidth: 3,
                oid: set?._id,
            },
        };
    }
    if (device.deviceType === 'temperature') {
        const actual = device.states.find(state => state.common.role === 'value.temperature');
        const humidity = device.states.find(state => state.common.role === 'value.humidity');
        return {
            tpl: 'tplMaterial2Actual',
            style,
            data: {
                widgetTitle: Generic.t(device.deviceType).replace('vis_2_widgets_material_', ''),
                wizardId: device._id,
                timeInterval: 12,
                updateInterval: 60,
                'oid-main': actual?._id,
                'oid-secondary': humidity?._id,
            },
        };
    }
    if (device.deviceType === 'motion') {
        return simpleState(device, 'sensor.motion', style, {
            colorEnabled: 'rgba(52,170,68,1)',
            iconSmall: ICONS.motion,
        });
    }
    if (device.deviceType === 'fireAlarm') {
        return simpleState(device, 'sensor.alarm.fire', style, {
            colorEnabled: '#F00',
            iconSmall:  ICONS.fire,
        });
    }
    if (device.deviceType === 'floodAlarm') {
        return simpleState(device, 'sensor.alarm.flood', style, {
            colorEnabled: '#00F',
            iconSmall: ICONS.flood,
        });
    }
    if (device.deviceType === 'door') {
        return simpleState(device, 'sensor.door', style, {
            colorEnabled: '#F00',
            iconSmall: ICONS.doorClosed,
            iconEnabledSmall: ICONS.doorOpened,
        });
    }
    if (device.deviceType === 'levelSlider') {
        return simpleState(device, 'level', style);
    }
    if (device.deviceType === 'lock') {
        return simpleState(device, 'switch.lock', style);
    }
    if (device.deviceType === 'socket') {
        return simpleState(device, 'socket', style, {
            iconSmall: ICONS.socket,
        });
    }
    if (device.deviceType === 'media') {
        const mediaTypes = ['title', 'artist', 'cover', 'state', 'duration', 'elapsed', 'prev', 'next', 'volume', 'mute', 'repeat', 'shuffle'];
        const currentMediaTypes = [...mediaTypes];

        const result = {
            tpl: 'tplMaterial2Player',
            style,
            data: {
                wizardId: device._id,
                noCard: false,
                widgetTitle: Generic.getText(device.roomName),
            },
        };
        device.states.forEach(_state => {
            const role = _state?.common?.role?.match(/^(media\.mode|media|button|level)\.(.*)$/)?.[2];
            if (role && currentMediaTypes.includes(role)) {
                currentMediaTypes.splice(currentMediaTypes.indexOf(role), 1);
                result.data[role] = _state._id;
            }
        });
        return result;
    }
    if (device.deviceType === 'volume') {
        return simpleState(device, 'level.volume', style, {
            iconSmall: ICONS.volume,
        });
    }
    if (device.deviceType === 'volumeGroup') {
        return simpleState(device, 'level.volume.group', style, {
            iconSmall: ICONS.volume,
        });
    }
    if (device.deviceType === 'weatherForecast') {
        return {
            tpl: 'tplOpenWeatherMapWeather',
            style,
            data: {
                widgetTitle: Generic.t(device.deviceType).replace('vis_2_widgets_material_', ''),
                wizardId: device._id,
                type: 'all',
                g_common: true,
                days: '6',
                instance: '0',
            },
        };
    }
    if (device.deviceType === 'window') {
        return simpleState(device, 'sensor.window', style, {
            colorEnabled: '#F00',
            iconSmall: ICONS.windowClosed,
            iconEnabledSmall: ICONS.windowOpened,
        });
    }
    if (device.deviceType === 'windowTilt') {
        return simpleState(device, 'value.window', style, {
            colorEnabled: '#F00',
            iconSmall: ICONS.windowClosed,
            iconEnabledSmall: ICONS.windowTilted,
        });
    }

    return false;
};

export const getDeviceWidgetOnePage = (device, widgetId, parentWidget, viewObj) => {
    const addSwitch = (role, settings) => {
        if (device.common.icon) {
            if (settings) {
                delete settings.iconSmall;
                settings.icon = device.common.icon;
            } else {
                settings = { icon: device.common.icon };
            }
        }
        const set = device.states.find(state => state.common.role === role);
        if (set) {
            // add only if state does not exist
            for (let i = 1; i <= parentWidget.data.count; i++) {
                if (parentWidget.data[`oid${i}`] === set._id) {
                    return false;
                }
            }

            parentWidget.data.count++;
            parentWidget.data[`oid${parentWidget.data.count}`] = set._id;
            parentWidget.data[`title${parentWidget.data.count}`] = Generic.getText(device.common.name);
            // apply settings
            settings && Object.keys(settings).forEach(setting => {
                parentWidget.data[`${setting}${parentWidget.data.count}`] = settings[setting];
            });
        }
        return false;
    };

    if (device.deviceType === 'thermostat') {
        // If it is a simple widget (only set temperature) => use slider
        if (device.states.length === 1) {
            return addSwitch('level.temperature', { type: 'slider' });
        }

        // try to find existing widget
        if (Object.values(viewObj.widgets).find(widget => widget.data.wizardId === device._id)) {
            return false;
        }

        const widget = getDeviceWidget(device);
        if (widget) {
            widget.usedInWidget = true;
            viewObj.widgets[widgetId] = widget;
            parentWidget.data.count++;
            parentWidget.data[`widget${parentWidget.data.count}`] = widgetId;
            return true;
        }
    }

    if (device.deviceType === 'media' || device.deviceType === 'weatherForecast') {
        // try to find existing widget
        if (Object.values(viewObj.widgets).find(widget => widget.data.wizardId === device._id)) {
            return false;
        }
        viewObj.widgets[widgetId] = getDeviceWidget(device);
        return true;
    }
    if (device.deviceType === 'light') {
        return addSwitch('switch.light', { type: 'switch' });
    }
    if (device.deviceType === 'dimmer') {
        return addSwitch('level.dimmer', { type: 'slider' });
    }
    if (device.deviceType === 'blind') {
        return addSwitch('level.blind', { type: 'blinds' });
    }
    if (device.deviceType === 'temperature') {
        addSwitch('value.temperature', { type: 'info' });
        return addSwitch('value.humidity', { type: 'info' });
    }
    if (device.deviceType === 'motion') {
        return addSwitch('sensor.motion', {
            type: 'info',
            colorEnabled: 'rgba(52,170,68,1)',
            infoInactiveIcon: ICONS.motion,
        });
    }
    if (device.deviceType === 'fireAlarm') {
        return addSwitch('sensor.alarm.fire', {
            type: 'info',
            colorEnabled: '#F00',
            infoInactiveIcon:  ICONS.fire,
        });
    }
    if (device.deviceType === 'floodAlarm') {
        return addSwitch('sensor.alarm.flood', {
            type: 'info',
            colorEnabled: '#00F',
            infoInactiveIcon: ICONS.flood,
        });
    }
    if (device.deviceType === 'door') {
        return addSwitch('sensor.door', {
            type: 'info',
            colorEnabled: '#F00',
            infoInactiveIcon: ICONS.doorClosed,
            infoActiveIcon: ICONS.doorOpened,
        });
    }
    if (device.deviceType === 'levelSlider') {
        return addSwitch('level', { type: 'slider' });
    }
    if (device.deviceType === 'lock') {
        return addSwitch('switch.lock', { type: 'switch' });
    }
    if (device.deviceType === 'socket') {
        return addSwitch('switch', {
            type: 'switch',
            iconSmall: ICONS.socket,
        });
    }
    if (device.deviceType === 'volume') {
        return addSwitch('level.volume', {
            type: 'slider',
            iconSmall: ICONS.volume,
        });
    }
    if (device.deviceType === 'volumeGroup') {
        return addSwitch('level.volume.group', {
            type: 'slider',
            iconSmall: ICONS.volume,
        });
    }
    if (device.deviceType === 'window') {
        return addSwitch('sensor.window', {
            type: 'info',
            infoInactiveIcon: ICONS.windowClosed,
            infoActiveIcon: ICONS.windowOpened,
            infoActiveColor: '#F00',
        });
    }
    if (device.deviceType === 'windowTilt') {
        return addSwitch('value.window', {
            type: 'info',
            infoInactiveIcon: ICONS.windowClosed,
            infoActiveIcon: ICONS.windowTilted,
            infoActiveColor: '#F00',
        });
    }
    parentWidget.data.count++;
    parentWidget.data[`oid${parentWidget.data.count}`] = device._id;
    parentWidget.data[`type${parentWidget.data.count}`] = 'auto';

    return false;
};
