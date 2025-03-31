import Generic from './Generic';

const ICONS = {
    motion: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMy41IDUuNWMxLjEgMCAyLS45IDItMnMtLjktMi0yLTJzLTIgLjktMiAycy45IDIgMiAyek05LjggOC45TDcgMjNoMi4xbDEuOC04bDIuMSAydjZoMnYtNy41bC0yLjEtMmwuNi0zQzE0LjggMTIgMTYuOCAxMyAxOSAxM3YtMmMtMS45IDAtMy41LTEtNC4zLTIuNGwtMS0xLjZjLS40LS42LTEtMS0xLjctMWMtLjMgMC0uNS4xLS44LjFMNiA4LjNWMTNoMlY5LjZsMS44LS43Ii8+PC9zdmc+',
    noMotion:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMiA3LjVjLjk3IDAgMS43NS0uNzggMS43NS0xLjc1UzEyLjk3IDQgMTIgNHMtMS43NS43OC0xLjc1IDEuNzVTMTEuMDMgNy41IDEyIDcuNXpNMTQgMjB2LTVoMXYtNC41YzAtMS4xLS45LTItMi0yaC0yYy0xLjEgMC0yIC45LTIgMlYxNWgxdjVoNHoiLz48L3N2Zz4=',
    fire: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMy41LjY3cy43NCAyLjY1Ljc0IDQuOGMwIDIuMDYtMS4zNSAzLjczLTMuNDEgMy43M2MtMi4wNyAwLTMuNjMtMS42Ny0zLjYzLTMuNzNsLjAzLS4zNkM1LjIxIDcuNTEgNCAxMC42MiA0IDE0YzAgNC40MiAzLjU4IDggOCA4czgtMy41OCA4LThDMjAgOC42MSAxNy40MSAzLjggMTMuNS42N3pNMTEuNzEgMTljLTEuNzggMC0zLjIyLTEuNC0zLjIyLTMuMTRjMC0xLjYyIDEuMDUtMi43NiAyLjgxLTMuMTJjMS43Ny0uMzYgMy42LTEuMjEgNC42Mi0yLjU4Yy4zOSAxLjI5LjU5IDIuNjUuNTkgNC4wNGMwIDIuNjUtMi4xNSA0LjgtNC44IDQuOHoiLz48L3N2Zz4=',
    flood: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0yMS45OCAxNEgyMmgtLjAyek01LjM1IDEzYzEuMTkgMCAxLjQyIDEgMy4zMyAxYzEuOTUgMCAyLjA5LTEgMy4zMy0xYzEuMTkgMCAxLjQyIDEgMy4zMyAxYzEuOTUgMCAyLjA5LTEgMy4zMy0xYzEuMTkgMCAxLjQuOTggMy4zMSAxdi0yYy0xLjE5IDAtMS40Mi0xLTMuMzMtMWMtMS45NSAwLTIuMDkgMS0zLjMzIDFjLTEuMTkgMC0xLjQyLTEtMy4zMy0xYy0xLjk1IDAtMi4wOSAxLTMuMzMgMWMtMS4xOSAwLTEuNDItMS0zLjMzLTFjLTEuOTUgMC0yLjA5IDEtMy4zMyAxdjJjMS45IDAgMi4xNy0xIDMuMzUtMXptMTMuMzIgMmMtMS45NSAwLTIuMDkgMS0zLjMzIDFjLTEuMTkgMC0xLjQyLTEtMy4zMy0xYy0xLjk1IDAtMi4xIDEtMy4zNCAxYy0xLjI0IDAtMS4zOC0xLTMuMzMtMWMtMS45NSAwLTIuMSAxLTMuMzQgMXYyYzEuOTUgMCAyLjExLTEgMy4zNC0xYzEuMjQgMCAxLjM4IDEgMy4zMyAxYzEuOTUgMCAyLjEtMSAzLjM0LTFjMS4xOSAwIDEuNDIgMSAzLjMzIDFjMS45NCAwIDIuMDktMSAzLjMzLTFjMS4xOSAwIDEuNDIgMSAzLjMzIDF2LTJjLTEuMjQgMC0xLjM4LTEtMy4zMy0xek01LjM1IDljMS4xOSAwIDEuNDIgMSAzLjMzIDFjMS45NSAwIDIuMDktMSAzLjMzLTFjMS4xOSAwIDEuNDIgMSAzLjMzIDFjMS45NSAwIDIuMDktMSAzLjMzLTFjMS4xOSAwIDEuNC45OCAzLjMxIDFWOGMtMS4xOSAwLTEuNDItMS0zLjMzLTFjLTEuOTUgMC0yLjA5IDEtMy4zMyAxYy0xLjE5IDAtMS40Mi0xLTMuMzMtMWMtMS45NSAwLTIuMDkgMS0zLjMzIDFjLTEuMTkgMC0xLjQyLTEtMy4zMy0xQzMuMzggNyAzLjI0IDggMiA4djJjMS45IDAgMi4xNy0xIDMuMzUtMXoiLz48L3N2Zz4=',
    windowOpened:
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzYxcHgiCgkgaGVpZ2h0PSIzNjFweCIgdmlld0JveD0iMCAwIDM2MSAzNjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM2MSAzNjE7Ij4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMjYzLjMwM2MwLDMuOTEtMy4xNTYsNy4wODItNy4wNSw3LjA4MgoJCWwtMTU3Ljg4NSwwLjAyMWMtMy44OTQsMC03LjA1LTMuMTcxLTcuMDUtNy4wODN2LTE1Ny41YzAtMy45MTEsMy4xNTYtNy4wODMsNy4wNS03LjA4M2wxNTcuODg1LTAuMDIxCgkJYzMuODk0LDAsNy4wNSwzLjE3Miw3LjA1LDcuMDgzVjI2My4zMDN6Ii8+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggc3R5bGU9ImZpbGw6Y3VycmVudENvbG9yOyIgZD0iTTIyOC41LDIwNS41ODRjMi4yMTMsMCw0LjQyNiwwLDYuNjM5LDBjMi43MjYsMCw1LTIuMjc0LDUtNXMtMi4yNzQtNS01LTUKCQkJCWMtMi4yMTMsMC00LjQyNiwwLTYuNjM5LDBjLTIuNzI2LDAtNSwyLjI3NC01LDVTMjI1Ljc3NCwyMDUuNTg0LDIyOC41LDIwNS41ODRMMjI4LjUsMjA1LjU4NHoiLz4KCQk8L2c+Cgk8L2c+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMTAzLjIwOGMwLDIuNDg1LTIuNzExLDQuNS02LjA1Myw0LjUKCQlsLTE1OS44OCwwLjAyMWMtMy4zNDIsMC02LjA1Mi0yLjAxNS02LjA1Mi00LjV2LTljMC0yLjQ4NSwyLjcxLTQuNSw2LjA1Mi00LjVsMTU5Ljg4LTAuMDIxYzMuMzQyLDAsNi4wNTMsMi4wMTUsNi4wNTMsNC41VjEwMy4yMDgKCQl6Ii8+Cgk8cGF0aCBzdHlsZT0iZGlzcGxheTpub25lO2ZpbGw6bm9uZTtzdHJva2U6Y3VycmVudENvbG9yO3N0cm9rZS13aWR0aDoxMDtzdHJva2UtbWl0ZXJsaW1pdDoxMDsiIGQ9Ik0yNjQuNzMyLDI2NS4xNzgKCQljMC41ODQsMi44ODctMS42MjksNS4yMjgtNC45NDIsNS4yMjhIMTAyLjQ1N2MtMy4zMTMsMC02LjQ3NC0yLjM0MS03LjA1OC01LjIyOEw3NC4yNCwxMzAuNjMzCgkJYy0wLjU4NC0yLjg4NywxLjYyOC01LjIyOCw0Ljk0Mi01LjIyOGgxNTcuMzMzYzMuMzEzLDAsNi40NzQsMi4zNCw3LjA1OCw1LjIyOEwyNjQuNzMyLDI2NS4xNzh6Ii8+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggc3R5bGU9ImZpbGw6Y3VycmVudENvbG9yOyIgZD0iTTIzMi44MjYsMjgwLjkwNWMtMC4zMzksMy4zNTYtMTguODEzLTAuNzgyLTIwLjkxOS0xLjA2Yy0xNS4wMjQtMS45OC0zMC4wNDktMy45Ni00NS4wNzMtNS45NAoJCQkJYy0xNS4wMjUtMS45OC0zMC4wNDktMy45Ni00NS4wNzQtNS45NGMtNC44MzUtMC42MzgtOS42NzEtMS4yNzUtMTQuNTA3LTEuOTEyYy0xLjQ1Ni0wLjE5Mi02LjIwMS0wLjA1NS02LjQxMi0yLjE0NwoJCQkJYy0wLjYyMS02LjE1NywwLTEyLjY5OSwwLTE4Ljg3OGMwLTE0LjUsMC0yOSwwLTQzLjVjMC0yNy4zNTksMC01NC43MTgsMC04Mi4wNzZjMC0xLjcxLDAtMy40MiwwLTUuMTMKCQkJCWMwLTIuNTUxLDUuMTg0LTEuMDE1LDYuNDEyLTAuODUzYzExLjgxMywxLjU1NywyMy42MjUsMy4xMTQsMzUuNDM4LDQuNjdjMjcuOTA4LDMuNjc4LDU1LjgxNiw3LjM1Niw4My43MjMsMTEuMDM1CgkJCQljMS40NTcsMC4xOTIsNi4yMDEsMC4wNTUsNi40MTIsMi4xNDdjMC4xNjksMS42NzMsMCwzLjQ1MSwwLDUuMTNjMCwxMS4yMTcsMCwyMi40MzQsMCwzMy42NTFjMCwzMC42NDIsMCw2MS4yODMsMCw5MS45MjUKCQkJCUMyMzIuODI2LDI2OC4zMiwyMzIuODI2LDI3NC42MTIsMjMyLjgyNiwyODAuOTA1YzAsNi40NDgsMTAsNi40NDgsMTAsMGMwLTQ4LjE1MSwwLTk2LjMwMywwLTE0NC40NTRjMC0xLjcxLDAtMy40MiwwLTUuMTMKCQkJCWMwLTcuNjE5LTYuMTM3LTEwLjc5My0xMi42NzMtMTEuNjU1Yy05LjUxMS0xLjI1My0xOS4wMjEtMi41MDctMjguNTMxLTMuNzZjLTI5LjQ3LTMuODg0LTU4Ljk0LTcuNzY4LTg4LjQxMS0xMS42NTIKCQkJCWMtMy4yOTktMC40MzUtNi41OTgtMC44Ny05Ljg5Ny0xLjMwNGMtNi41NTUtMC44NjQtMTIuNDczLDQuOS0xMi40NzMsMTEuMzhjMCw2LjUyMSwwLDEzLjA0MiwwLDE5LjU2MwoJCQkJYzAsMzAuNzA1LDAsNjEuNDEsMCw5Mi4xMTVjMCwxMS4wNTIsMCwyMi4xMDQsMCwzMy4xNTRjMCwyLjAyMy0wLjA3MSw0LjA0LDAuMTMyLDYuMDUzYzAuNzE3LDcuMTExLDYuNjA2LDkuNTYzLDEyLjc1OSwxMC4zNzQKCQkJCWMyNS42MDksMy4zNzUsNTEuMjE4LDYuNzUsNzYuODI3LDEwLjEyNWMxMy4yOTksMS43NTMsMjYuNTk4LDMuNTA2LDM5Ljg5Niw1LjI1OWMzLjIzMiwwLjQyNiw2LjQ2NSwwLjg1Miw5LjY5NywxLjI3OAoJCQkJYzcuMDYzLDAuOTMxLDEyLjAxMS00Ljc3OCwxMi42NzMtMTEuMzQ2QzI0My40NzMsMjc0LjQ5LDIzMy40NjcsMjc0LjU1MywyMzIuODI2LDI4MC45MDV6Ii8+CgkJPC9nPgoJPC9nPgo8L2c+Cjwvc3ZnPgo=',
    windowClosed:
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzYxcHgiCgkgaGVpZ2h0PSIzNjFweCIgdmlld0JveD0iMCAwIDM2MSAzNjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM2MSAzNjE7Ij4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMjYzLjMwM2MwLDMuOTEtMy4xNTYsNy4wODItNy4wNSw3LjA4MgoJCWwtMTU3Ljg4NSwwLjAyMWMtMy44OTQsMC03LjA1LTMuMTcxLTcuMDUtNy4wODN2LTE1Ny41YzAtMy45MTEsMy4xNTYtNy4wODMsNy4wNS03LjA4M2wxNTcuODg1LTAuMDIxCgkJYzMuODk0LDAsNy4wNSwzLjE3Miw3LjA1LDcuMDgzVjI2My4zMDN6Ii8+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggc3R5bGU9ImZpbGw6Y3VycmVudENvbG9yOyIgZD0iTTI1OC41LDE4NS41ODRjMi4yMTMsMCw0LjQyNiwwLDYuNjM5LDBjMi43MjYsMCw1LTIuMjc0LDUtNXMtMi4yNzQtNS01LTUKCQkJCWMtMi4yMTMsMC00LjQyNiwwLTYuNjM5LDBjLTIuNzI2LDAtNSwyLjI3NC01LDVTMjU1Ljc3NCwxODUuNTg0LDI1OC41LDE4NS41ODRMMjU4LjUsMTg1LjU4NHoiLz4KCQk8L2c+Cgk8L2c+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMTAzLjIwOGMwLDIuNDg1LTIuNzExLDQuNS02LjA1Myw0LjUKCQlsLTE1OS44OCwwLjAyMWMtMy4zNDIsMC02LjA1Mi0yLjAxNS02LjA1Mi00LjV2LTljMC0yLjQ4NSwyLjcxLTQuNSw2LjA1Mi00LjVsMTU5Ljg4LTAuMDIxYzMuMzQyLDAsNi4wNTMsMi4wMTUsNi4wNTMsNC41VjEwMy4yMDgKCQl6Ii8+Cgk8cGF0aCBzdHlsZT0iZGlzcGxheTpub25lO2ZpbGw6bm9uZTtzdHJva2U6Y3VycmVudENvbG9yO3N0cm9rZS13aWR0aDoxMDtzdHJva2UtbWl0ZXJsaW1pdDoxMDsiIGQ9Ik0yNjQuNzMyLDI2NS4xNzgKCQljMC41ODQsMi44ODctMS42MjksNS4yMjgtNC45NDIsNS4yMjhIMTAyLjQ1N2MtMy4zMTMsMC02LjQ3NC0yLjM0MS03LjA1OC01LjIyOEw3NC4yNCwxMzAuNjMzCgkJYy0wLjU4NC0yLjg4NywxLjYyOC01LjIyOCw0Ljk0Mi01LjIyOGgxNTcuMzMzYzMuMzEzLDAsNi40NzQsMi4zNCw3LjA1OCw1LjIyOEwyNjQuNzMyLDI2NS4xNzh6Ii8+CjwvZz4KPC9zdmc+Cg==',
    windowTilted:
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzYxcHgiCgkgaGVpZ2h0PSIzNjFweCIgdmlld0JveD0iMCAwIDM2MSAzNjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM2MSAzNjE7Ij4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMjYzLjMwM2MwLDMuOTEtMy4xNTYsNy4wODItNy4wNSw3LjA4MgoJCWwtMTU3Ljg4NSwwLjAyMWMtMy44OTQsMC03LjA1LTMuMTcxLTcuMDUtNy4wODN2LTE1Ny41YzAtMy45MTEsMy4xNTYtNy4wODMsNy4wNS03LjA4M2wxNTcuODg1LTAuMDIxCgkJYzMuODk0LDAsNy4wNSwzLjE3Miw3LjA1LDcuMDgzVjI2My4zMDN6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMTAzLjIwOGMwLDIuNDg1LTIuNzExLDQuNS02LjA1Myw0LjUKCQlsLTE1OS44OCwwLjAyMWMtMy4zNDIsMC02LjA1Mi0yLjAxNS02LjA1Mi00LjV2LTljMC0yLjQ4NSwyLjcxLTQuNSw2LjA1Mi00LjVsMTU5Ljg4LTAuMDIxYzMuMzQyLDAsNi4wNTMsMi4wMTUsNi4wNTMsNC41VjEwMy4yMDgKCQl6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2NS43MzIsMjY1LjE3OAoJCWMwLjU4NCwyLjg4Ny0xLjYyOSw1LjIyOC00Ljk0Miw1LjIyOEgxMDMuNDU3Yy0zLjMxMywwLTYuNDc0LTIuMzQxLTcuMDU4LTUuMjI4TDc1LjI0LDEzMC42MzMKCQljLTAuNTg0LTIuODg3LDEuNjI4LTUuMjI4LDQuOTQyLTUuMjI4aDE1Ny4zMzNjMy4zMTMsMCw2LjQ3NCwyLjM0LDcuMDU4LDUuMjI4TDI2NS43MzIsMjY1LjE3OHoiLz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBzdHlsZT0iZmlsbDpjdXJyZW50Q29sb3I7IiBkPSJNMjQ3LjE5NCwxOTkuNjY3YzIuMjEzLDAsNC40MjYsMCw2LjYzOSwwYzIuNzI2LDAsNS0yLjI3NCw1LTVzLTIuMjc0LTUtNS01CgkJCQljLTIuMjEzLDAtNC40MjYsMC02LjYzOSwwYy0yLjcyNiwwLTUsMi4yNzQtNSw1UzI0NC40NjksMTk5LjY2NywyNDcuMTk0LDE5OS42NjdMMjQ3LjE5NCwxOTkuNjY3eiIvPgoJCTwvZz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
    doorOpened:
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzYxcHgiCgkgaGVpZ2h0PSIzNjFweCIgdmlld0JveD0iMCAwIDM2MSAzNjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM2MSAzNjE7Ij4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTIzOC42MDcsMjY1LjQ2YzAsMy4xNDctMi41MDYsNi4xNC01LjU5OCw2LjY4NQoJCWwtODUuODEzLDE1LjEzMWMtMy4wOTEsMC41NDUtNS41OTYtMS41NjMtNS41OTYtNC43MVY5Ny43MTNjMC0zLjE0NiwyLjUwNS02LjEzOSw1LjU5Ni02LjY4NGw4NS44MTMtMTUuMTMxCgkJYzMuMDkyLTAuNTQ1LDUuNTk4LDEuNTY0LDUuNTk4LDQuNzFWMjY1LjQ2eiIvPgoJPGc+CgkJPGc+CgkJCTxwYXRoIHN0eWxlPSJmaWxsOmN1cnJlbnRDb2xvcjsiIGQ9Ik0xNDQuNzc3LDE5NC40NTNjMy4wOC0wLjU0Myw2LjE1OS0xLjA4Nyw5LjIzOC0xLjYzYzIuNjg3LTAuNDc0LDQuMTYzLTMuNzEyLDMuNDkyLTYuMTUKCQkJCWMtMC43NzMtMi44MTEtMy40NjktMy45NjYtNi4xNS0zLjQ5MmMtMy4wOCwwLjU0My02LjE1OSwxLjA4Ny05LjIzOCwxLjYzYy0yLjY4NywwLjQ3NC00LjE2MywzLjcxMi0zLjQ5Miw2LjE1CgkJCQlDMTM5LjM5OSwxOTMuNzcxLDE0Mi4wOTYsMTk0LjkyNywxNDQuNzc3LDE5NC40NTNMMTQ0Ljc3NywxOTQuNDUzeiIvPgoJCTwvZz4KCTwvZz4KCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOmN1cnJlbnRDb2xvcjtzdHJva2Utd2lkdGg6MTA7c3Ryb2tlLW1pdGVybGltaXQ6MTA7IiBkPSJNMjM4LjYwNywyNjUuNjk4CgkJYzAsMy4xNDctMi45MzYsNS42OTgtNi41NTcsNS42OThIMTMxLjUyOGMtMy42MjEsMC02LjU1Ni0yLjU1MS02LjU1Ni01LjY5OFY4MC44NDZjMC0zLjE0NiwyLjkzNi01LjY5Nyw2LjU1Ni01LjY5N2gxMDAuNTIzCgkJYzMuNjIxLDAsNi41NTcsMi41NTEsNi41NTcsNS42OTdWMjY1LjY5OHoiLz4KPC9nPgo8L3N2Zz4K',
    doorClosed:
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzYxcHgiCgkgaGVpZ2h0PSIzNjFweCIgdmlld0JveD0iMCAwIDM2MSAzNjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM2MSAzNjE7Ij4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTIzMi44MzYsMjgwLjkxMgoJCWMwLDMuNDA2LTIuNzEzLDYuMTY4LTYuMDU5LDYuMTY4aC05Mi44OWMtMy4zNDYsMC02LjA1OC0yLjc2Mi02LjA1OC02LjE2OFY4MC44MTZjMC0zLjQwNiwyLjcxMi02LjE2Nyw2LjA1OC02LjE2N2g5Mi44OQoJCWMzLjM0NiwwLDYuMDU5LDIuNzYxLDYuMDU5LDYuMTY3VjI4MC45MTJ6Ii8+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggc3R5bGU9ImZpbGw6Y3VycmVudENvbG9yOyIgZD0iTTEyOS44MywxODUuNjY3YzMuMzMzLDAsNi42NjcsMCwxMCwwYzYuNDQ5LDAsNi40NDktMTAsMC0xMGMtMy4zMzMsMC02LjY2NywwLTEwLDAKCQkJCUMxMjMuMzgxLDE3NS42NjcsMTIzLjM4MSwxODUuNjY3LDEyOS44MywxODUuNjY3TDEyOS44MywxODUuNjY3eiIvPgoJCTwvZz4KCTwvZz4KCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOmN1cnJlbnRDb2xvcjtzdHJva2Utd2lkdGg6MTA7c3Ryb2tlLW1pdGVybGltaXQ6MTA7IiBkPSJNMjMxLjE2MywyODBjMC0zLjMxMy0yLjY4Ny02LTYtNkgxMzMuODMKCQljLTMuMzEzLDAtNiwyLjY4Ny02LDZ2MC42NjdjMCwzLjMxMywyLjY4Nyw2LDYsNmg5MS4zMzNjMy4zMTMsMCw2LTIuNjg3LDYtNlYyODB6Ii8+CjwvZz4KPC9zdmc+Cg==',
    socket: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwczEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek05IDEyYy0uNTUgMC0xLS40NS0xLTFWOGMwLS41NS40NS0xIDEtMXMxIC40NSAxIDF2M2MwIC41NS0uNDUgMS0xIDF6bTUgNmgtNHYtMmMwLTEuMS45LTIgMi0yczIgLjkgMiAydjJ6bTItN2MwIC41NS0uNDUgMS0xIDFzLTEtLjQ1LTEtMVY4YzAtLjU1LjQ1LTEgMS0xczEgLjQ1IDEgMXYzeiIvPjwvc3ZnPg==',
    volume: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0zIDl2Nmg0bDUgNVY0TDcgOUgzem0xMy41IDNBNC41IDQuNSAwIDAgMCAxNCA3Ljk3djguMDVjMS40OC0uNzMgMi41LTIuMjUgMi41LTQuMDJ6TTE0IDMuMjN2Mi4wNmMyLjg5Ljg2IDUgMy41NCA1IDYuNzFzLTIuMTEgNS44NS01IDYuNzF2Mi4wNmM0LjAxLS45MSA3LTQuNDkgNy04Ljc3cy0yLjk5LTcuODYtNy04Ljc3eiIvPjwvc3ZnPg==',
};

const DEVICE_ICONS = {
    blinds: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMjAsMTlWM0g0djE2SDJ2MmgyMHYtMkgyMHogTTE2LDloMnYyaC0yVjl6IE0xNCwxMUg2VjloOFYxMXogTTE4LDdoLTJWNWgyVjd6IE0xNCw1djJINlY1SDE0eiBNNiwxOXYtNmg4djEuODIgYy0wLjQ1LDAuMzItMC43NSwwLjg0LTAuNzUsMS40M2MwLDAuOTcsMC43OCwxLjc1LDEuNzUsMS43NXMxLjc1LTAuNzgsMS43NS0xLjc1YzAtMC41OS0wLjMtMS4xMi0wLjc1LTEuNDNWMTNoMnY2SDZ6IiAvPg0KPC9zdmc+',
    dimmer: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNNywyMGg0YzAsMS4xLTAuOSwyLTIsMlM3LDIxLjEsNywyMHogTTUsMTloOHYtMkg1VjE5eiBNMTYuNSw5LjVjMCwzLjgyLTIuNjYsNS44Ni0zLjc3LDYuNUg1LjI3IEM0LjE2LDE1LjM2LDEuNSwxMy4zMiwxLjUsOS41QzEuNSw1LjM2LDQuODYsMiw5LDJTMTYuNSw1LjM2LDE2LjUsOS41eiBNMTQuNSw5LjVDMTQuNSw2LjQ3LDEyLjAzLDQsOSw0UzMuNSw2LjQ3LDMuNSw5LjUgYzAsMi40NywxLjQ5LDMuODksMi4zNSw0LjVoNi4zQzEzLjAxLDEzLjM5LDE0LjUsMTEuOTcsMTQuNSw5LjV6IE0yMS4zNyw3LjM3TDIwLDhsMS4zNywwLjYzTDIyLDEwbDAuNjMtMS4zN0wyNCw4bC0xLjM3LTAuNjNMMjIsNiBMMjEuMzcsNy4zN3ogTTE5LDZsMC45NC0yLjA2TDIyLDNsLTIuMDYtMC45NEwxOSwwbC0wLjk0LDIuMDZMMTYsM2wyLjA2LDAuOTRMMTksNnoiLz4NCjwvc3ZnPg==',
    door: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPGc+DQogICAgICAgIDxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iMjQiIHdpZHRoPSIyNCIvPg0KICAgICAgICA8cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xOCw0djE2SDZWNEgxOCBNMTgsMkg2QzQuOSwyLDQsMi45LDQsNHYxOGgxNlY0QzIwLDIuOSwxOS4xLDIsMTgsMkwxOCwyeiBNMTUuNSwxMC41Yy0wLjgzLDAtMS41LDAuNjctMS41LDEuNSBzMC42NywxLjUsMS41LDEuNWMwLjgzLDAsMS41LTAuNjcsMS41LTEuNVMxNi4zMywxMC41LDE1LjUsMTAuNXoiLz4NCiAgICA8L2c+DQo8L3N2Zz4=',
    fireAlarm:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTYsNmwtMC40NCwwLjU1Yy0wLjQyLDAuNTItMC45OCwwLjc1LTEuNTQsMC43NUMxMyw3LjMsMTIsNi41MiwxMiw1LjNWMmMwLDAtOCw0LTgsMTFjMCw0LjQyLDMuNTgsOCw4LDhzOC0zLjU4LDgtOCBDMjAsMTAuMDQsMTguMzksNy4zOCwxNiw2eiBNMTIsMTljLTEuMSwwLTItMC44Ny0yLTEuOTRjMC0wLjUxLDAuMi0wLjk5LDAuNTgtMS4zNmwxLjQyLTEuNGwxLjQzLDEuNCBDMTMuOCwxNi4wNywxNCwxNi41NSwxNCwxNy4wNkMxNCwxOC4xMywxMy4xLDE5LDEyLDE5eiBNMTUuOTYsMTcuNUwxNS45NiwxNy41YzAuMDQtMC4zNiwwLjIyLTEuODktMS4xMy0zLjIybDAsMEwxMiwxMS41IGwtMi44MywyLjc4bDAsMGMtMS4zNiwxLjM0LTEuMTcsMi44OC0xLjEzLDMuMjJDNi43OSwxNi40LDYsMTQuNzksNiwxM2MwLTMuMTYsMi4xMy01LjY1LDQuMDMtNy4yNWMwLjIzLDEuOTksMS45MywzLjU1LDMuOTksMy41NSBjMC43OCwwLDEuNTQtMC4yMywyLjE4LTAuNjZDMTcuMzQsOS43OCwxOCwxMS4zNSwxOCwxM0MxOCwxNC43OSwxNy4yMSwxNi40LDE1Ljk2LDE3LjV6IiAvPg0KPC9zdmc+',
    floodAlarm:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMjEuOTgsMTRIMjJIMjEuOTh6IE01LjM1LDEzYzEuMTksMCwxLjQyLDEsMy4zMywxYzEuOTUsMCwyLjA5LTEsMy4zMy0xYzEuMTksMCwxLjQyLDEsMy4zMywxYzEuOTUsMCwyLjA5LTEsMy4zMy0xIGMxLjE5LDAsMS40LDAuOTgsMy4zMSwxdi0yYy0xLjE5LDAtMS40Mi0xLTMuMzMtMWMtMS45NSwwLTIuMDksMS0zLjMzLDFjLTEuMTksMC0xLjQyLTEtMy4zMy0xYy0xLjk1LDAtMi4wOSwxLTMuMzMsMSBjLTEuMTksMC0xLjQyLTEtMy4zMy0xQzMuMzgsMTEsMy4yNCwxMiwyLDEydjJDMy45LDE0LDQuMTcsMTMsNS4zNSwxM3ogTTE4LjY3LDE1Yy0xLjk1LDAtMi4wOSwxLTMuMzMsMWMtMS4xOSwwLTEuNDItMS0zLjMzLTEgYy0xLjk1LDAtMi4xLDEtMy4zNCwxYy0xLjI0LDAtMS4zOC0xLTMuMzMtMWMtMS45NSwwLTIuMSwxLTMuMzQsMXYyYzEuOTUsMCwyLjExLTEsMy4zNC0xYzEuMjQsMCwxLjM4LDEsMy4zMywxIGMxLjk1LDAsMi4xLTEsMy4zNC0xYzEuMTksMCwxLjQyLDEsMy4zMywxYzEuOTQsMCwyLjA5LTEsMy4zMy0xYzEuMTksMCwxLjQyLDEsMy4zMywxdi0yQzIwLjc2LDE2LDIwLjYyLDE1LDE4LjY3LDE1eiBNNS4zNSw5IGMxLjE5LDAsMS40MiwxLDMuMzMsMWMxLjk1LDAsMi4wOS0xLDMuMzMtMWMxLjE5LDAsMS40MiwxLDMuMzMsMWMxLjk1LDAsMi4wOS0xLDMuMzMtMWMxLjE5LDAsMS40LDAuOTgsMy4zMSwxVjggYy0xLjE5LDAtMS40Mi0xLTMuMzMtMWMtMS45NSwwLTIuMDksMS0zLjMzLDFjLTEuMTksMC0xLjQyLTEtMy4zMy0xQzEwLjA0LDcsOS45LDgsOC42Niw4QzcuNDcsOCw3LjI0LDcsNS4zMyw3IEMzLjM4LDcsMy4yNCw4LDIsOHYyQzMuOSwxMCw0LjE3LDksNS4zNSw5eiIgLz4NCjwvc3ZnPg==',
    humidity:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTIsMmMtNS4zMyw0LjU1LTgsOC40OC04LDExLjhjMCw0Ljk4LDMuOCw4LjIsOCw4LjJzOC0zLjIyLDgtOC4yQzIwLDEwLjQ4LDE3LjMzLDYuNTUsMTIsMnogTTEyLDIwYy0zLjM1LDAtNi0yLjU3LTYtNi4yIGMwLTIuMzQsMS45NS01LjQ0LDYtOS4xNGM0LjA1LDMuNyw2LDYuNzksNiw5LjE0QzE4LDE3LjQzLDE1LjM1LDIwLDEyLDIweiBNNy44MywxNGMwLjM3LDAsMC42NywwLjI2LDAuNzQsMC42MiBjMC40MSwyLjIyLDIuMjgsMi45OCwzLjY0LDIuODdjMC40My0wLjAyLDAuNzksMC4zMiwwLjc5LDAuNzVjMCwwLjQtMC4zMiwwLjczLTAuNzIsMC43NWMtMi4xMywwLjEzLTQuNjItMS4wOS01LjE5LTQuMTIgQzcuMDEsMTQuNDIsNy4zNywxNCw3LjgzLDE0eiIgLz4NCjwvc3ZnPg==',
    levelSlider:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMyAxN3YyaDZ2LTJIM3pNMyA1djJoMTBWNUgzem0xMCAxNnYtMmg4di0yaC04di0yaC0ydjZoMnpNNyA5djJIM3YyaDR2MmgyVjlIN3ptMTQgNHYtMkgxMXYyaDEwem0tNi00aDJWN2g0VjVoLTRWM2gtMnY2eiIgLz4NCjwvc3ZnPg==',
    light: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNOSAyMWMwIC41NS40NSAxIDEgMWg0Yy41NSAwIDEtLjQ1IDEtMXYtMUg5djF6bTMtMTlDOC4xNCAyIDUgNS4xNCA1IDljMCAyLjM4IDEuMTkgNC40NyAzIDUuNzRWMTdjMCAuNTUuNDUgMSAxIDFoNmMuNTUgMCAxLS40NSAxLTF2LTIuMjZjMS44MS0xLjI3IDMtMy4zNiAzLTUuNzQgMC0zLjg2LTMuMTQtNy03LTd6bTIuODUgMTEuMWwtLjg1LjZWMTZoLTR2LTIuM2wtLjg1LS42QzcuOCAxMi4xNiA3IDEwLjYzIDcgOWMwLTIuNzYgMi4yNC01IDUtNXM1IDIuMjQgNSA1YzAgMS42My0uOCAzLjE2LTIuMTUgNC4xeiIgLz4NCjwvc3ZnPg==',
    lock: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTggOGgtMVY2YzAtMi43Ni0yLjI0LTUtNS01UzcgMy4yNCA3IDZ2Mkg2Yy0xLjEgMC0yIC45LTIgMnYxMGMwIDEuMS45IDIgMiAyaDEyYzEuMSAwIDItLjkgMi0yVjEwYzAtMS4xLS45LTItMi0yek05IDZjMC0xLjY2IDEuMzQtMyAzLTNzMyAxLjM0IDMgM3YySDlWNnptOSAxNEg2VjEwaDEydjEwem0tNi0zYzEuMSAwIDItLjkgMi0ycy0uOS0yLTItMi0yIC45LTIgMiAuOSAyIDIgMnoiIC8+DQo8L3N2Zz4=',
    media: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTIsMkM2LjQ4LDIsMiw2LjQ4LDIsMTJzNC40OCwxMCwxMCwxMHMxMC00LjQ4LDEwLTEwUzE3LjUyLDIsMTIsMnogTTEyLDIwYy00LjQxLDAtOC0zLjU5LTgtOHMzLjU5LTgsOC04czgsMy41OSw4LDggUzE2LjQxLDIwLDEyLDIweiBNOS41LDE2LjVsNy00LjVsLTctNC41VjE2LjV6IiAvPg0KPC9zdmc+',
    motion: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iNDgiPg0KICAgIDxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTUzNS00MHYtMjM5bC0xMDgtOTktNDIgMTg4LTI2NS01NSAxMS01NiAxOTkgNDAgNzMtMzY5LTEwMCA0N3YxMzRoLTYwdi0xNzVsMTY0LTY5cTMyLTE0IDQ1LjUtMTcuNVQ0ODAtNzE0cTIwIDAgMzUuNSA4LjVUNTQyLTY4MGw0MiA2N3EyNiA0MiA3MSA3M3QxMDUgMzF2NjBxLTY3IDAtMTE5LjUtMzFUNTQzLTU3M2wtMzkgMTU4IDkxIDg0djI5MWgtNjBabTUtNzE0cS0zMCAwLTUxLjUtMjEuNVQ0NjctODI3cTAtMzAgMjEuNS01MS41VDU0MC05MDBxMzAgMCA1MS41IDIxLjVUNjEzLTgyN3EwIDMwLTIxLjUgNTEuNVQ1NDAtNzU0WiIgLz4NCjwvc3ZnPg==',
    rgb: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTIgMjJDNi40OSAyMiAyIDE3LjUxIDIgMTJTNi40OSAyIDEyIDJzMTAgNC4wNCAxMCA5YzAgMy4zMS0yLjY5IDYtNiA2aC0xLjc3Yy0uMjggMC0uNS4yMi0uNS41IDAgLjEyLjA1LjIzLjEzLjMzLjQxLjQ3LjY0IDEuMDYuNjQgMS42NyAwIDEuMzgtMS4xMiAyLjUtMi41IDIuNXptMC0xOGMtNC40MSAwLTggMy41OS04IDhzMy41OSA4IDggOGMuMjggMCAuNS0uMjIuNS0uNSAwLS4xNi0uMDgtLjI4LS4xNC0uMzUtLjQxLS40Ni0uNjMtMS4wNS0uNjMtMS42NSAwLTEuMzggMS4xMi0yLjUgMi41LTIuNUgxNmMyLjIxIDAgNC0xLjc5IDQtNCAwLTMuODYtMy41OS03LTgtN3oiLz4NCiAgICA8Y2lyY2xlIGZpbGw9ImN1cnJlbnRDb2xvciIgY3g9IjYuNSIgY3k9IjExLjUiIHI9IjEuNSIvPg0KICAgIDxjaXJjbGUgZmlsbD0iY3VycmVudENvbG9yIiBjeD0iOS41IiBjeT0iNy41IiByPSIxLjUiLz4NCiAgICA8Y2lyY2xlIGZpbGw9ImN1cnJlbnRDb2xvciIgY3g9IjE0LjUiIGN5PSI3LjUiIHI9IjEuNSIvPg0KICAgIDxjaXJjbGUgZmlsbD0iY3VycmVudENvbG9yIiBjeD0iMTcuNSIgY3k9IjExLjUiIHI9IjEuNSIvPg0KPC9zdmc+',
    socket: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTYgOXY0LjY2bC0zLjUgMy41MVYxOWgtMXYtMS44M0w4IDEzLjY1VjloOG0wLTZoLTJ2NGgtNFYzSDh2NGgtLjAxQzYuOSA2Ljk5IDYgNy44OSA2IDguOTh2NS41Mkw5LjUgMTh2M2g1di0zbDMuNS0zLjUxVjljMC0xLjEtLjktMi0yLTJWM3oiIC8+DQo8L3N2Zz4=',
    temperature:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTUgMTNWNWMwLTEuNjYtMS4zNC0zLTMtM1M5IDMuMzQgOSA1djhjLTEuMjEuOTEtMiAyLjM3LTIgNCAwIDIuNzYgMi4yNCA1IDUgNXM1LTIuMjQgNS01YzAtMS42My0uNzktMy4wOS0yLTR6bS00LThjMC0uNTUuNDUtMSAxLTFzMSAuNDUgMSAxaC0xdjFoMXYyaC0xdjFoMXYyaC0yVjV6IiAvPg0KPC9zdmc+',
    thermostat:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NS42NTkgNDUuNjU5Ij4NCgk8cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0zMC42MTksMjcuMzA5VjcuNzgxQzMwLjYxOSwzLjQ5LDI3LjEyNCwwLDIyLjgzMywwYy00LjI5LDAtNy43ODUsMy40OTEtNy43ODUsNy43OHYxOS41MjgNCgkJYy0xLjkwMiwxLjk0OS0zLjA1LDQuNjA0LTMuMDUsNy41MjJjMCw1Ljk3Miw0Ljg1NywxMC44MjgsMTAuODI5LDEwLjgyOGM1Ljk3LDAsMTAuODM0LTQuODU2LDEwLjgzNC0xMC44MjgNCgkJQzMzLjY2MSwzMS45MTIsMzIuNTIsMjkuMjU4LDMwLjYxOSwyNy4zMDl6IE0yMi44MjUsNDIuNjZjLTQuMzE2LDAtNy44MjQtMy41MTItNy44MjQtNy44MjhjMC0yLjUyNywxLjE3NC00Ljc3OSwzLjA3Ny02LjIxMQ0KCQlWMTYuMjM3aDMuMzcyYzAuNTUyLDAsMS0wLjQ3LDEtMS4wMjJjMC0wLjU1My0wLjQ0OC0xLjAyMS0xLTEuMDIxaC0zLjM3MnYtMi40NjZoMy4zNzJjMC41NTIsMCwxLTAuNDM0LDEtMC45ODYNCgkJYzAtMC41NTItMC40NDgtMC45ODYtMS0wLjk4NmgtMy4zNzJWNy43OGMwLTIuNjM2LDIuMTE5LTQuNzgsNC43NTQtNC43OGMyLjYzNywwLDQuNzU2LDIuMTQ0LDQuNzU2LDQuNzgxdjIwLjg3MQ0KCQljMS45MDMsMS40MzQsMy4wNDcsMy42NzEsMy4wNDcsNi4xOEMzMC42MzUsMzkuMTQ4LDI3LjE0MSw0Mi42NiwyMi44MjUsNDIuNjZ6IiAvPg0KCTxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTI1LjMzNCwzMC40NjNWMTguNjMyaC01LjAwMnYxMS44MzFjLTEuNTQ5LDAuODc0LTIuNTM3LDIuNTAyLTIuNTM3LDQuMzY5YzAsMi43ODgsMi4yNTEsNS4wNDYsNS4wMzgsNS4wNDYNCgkJYzIuNzg4LDAsNS4wMzQtMi4yNTgsNS4wMzQtNS4wNDZDMjcuODY3LDMyLjk2NiwyNi44ODUsMzEuMzM3LDI1LjMzNCwzMC40NjN6IiAvPg0KPC9zdmc+DQo=',
    volume: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTYgNy45N3Y4LjA1YzEuNDgtLjczIDIuNS0yLjI1IDIuNS00LjAyIDAtMS43Ny0xLjAyLTMuMjktMi41LTQuMDN6TTUgOXY2aDRsNSA1VjRMOSA5SDV6bTctLjE3djYuMzRMOS44MyAxM0g3di0yaDIuODNMMTIgOC44M3oiIC8+DQo8L3N2Zz4=',
    volumeGroup:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTYgNy45N3Y4LjA1YzEuNDgtLjczIDIuNS0yLjI1IDIuNS00LjAyIDAtMS43Ny0xLjAyLTMuMjktMi41LTQuMDN6TTUgOXY2aDRsNSA1VjRMOSA5SDV6bTctLjE3djYuMzRMOS44MyAxM0g3di0yaDIuODNMMTIgOC44M3oiIC8+DQo8L3N2Zz4=',
    window: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjEgMzYxIj4NCgk8cGF0aCBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IGN1cnJlbnRDb2xvcjtzdHJva2Utd2lkdGg6MTA7c3Ryb2tlLW1pdGVybGltaXQ6MTA7IiBkPSJNMjY3LjgyNiwyNjMuMzAzYzAsMy45MS0zLjE1Niw3LjA4Mi03LjA1LDcuMDgyDQoJCWwtMTU3Ljg4NSwwLjAyMWMtMy44OTQsMC03LjA1LTMuMTcxLTcuMDUtNy4wODN2LTE1Ny41YzAtMy45MTEsMy4xNTYtNy4wODMsNy4wNS03LjA4M2wxNTcuODg1LTAuMDIxDQoJCWMzLjg5NCwwLDcuMDUsMy4xNzIsNy4wNSw3LjA4M1YyNjMuMzAzeiIvPg0KCTxwYXRoIHN0eWxlPSJmaWxsOiBjdXJyZW50Q29sb3I7IiBkPSJNMjU4LjUsMTg1LjU4NGMyLjIxMywwLDQuNDI2LDAsNi42MzksMGMyLjcyNiwwLDUtMi4yNzQsNS01cy0yLjI3NC01LTUtNQ0KCQljLTIuMjEzLDAtNC40MjYsMC02LjYzOSwwYy0yLjcyNiwwLTUsMi4yNzQtNSw1UzI1NS43NzQsMTg1LjU4NCwyNTguNSwxODUuNTg0TDI1OC41LDE4NS41ODR6Ii8+DQoJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiBjdXJyZW50Q29sb3I7IHN0cm9rZS13aWR0aDogMTA7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsiIGQ9Ik0yNjcuODI2LDEwMy4yMDhjMCwyLjQ4NS0yLjcxMSw0LjUtNi4wNTMsNC41DQoJCWwtMTU5Ljg4LDAuMDIxYy0zLjM0MiwwLTYuMDUyLTIuMDE1LTYuMDUyLTQuNXYtOWMwLTIuNDg1LDIuNzEtNC41LDYuMDUyLTQuNWwxNTkuODgtMC4wMjFjMy4zNDIsMCw2LjA1MywyLjAxNSw2LjA1Myw0LjVWMTAzLjIwOA0KCQl6IiAvPg0KPC9zdmc+DQo=',
    windowTilt:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjEgMzYxIj4NCgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMjYzLjMwM2MwLDMuOTEtMy4xNTYsNy4wODItNy4wNSw3LjA4Mg0KCQlsLTE1Ny44ODUsMC4wMjFjLTMuODk0LDAtNy4wNS0zLjE3MS03LjA1LTcuMDgzdi0xNTcuNWMwLTMuOTExLDMuMTU2LTcuMDgzLDcuMDUtNy4wODNsMTU3Ljg4NS0wLjAyMQ0KCQljMy44OTQsMCw3LjA1LDMuMTcyLDcuMDUsNy4wODNWMjYzLjMwM3oiLz4NCgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2Ny44MjYsMTAzLjIwOGMwLDIuNDg1LTIuNzExLDQuNS02LjA1Myw0LjUNCgkJbC0xNTkuODgsMC4wMjFjLTMuMzQyLDAtNi4wNTItMi4wMTUtNi4wNTItNC41di05YzAtMi40ODUsMi43MS00LjUsNi4wNTItNC41bDE1OS44OC0wLjAyMWMzLjM0MiwwLDYuMDUzLDIuMDE1LDYuMDUzLDQuNVYxMDMuMjA4DQoJCXoiLz4NCgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpjdXJyZW50Q29sb3I7c3Ryb2tlLXdpZHRoOjEwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgZD0iTTI2NS43MzIsMjY1LjE3OA0KCQljMC41ODQsMi44ODctMS42MjksNS4yMjgtNC45NDIsNS4yMjhIMTAzLjQ1N2MtMy4zMTMsMC02LjQ3NC0yLjM0MS03LjA1OC01LjIyOEw3NS4yNCwxMzAuNjMzDQoJCWMtMC41ODQtMi44ODcsMS42MjgtNS4yMjgsNC45NDItNS4yMjhoMTU3LjMzM2MzLjMxMywwLDYuNDc0LDIuMzQsNy4wNTgsNS4yMjhMMjY1LjczMiwyNjUuMTc4eiIvPg0KCTxwYXRoIHN0eWxlPSJmaWxsOmN1cnJlbnRDb2xvcjsiIGQ9Ik0yNDcuMTk0LDE5OS42NjdjMi4yMTMsMCw0LjQyNiwwLDYuNjM5LDBjMi43MjYsMCw1LTIuMjc0LDUtNXMtMi4yNzQtNS01LTUNCgkJYy0yLjIxMywwLTQuNDI2LDAtNi42MzksMGMtMi43MjYsMC01LDIuMjc0LTUsNVMyNDQuNDY5LDE5OS42NjcsMjQ3LjE5NCwxOTkuNjY3TDI0Ny4xOTQsMTk5LjY2N3oiLz4NCjwvc3ZnPg0K',
    vacuumCleaner:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogICAgPHBhdGggc3Ryb2tlPSJjdXJyZW50Q29sb3IiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMjEgMTJhOSA5IDAgMSAxIC0xOCAwYTkgOSAwIDAgMSAxOCAweiIgLz4NCiAgICA8cGF0aCBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0xNCA5YTIgMiAwIDEgMSAtNCAwYTIgMiAwIDAgMSA0IDB6IiAvPg0KICAgIDxwYXRoIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTEyIDE2aC4wMSIgLz4NCjwvc3ZnPg==',
};
DEVICE_ICONS.blind = DEVICE_ICONS.blinds;
DEVICE_ICONS.rgbSingle = DEVICE_ICONS.rgb;
DEVICE_ICONS.rgbwSingle = DEVICE_ICONS.rgb;
DEVICE_ICONS.hue = DEVICE_ICONS.rgb;
DEVICE_ICONS.ct = DEVICE_ICONS.rgb;
const MEDIA_TYPES = [
    'title',
    'artist',
    'cover',
    'state',
    'duration',
    'elapsed',
    'prev',
    'next',
    'volume',
    'mute',
    'repeat',
    'shuffle',
];

const simpleState = (device, role, style, settings) => {
    const set = device.states.find(state => state.common.role === role || state.name === role);
    if (!set) {
        return null;
    }
    if (settings?.standardIcons && DEVICE_ICONS[device.deviceType]) {
        settings.icon = DEVICE_ICONS[device.deviceType];
    }

    if (device.common.icon && (!settings?.standardIcons || !settings?.icon)) {
        if (settings) {
            delete settings.iconSmall;
            delete settings.iconEnabledSmall;
            settings.icon = device.common.icon;
        } else {
            settings = { icon: device.common.icon };
        }
    }
    if (settings?.standardIcons) {
        delete settings.standardIcons;
    }

    return {
        tpl: 'tplMaterial2SimpleState',
        data: {
            name: Generic.getText(device.common.name),
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

export const getDeviceWidget = (device, standardIcons) => {
    const style = {
        left: '0px', // here must be string
        top: '0px', // here must be string
        width: '100%',
        position: 'relative',
    };
    // const widgetTitle = Generic.getText(device.common.name);

    if (device.deviceType === 'thermostat') {
        const _set = device.states.find(state => state.name === 'SET');
        const actual = device.states.find(state => state.name === 'ACTUAL');
        // const humidity = device.states.find(state => state.name === 'HUMIDITY');
        const mode = device.states.find(state => state.name === 'MODE');
        const power = device.states.find(state => state.name === 'POWER');
        const party = device.states.find(state => state.name === 'PARTY');
        const boost = device.states.find(state => state.name === 'BOOST');
        style.height = 160;

        const widget = {
            tpl: 'tplMaterial2Thermostat',
            style,
            data: {
                name: Generic.getText(device.common.name),
                widgetTitle: Generic.t(device.deviceType).replace('vis_2_widgets_material_', ''),
                wizardId: device._id,
                step: _set.common.step === 0.5 ? '0.5' : '1',
                g_common: true,
                count: 5,
                'oid-temp-set': _set?._id || '',
                'oid-temp-actual': actual?._id || '',
                'oid-power': power?._id || '',
                'oid-mode': mode?._id || '',
                'oid-boost': boost?._id || '',
                'oid-party': party?._id || '',
            },
        };
        if (mode?.common?.states) {
            if (Array.isArray(mode.common.states)) {
                const states = {};
                mode.common.states.forEach(key => (states[key] = key));
                mode.common.states = states;
            }
            widget.data.count = Object.keys(mode.common.states).length;
            Object.keys(mode.common.states).forEach((_mode, i) => {
                widget.data[`g_modes-${i}`] = true;
                widget.data[`title${i}`] = mode.common.states[_mode].toString().toUpperCase();
            });
        }
        return widget;
    }

    if (device.deviceType === 'light') {
        return simpleState(device, 'SET', style, { standardIcons });
    }

    if (device.deviceType === 'dimmer') {
        return simpleState(device, 'SET', style, { standardIcons });
    }

    if (device.deviceType === 'blind') {
        const set = device.states.find(state => state.name === 'SET');
        style.height = 120;
        return {
            tpl: 'tplMaterial2Blinds',
            style,
            data: {
                name: Generic.getText(device.common.name),
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
        const actual = device.states.find(state => state.name === 'ACTUAL');
        const humidity = device.states.find(state => state.name === 'SECOND');
        return {
            tpl: 'tplMaterial2Actual',
            style,
            data: {
                name: Generic.getText(device.common.name),
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
        return simpleState(device, 'ACTUAL', style, {
            colorEnabled: 'rgba(52,170,68,1)',
            iconSmall: ICONS.noMotion,
            iconEnabledSmall: ICONS.motion,
            standardIcons,
        });
    }

    if (device.deviceType === 'fireAlarm') {
        return simpleState(device, 'ACTUAL', style, {
            colorEnabled: '#F00',
            iconSmall: ICONS.fire,
            standardIcons,
        });
    }

    if (device.deviceType === 'floodAlarm') {
        return simpleState(device, 'ACTUAL', style, {
            colorEnabled: '#00F',
            iconSmall: ICONS.flood,
            standardIcons,
        });
    }

    if (device.deviceType === 'door') {
        return simpleState(device, 'ACTUAL', style, {
            colorEnabled: '#F00',
            iconSmall: ICONS.doorClosed,
            iconEnabledSmall: ICONS.doorOpened,
            standardIcons,
        });
    }

    if (device.deviceType === 'levelSlider') {
        return simpleState(device, 'SET', style, { standardIcons });
    }

    if (device.deviceType === 'lock') {
        const _set = device.states.find(state => state.name === 'SET');
        const open = device.states.find(state => state.name === 'OPEN');
        const working = device.states.find(state => state.name === 'WORKING');
        return {
            tpl: 'tplMaterial2Lock',
            style,
            data: {
                name: Generic.getText(device.common.name),
                widgetTitle: Generic.t(device.deviceType).replace('vis_2_widgets_material_', ''),
                wizardId: device._id,
                'lock-oid': _set?._id,
                'doorOpen-oid': open?._id,
                'lockWorking-oid': working?._id,
            },
        };
    }

    if (device.deviceType === 'socket') {
        return simpleState(device, 'SET', style, {
            iconSmall: ICONS.socket,
            standardIcons,
        });
    }

    if (device.deviceType === 'media') {
        const currentMediaTypes = [...MEDIA_TYPES];

        const result = {
            tpl: 'tplMaterial2Player',
            style,
            data: {
                name: Generic.getText(device.common.name),
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
        return simpleState(device, 'SET', style, {
            iconSmall: ICONS.volume,
            standardIcons,
        });
    }

    if (device.deviceType === 'volumeGroup') {
        return simpleState(device, 'SET', style, {
            iconSmall: ICONS.volume,
            standardIcons,
        });
    }

    if (device.deviceType === 'weatherForecast') {
        return {
            tpl: 'tplOpenWeatherMapWeather',
            style,
            data: {
                name: Generic.getText(device.common.name),
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
        return simpleState(device, 'ACTUAL', style, {
            colorEnabled: '#F00',
            iconSmall: ICONS.windowClosed,
            iconEnabledSmall: ICONS.windowOpened,
            standardIcons,
        });
    }

    if (device.deviceType === 'windowTilt') {
        return simpleState(device, 'ACTUAL', style, {
            colorEnabled: '#F00',
            iconSmall: ICONS.windowClosed,
            iconEnabledSmall: ICONS.windowTilted,
            standardIcons,
        });
    }

    return false;
};

export const getDeviceWidgetOnePage = (device, widgetId, parentWidget, viewObj, standardIcons) => {
    const addSwitch = (role, settings) => {
        if (standardIcons) {
            // get the appropriate icon
            if (role === 'value.humidity') {
                settings.icon = DEVICE_ICONS.humidity;
            } else if (DEVICE_ICONS[device.deviceType]) {
                settings.icon = DEVICE_ICONS[device.deviceType];
            }
        }
        if (!settings.icon && device.common.icon) {
            if (settings) {
                delete settings.iconSmall;
                settings.icon = device.common.icon;
            } else {
                settings = { icon: device.common.icon };
            }
        }
        const _set = device.states.find(state => state.common.role === role);
        if (_set) {
            // add only if the state does not exist
            for (let i = 1; i <= parentWidget.data.count; i++) {
                if (!_set || parentWidget.data[`oid${i}`] === _set._id) {
                    return false;
                }
            }

            parentWidget.data.count++;
            parentWidget.data[`oid${parentWidget.data.count}`] = _set._id;
            if (role === 'value.temperature' && settings.type === 'info') {
                parentWidget.data[`title${parentWidget.data.count}`] = Generic.t('Temperature');
            } else if (role === 'value.humidity' && settings.type === 'info') {
                parentWidget.data[`title${parentWidget.data.count}`] = Generic.t('Humidity');
            } else {
                parentWidget.data[`title${parentWidget.data.count}`] = Generic.getText(device.common.name);
            }
            // apply settings
            settings &&
                Object.keys(settings)
                    .filter(s => settings[s] !== undefined)
                    .forEach(
                        setting => (parentWidget.data[`${setting}${parentWidget.data.count}`] = settings[setting]),
                    );
        }
        return false;
    };

    if (device.deviceType === 'thermostat') {
        const _set = device.states.find(state => state.name === 'SET') || undefined;
        const actual = device.states.find(state => state.name === 'ACTUAL') || undefined;
        const humidity = device.states.find(state => state.name === 'HUMIDITY') || undefined;
        const power = device.states.find(state => state.name === 'POWER') || undefined;
        const party = device.states.find(state => state.name === 'PARTY') || undefined;
        const boost = device.states.find(state => state.name === 'BOOST') || undefined;
        // add only if the state does not exist
        for (let i = 1; i <= parentWidget.data.count; i++) {
            if (!_set || parentWidget.data[`oid${i}`] === _set._id) {
                return false;
            }
        }

        parentWidget.data.count++;
        parentWidget.data[`type${parentWidget.data.count}`] = 'thermostat';
        parentWidget.data[`oid${parentWidget.data.count}`] = _set._id;
        if (actual) {
            parentWidget.data[`actual${parentWidget.data.count}`] = actual._id;
        }
        if (humidity) {
            parentWidget.data[`humidity${parentWidget.data.count}`] = humidity._id;
        }
        if (power) {
            parentWidget.data[`switch${parentWidget.data.count}`] = power._id;
        }
        if (party) {
            parentWidget.data[`party${parentWidget.data.count}`] = party._id;
        }
        if (boost) {
            parentWidget.data[`boost${parentWidget.data.count}`] = boost._id;
        }
        parentWidget.data[`title${parentWidget.data.count}`] = Generic.getText(device.common.name);
        return true;
    }
    if (device.deviceType === 'rgb') {
        const red = device.states.find(state => state.name === 'RED') || undefined;
        const green = device.states.find(state => state.name === 'GREEN') || undefined;
        const blue = device.states.find(state => state.name === 'BLUE') || undefined;
        const power = device.states.find(state => state.name === 'ON' && state.common.write !== false) || undefined;
        const white = device.states.find(state => state.name === 'WHITE') || undefined;
        const saturation = device.states.find(state => state.name === 'SATURATION') || undefined;
        const dimmer = device.states.find(state => state.name === 'DIMMER' || state.name === 'BRIGHTNESS') || undefined;
        const temperature = device.states.find(state => state.name === 'TEMPERATURE') || undefined;
        // add only if the state does not exist
        for (let i = 1; i <= parentWidget.data.count; i++) {
            if (!red || parentWidget.data[`red${i}`] === red._id) {
                return false;
            }
        }

        parentWidget.data.count++;
        parentWidget.data[`type${parentWidget.data.count}`] = 'rgb';
        parentWidget.data[`rgbType${parentWidget.data.count}`] = white ? 'r/g/b/w' : 'r/g/b';
        parentWidget.data[`red${parentWidget.data.count}`] = red._id;
        parentWidget.data[`green${parentWidget.data.count}`] = green._id;
        parentWidget.data[`blue${parentWidget.data.count}`] = blue._id;
        if (white) {
            parentWidget.data[`white${parentWidget.data.count}`] = white._id;
        }
        if (saturation) {
            parentWidget.data[`saturation${parentWidget.data.count}`] = saturation._id;
        }
        if (temperature) {
            parentWidget.data[`color_temperature${parentWidget.data.count}`] = temperature._id;
        }
        if (power) {
            parentWidget.data[`switch${parentWidget.data.count}`] = power._id;
        }
        if (dimmer) {
            parentWidget.data[`brightness${parentWidget.data.count}`] = dimmer._id;
        }
        parentWidget.data[`title${parentWidget.data.count}`] = Generic.getText(device.common.name);
        return true;
    }
    if (device.deviceType === 'rgbSingle') {
        const rgb = device.states.find(state => state.name === 'RGB') || undefined;
        const power = device.states.find(state => state.name === 'ON' && state.common.write !== false) || undefined;
        const dimmer = device.states.find(state => state.name === 'DIMMER' || state.name === 'BRIGHTNESS') || undefined;
        const temperature = device.states.find(state => state.name === 'TEMPERATURE') || undefined;
        const saturation = device.states.find(state => state.name === 'SATURATION') || undefined;
        // add only if the state does not exist
        for (let i = 1; i <= parentWidget.data.count; i++) {
            if (!rgb || parentWidget.data[`oid${i}`] === rgb._id) {
                return false;
            }
        }

        parentWidget.data.count++;
        parentWidget.data[`type${parentWidget.data.count}`] = 'rgb';
        parentWidget.data[`rgbType${parentWidget.data.count}`] = 'rgb';
        parentWidget.data[`oid${parentWidget.data.count}`] = rgb._id;
        if (saturation) {
            parentWidget.data[`saturation${parentWidget.data.count}`] = saturation._id;
        }
        if (temperature) {
            parentWidget.data[`color_temperature${parentWidget.data.count}`] = temperature._id;
        }
        if (power) {
            parentWidget.data[`switch${parentWidget.data.count}`] = power._id;
        }
        if (dimmer) {
            parentWidget.data[`brightness${parentWidget.data.count}`] = dimmer._id;
        }
        parentWidget.data[`title${parentWidget.data.count}`] = Generic.getText(device.common.name);
        return true;
    }
    if (device.deviceType === 'rgbwSingle') {
        const rgbw = device.states.find(state => state.name === 'RGBW') || undefined;
        const power = device.states.find(state => state.name === 'ON' && state.common.write !== false) || undefined;
        const dimmer = device.states.find(state => state.name === 'DIMMER' || state.name === 'BRIGHTNESS') || undefined;
        const temperature = device.states.find(state => state.name === 'TEMPERATURE') || undefined;
        const saturation = device.states.find(state => state.name === 'SATURATION') || undefined;
        // add only if the state does not exist
        for (let i = 1; i <= parentWidget.data.count; i++) {
            if (!rgbw || parentWidget.data[`oid${i}`] === rgbw._id) {
                return false;
            }
        }

        parentWidget.data.count++;
        parentWidget.data[`type${parentWidget.data.count}`] = 'rgb';
        parentWidget.data[`rgbType${parentWidget.data.count}`] = 'rgbw';
        parentWidget.data[`oid${parentWidget.data.count}`] = rgbw._id;
        if (saturation) {
            parentWidget.data[`saturation${parentWidget.data.count}`] = saturation._id;
        }
        if (temperature) {
            parentWidget.data[`color_temperature${parentWidget.data.count}`] = temperature._id;
        }
        if (power) {
            parentWidget.data[`switch${parentWidget.data.count}`] = power._id;
        }
        if (dimmer) {
            parentWidget.data[`brightness${parentWidget.data.count}`] = dimmer._id;
        }
        parentWidget.data[`title${parentWidget.data.count}`] = Generic.getText(device.common.name);
        return true;
    }
    if (device.deviceType === 'hue') {
        const hue = device.states.find(state => state.name === 'HUE') || undefined;
        const power = device.states.find(state => state.name === 'ON' && state.common.write !== false) || undefined;
        const dimmer = device.states.find(state => state.name === 'DIMMER' || state.name === 'BRIGHTNESS') || undefined;
        const temperature = device.states.find(state => state.name === 'TEMPERATURE') || undefined;
        const saturation = device.states.find(state => state.name === 'SATURATION') || undefined;
        // add only if the state does not exist
        for (let i = 1; i <= parentWidget.data.count; i++) {
            if (!hue || parentWidget.data[`hue${i}`] === hue._id) {
                return false;
            }
        }

        parentWidget.data.count++;
        parentWidget.data[`type${parentWidget.data.count}`] = 'rgb';
        parentWidget.data[`rgbType${parentWidget.data.count}`] = 'hue/sat/lum';
        parentWidget.data[`hue${parentWidget.data.count}`] = hue._id;
        if (saturation) {
            parentWidget.data[`saturation${parentWidget.data.count}`] = saturation._id;
        }
        if (temperature) {
            parentWidget.data[`color_temperature${parentWidget.data.count}`] = temperature._id;
        }
        if (power) {
            parentWidget.data[`switch${parentWidget.data.count}`] = power._id;
        }
        if (dimmer) {
            parentWidget.data[`brightness${parentWidget.data.count}`] = dimmer._id;
        }
        parentWidget.data[`title${parentWidget.data.count}`] = Generic.getText(device.common.name);
        return true;
    }
    if (device.deviceType === 'ct') {
        const temperature = device.states.find(state => state.name === 'TEMPERATURE') || undefined;
        const power = device.states.find(state => state.name === 'ON' && state.common.write !== false) || undefined;
        const dimmer = device.states.find(state => state.name === 'DIMMER' || state.name === 'BRIGHTNESS') || undefined;
        const saturation = device.states.find(state => state.name === 'SATURATION') || undefined;
        // add only if the state does not exist
        for (let i = 1; i <= parentWidget.data.count; i++) {
            if (!temperature || parentWidget.data[`color_temperature${i}`] === temperature._id) {
                return false;
            }
        }

        parentWidget.data.count++;
        parentWidget.data[`type${parentWidget.data.count}`] = 'rgb';
        parentWidget.data[`rgbType${parentWidget.data.count}`] = 'ct';
        parentWidget.data[`color_temperature${parentWidget.data.count}`] = temperature._id;
        if (saturation) {
            parentWidget.data[`saturation${parentWidget.data.count}`] = saturation._id;
        }
        if (power) {
            parentWidget.data[`switch${parentWidget.data.count}`] = power._id;
        }
        if (dimmer) {
            parentWidget.data[`brightness${parentWidget.data.count}`] = dimmer._id;
        }
        parentWidget.data[`title${parentWidget.data.count}`] = Generic.getText(device.common.name);
        return true;
    }
    if (device.deviceType === 'lock') {
        const _set = device.states.find(state => state.name === 'SET') || undefined;
        const open = device.states.find(state => state.name === 'OPEN') || undefined;
        const working = device.states.find(state => state.name === 'WORKING') || undefined;
        // add only if the state does not exist
        for (let i = 1; i <= parentWidget.data.count; i++) {
            if (!_set || parentWidget.data[`oid${i}`] === _set._id) {
                return false;
            }
        }

        parentWidget.data.count++;
        parentWidget.data[`type${parentWidget.data.count}`] = 'lock';
        parentWidget.data[`oid${parentWidget.data.count}`] = _set._id;
        if (open) {
            parentWidget.data[`open${parentWidget.data.count}`] = open._id;
        }
        if (working) {
            parentWidget.data[`working${parentWidget.data.count}`] = working._id;
        }
        parentWidget.data[`title${parentWidget.data.count}`] = Generic.getText(device.common.name);
        return true;
    }

    if (device.deviceType === 'vacuumCleaner') {
        // todo
    }

    if (device.deviceType === 'media' || device.deviceType === 'weatherForecast') {
        // try to find existing widget
        if (Object.values(viewObj.widgets).find(widget => widget.data.wizardId === device._id)) {
            return false;
        }
        viewObj.widgets[widgetId] = getDeviceWidget(device, standardIcons);
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
            infoInactiveIcon: ICONS.noMotion,
            infoActiveIcon: ICONS.motion,
        });
    }
    if (device.deviceType === 'fireAlarm') {
        return addSwitch('sensor.alarm.fire', {
            type: 'info',
            colorEnabled: '#F00',
            infoInactiveIcon: ICONS.fire,
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
