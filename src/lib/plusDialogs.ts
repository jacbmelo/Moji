// Moji Plus: native alerts in place of the HTML dialogs (HIG "Alerts"). On macOS they appear as
// sheets attached to the window; the OS lays out the buttons in its own order. See FORK.md.
import type { TFunction } from 'i18next'
import type { ConfirmChoice } from '../components/ConfirmDialog'
import type { ExternalChangeChoice, ExternalChangeVariant } from '../components/ExternalChangeDialog'

const mac = (): boolean => window.api.platform === 'darwin'

/** Save / Don't Save / Cancel for one or more documents with unsaved changes. */
export async function askUnsavedNative(t: TFunction, names: string[]): Promise<ConfirmChoice> {
  const choices: ConfirmChoice[] = mac() ? ['save', 'cancel', 'discard'] : ['save', 'discard', 'cancel']
  const label = { save: t('dialog.save'), discard: t('plus.dialog.dontSave'), cancel: t('dialog.cancel') }
  const response = await window.api.showMessageBox({
    type: 'warning',
    message:
      names.length > 1
        ? t('plus.dialog.unsavedManyMessage', { count: names.length })
        : t('plus.dialog.unsavedMessage', { name: names[0] ?? t('app.untitled'), interpolation: { escapeValue: false } }),
    detail: t('plus.dialog.unsavedDetail'),
    buttons: choices.map((choice) => label[choice]),
    defaultId: 0,
    cancelId: choices.indexOf('cancel')
  })
  return choices[response] ?? 'cancel'
}

/** The external-change question, with the same choices as ExternalChangeDialog. */
export async function askExternalChangeNative(
  t: TFunction,
  variant: ExternalChangeVariant,
  name: string
): Promise<ExternalChangeChoice> {
  const dismiss: ExternalChangeChoice = variant === 'conflict' ? 'cancel' : 'keep'
  const middle: ExternalChangeChoice[] =
    variant === 'deleted' ? ['save'] : variant === 'conflict' ? ['reload', 'overwrite'] : ['reload']
  // The default action first, then the alternatives, with the safe dismissal last.
  const choices: ExternalChangeChoice[] = ['saveAs', ...middle, dismiss]
  const response = await window.api.showMessageBox({
    type: 'warning',
    message: t(`externalChange.${variant}Title`),
    detail: t(`externalChange.${variant}Body`, { name, interpolation: { escapeValue: false } }),
    buttons: choices.map((choice) => t(`externalChange.${choice}`)),
    defaultId: 0,
    cancelId: choices.length - 1
  })
  return choices[response] ?? dismiss
}
