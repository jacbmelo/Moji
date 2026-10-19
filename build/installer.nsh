; Moji Plus: NSIS customizations, included by electron-builder (nsis.include defaults to
; build/installer.nsh). See FORK.md.
;
; customCheckAppRunning replaces electron-builder's check for a running app. Its default asks
; PowerShell for any process whose path starts with the installation folder, so an uninstaller
; that runs from that folder finds itself, kills itself and fails. That happens when policies
; (AppLocker and the like) block executables in %TEMP%: the setup then runs the old uninstaller
; in place, fails five times and reports "Moji Plus cannot be closed". Here the app is found by
; its executable name, among the current user's processes only, as electron-builder already
; does without PowerShell.

!macro _mojiPlusFindApp _RETURN
  nsExec::Exec `"$CmdPath" /C tasklist /FI "USERNAME eq %USERNAME%" /FI "IMAGENAME eq ${APP_EXECUTABLE_FILENAME}" /FO CSV /NH | "$SYSDIR\findstr.exe" /B /I /C:"\"${APP_EXECUTABLE_FILENAME}\""`
  Pop ${_RETURN}
!macroend

!macro customCheckAppRunning
  !insertmacro _mojiPlusFindApp $R0
  ${if} $R0 == 0
    ${if} ${isUpdated}
      ; The app is quitting to install the update: give it time before closing it.
      Sleep 1000
    ${else}
      MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "$(appRunning)" /SD IDOK IDOK +2
      Quit
    ${endIf}

    DetailPrint "$(appClosing)"
    nsExec::Exec `"$CmdPath" /C taskkill /IM "${APP_EXECUTABLE_FILENAME}" /FI "USERNAME eq %USERNAME%"`
    Pop $R0

    StrCpy $R1 0
    ${Do}
      Sleep 1000
      !insertmacro _mojiPlusFindApp $R0
      ${if} $R0 != 0
        ${Break}
      ${endIf}

      nsExec::Exec `"$CmdPath" /C taskkill /F /T /IM "${APP_EXECUTABLE_FILENAME}" /FI "USERNAME eq %USERNAME%"`
      Pop $R0
      Sleep 1000
      !insertmacro _mojiPlusFindApp $R0
      ${if} $R0 != 0
        ${Break}
      ${endIf}

      ; Still running after a forced close (for example, started as administrator).
      IntOp $R1 $R1 + 1
      ${if} $R1 > 1
        MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "$(appCannotBeClosed)" /SD IDCANCEL IDRETRY +2
        Quit
      ${endIf}
    ${Loop}
  ${endIf}
!macroend
