# pnpm Override Configuration Source

Source: <https://pnpm.io/10.x/settings#overrides>

The pnpm 10 settings documentation states that `overrides` may be defined only at the root of the project, including in `pnpm-workspace.yaml`. It documents transitive dependency selectors in the form `parent@version>dependency`, for example `qar@1>zoo`.

An Express-scoped override was tested for this project, but pnpm 10.4.1 did not expose the workspace setting through its effective project configuration or record it in the lockfile. The experiment was removed rather than retaining configuration that appeared active but did not protect fresh installations.

The remediation instead uses supported direct dependency resolution: Express was upgraded to 4.22.2, whose published manifest requires `qs ~6.15.1` and `body-parser ~1.20.5`, allowing the patched releases. `path-to-regexp ^0.1.13` is declared directly so pnpm resolves Express's compatible `~0.1.12` range to the patched release without an override.

Sources:

- <https://pnpm.io/10.x/settings#overrides>
- <https://github.com/expressjs/express/releases/tag/4.22.2>
- <https://expressjs.com/en/advanced/security-updates/>

The tested workspace syntax was:

```yaml
overrides:
  "express@4.21.2>body-parser": "1.20.6"
  "express@4.21.2>path-to-regexp": "0.1.13"
  "express@4.21.2>qs": "6.15.2"
```
