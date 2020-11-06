# delete-release-action

This action delete a release and all of its assets.

## Inputs

### `release_name`

**Optional** The name of the release to delete.

### `release_id`

**Optional** The id of the release to delete.

### `suppress_errors`

**Optional** Whether suppress errors or not. Default: `false`.

Notice: *Must provide a valid release_name or release_id*

If the provided `release_name` or `release_id` is not correct. This action will failed and log the detailed error message or just log the detailed error message if `suppress_errors` is true.

## Outputs

### `deleted_assets`

The deleted assets while delete the release.

## How to contribute

1. fork the repo
2. git clone the forked repo
3. cd the forked repo
4. npm i
5. add features or fix bugs
6. npm run build
7. git push and send pull requests

## Example usage

```yaml
uses: liudonghua123/delete-release-action@v1
with:
  release_name: 'latest'
```
