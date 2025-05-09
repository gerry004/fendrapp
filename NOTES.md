For the Fendr App, basically comment moderation

Tasks:
- login with Instagram Creator Account, instagram api with instagram login, login should be persisted
- fetch all posts and comments from the account within a time frame, default in the past week
- there will be three types of settings:
  - auto delete
  - auto hide
  - manual review

- be able to select, hide, and delete individual comments
- be able to bulk select and hide/delete comments

- it needs to save all the analysed comments into a database for each user
- comments that have been analysed should not be analysed again

- when comments are being anlaysed, it should be able to show loading progress, should probably be done in the background, so that the user doesn't need to wait for the comments to be analysed before doing other things, but might not be needed at this stage.

- it should be a progressive web app, so that it can be added to the homescreen of the user very easily
