# Download Once

Recursively downloads files via scp, ignoring any which already exist in the destination (based on filename) or which have been downloaded before, even if those files have since been moved or deleted.

It does this by storing an ingore list in `destination/folder/.download-once-ignore`

## Usage:

```
node download.js user@some.server.com:/path/to/source/folder ~/some/destination/folder
```

## Caveats:
* You must have public key authenitcation setup.
* The source path can't use `~`, the `find` command spits out absolute paths, which breaks this script when it tries to translate source path to destination path. `~` in the destination path is fine.
* I've only tested this on a few machines. **YMMV**