# markdown-editing Specification

## Purpose
TBD - created by archiving change add-markdown-viewer-editor. Update Purpose after archive.
## Requirements
### Requirement: Toggle between view and edit modes
The system SHALL default to a view-only preview and allow the user to toggle an edit mode that reveals a Markdown source editor.

#### Scenario: Enter edit mode
- **WHEN** the user activates "Toggle Edit" from the menu or its shortcut while viewing a document
- **THEN** a source editor becomes visible containing the document's Markdown text

#### Scenario: Return to view-only
- **WHEN** the user toggles edit mode off
- **THEN** the editor is hidden and only the rendered preview remains visible

### Requirement: Live preview while editing
The system SHALL offer a split view that shows the rendered preview beside the source editor, and SHALL update it to reflect edits with a short debounce, without requiring a manual refresh.

#### Scenario: Show the preview beside the editor
- **WHEN** the user activates the live preview toggle in the toolbar or its shortcut while editing
- **THEN** the preview appears beside the source editor and both panes stay usable

#### Scenario: Preview follows edits
- **WHEN** the user types or deletes text in the source editor with the live preview showing
- **THEN** the preview updates to reflect the new content within a brief delay

#### Scenario: Preview follows the editor position
- **WHEN** the user scrolls or edits at some point of the document
- **THEN** the preview scrolls to the matching part of the rendered document instead of staying where it was

#### Scenario: Editor follows the preview position
- **WHEN** the user scrolls the preview pane with the live preview showing
- **THEN** the source editor scrolls to the matching part of the document, and the two panes do not fight each other

#### Scenario: Available only while editing
- **WHEN** a document is open in view mode
- **THEN** the live preview toggle is disabled, becoming available once edit mode is on

#### Scenario: Resize the panes
- **WHEN** the user drags the divider between the panes
- **THEN** the panes resize within their allowed range, and the chosen ratio is restored in later sessions

#### Scenario: Workspace too narrow
- **WHEN** the workspace is too narrow to show two readable panes
- **THEN** the live preview toggle is disabled and explains why

### Requirement: Dirty-state tracking
The system SHALL track unsaved changes and indicate the dirty state, warning before actions that would discard unsaved edits.

#### Scenario: Undo back to the saved version
- **WHEN** the user undoes every edit, or retypes the text so it matches the version last opened or saved again
- **THEN** the unsaved-changes indicator clears and closing the document no longer asks to save

#### Scenario: Indicate unsaved changes
- **WHEN** the user modifies the document after the last save
- **THEN** the UI shows an unsaved-changes indicator (e.g. a modified marker in the title)

#### Scenario: Warn before discarding
- **WHEN** the user opens another file or closes the window while there are unsaved changes
- **THEN** the application prompts to save, discard, or cancel before proceeding

### Requirement: Save and Save As
The system SHALL save the current document back to its file, and SHALL support saving to a new path via Save As.

#### Scenario: Save existing file
- **WHEN** the user invokes Save on a document that already has a file path
- **THEN** the file on disk is overwritten with the current content and the dirty indicator clears

#### Scenario: Save As new file
- **WHEN** the user invokes Save As and chooses a destination path
- **THEN** the content is written to that path, which becomes the document's current file

#### Scenario: Save a new untitled document
- **WHEN** the user invokes Save on a document with no file path yet
- **THEN** the application prompts for a destination path before writing

### Requirement: External file changes
The system SHALL detect when the file behind an open document is changed or removed by another application, and SHALL never overwrite such a change without the user's confirmation.

#### Scenario: Reload an unedited document silently
- **WHEN** another application changes the file of an open document that has no unsaved changes
- **THEN** the document is reloaded from disk and a brief notice says it was updated

#### Scenario: Conflict with unsaved changes
- **WHEN** another application changes the file of an open document that has unsaved changes
- **THEN** the application offers to reload (discarding local edits), save the local version under another name, or keep the local edits

#### Scenario: File removed
- **WHEN** the file of an open document is deleted or moved away
- **THEN** the application offers to save it again at the same path, save it under another name, or keep it open unchanged

#### Scenario: Save after an external change
- **WHEN** the user saves a document whose file changed on disk since it was last read or saved
- **THEN** nothing is written and the application offers to replace the file, save under another name, reload, or cancel

#### Scenario: Background tabs
- **WHEN** the changed document is not the active tab
- **THEN** the application does not switch tabs; the question is asked when the user selects that tab

#### Scenario: Changes that are not real
- **WHEN** the file is touched without changing its bytes, or Moji itself saves it
- **THEN** no notice or prompt is shown

#### Scenario: Atomic saves and missed events
- **WHEN** another editor saves by writing a temporary file and renaming it over the original, or the filesystem does not deliver change events
- **THEN** the change is still detected, at the latest when the Moji window regains focus

### Requirement: Recover untitled documents
The system SHALL persist documents without a filesystem path as internal recovery drafts by default and SHALL restore those documents on the next app launch.

#### Scenario: Recover unsaved changes to a file
- **WHEN** keeping new documents and unsaved changes between sessions is enabled, a file has unsaved changes, and the user quits the application
- **THEN** the application does not ask to save; on the next launch the file reopens with those changes and its unsaved-changes indicator, even when reopening files is disabled

#### Scenario: Closing a file with unsaved changes still asks
- **WHEN** the user closes the tab of a file with unsaved changes
- **THEN** the application asks to save, discard, or cancel, and discarding removes the recovery draft

#### Scenario: Recovered changes to a file that changed meanwhile
- **WHEN** a file with recovered changes was modified or deleted while the application was closed
- **THEN** the external-change flow applies: the user is asked what to do, and saving asks before overwriting the newer file

#### Scenario: Recover after restart
- **WHEN** an untitled document is open and its latest content has been persisted as a recovery draft
- **THEN** closing and reopening the application restores that document with its title and content

#### Scenario: Remove recovery after Save As
- **WHEN** a recovered or untitled document is saved to a filesystem path
- **THEN** the application removes its internal recovery draft

#### Scenario: Closing an untitled document asks
- **WHEN** the user closes the tab of an untitled document with content, even one already kept as a recovery draft
- **THEN** the application asks to save, discard, or cancel before closing it

#### Scenario: Remove recovery after closing tab
- **WHEN** the user closes or discards an untitled document
- **THEN** the application removes its internal recovery draft so it is not restored later

#### Scenario: Disable recovery
- **WHEN** the user disables untitled-document recovery in Settings
- **THEN** new changes are not written to internal recovery storage and normal unsaved-change confirmation applies

#### Scenario: Recover a large document
- **WHEN** an untitled document holds more text than any fixed character limit would allow, and the machine has memory and disk space for it
- **THEN** the recovery draft is persisted and restored in full, with no content removed

#### Scenario: Recovery storage is unavailable
- **WHEN** a recovery draft cannot be written because the memory budget or the free disk space is insufficient
- **THEN** the application reports how much was needed and how much was available, keeps the previously stored draft unchanged, and never stores a shortened copy of the document

### Requirement: Reopen files
The system SHALL reopen, on launch, the tabs that were open when it was last closed, in the same order and with the same active tab.

#### Scenario: Reopen open files
- **WHEN** reopening files is enabled (the default) and the user relaunches the application
- **THEN** every file that was open is read again from disk, together with recovered untitled documents and files with unsaved changes, in their previous order

#### Scenario: Reopening disabled
- **WHEN** reopening files is disabled
- **THEN** only documents with recovery drafts (untitled documents and files with unsaved changes) are restored

#### Scenario: Missing file
- **WHEN** a file without unsaved changes no longer exists at launch
- **THEN** it is skipped and removed from the recent files

### Requirement: Indent and outdent in the source editor
The system SHALL indent with Tab and outdent with Shift+Tab inside the source editor, using two spaces per level, instead of moving focus to the next control.

#### Scenario: Nest a list item
- **WHEN** the cursor is on the leading whitespace of a list item and the user presses Tab
- **THEN** the line receives one more indent level, nesting it under the item above

#### Scenario: Indent inside a line
- **WHEN** the cursor sits after text on a line and the user presses Tab
- **THEN** one indent unit is inserted at the cursor

#### Scenario: Indent a selection
- **WHEN** text spanning one or more lines is selected and the user presses Tab
- **THEN** every selected line receives one more indent level

#### Scenario: Outdent
- **WHEN** the user presses Shift+Tab
- **THEN** every touched line loses one indent level, and lines with no leading whitespace stay unchanged
