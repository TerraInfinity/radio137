function xml(value: string): string {
  return value
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;")
    .replaceAll('"', "&" + "quot;");
}

/** Unsigned shortcut that opens the show in Podcasts. iOS still asks the guest to tap Add. */
export function playShowShortcutXml(name: string, openUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>WFWorkflowClientVersion</key>
  <string>2700.0.4</string>
  <key>WFWorkflowMinimumClientVersion</key>
  <integer>900</integer>
  <key>WFWorkflowMinimumClientVersionString</key>
  <string>900</string>
  <key>WFWorkflowName</key>
  <string>${xml(name.slice(0, 40))}</string>
  <key>WFWorkflowIcon</key>
  <dict>
    <key>WFWorkflowIconGlyphNumber</key>
    <integer>59511</integer>
    <key>WFWorkflowIconStartColor</key>
    <integer>4282601983</integer>
  </dict>
  <key>WFWorkflowTypes</key>
  <array>
    <string>Watch</string>
    <string>NCWidget</string>
  </array>
  <key>WFWorkflowHasShortcutInputVariables</key>
  <false/>
  <key>WFWorkflowImportQuestions</key>
  <array/>
  <key>WFWorkflowActions</key>
  <array>
    <dict>
      <key>WFWorkflowActionIdentifier</key>
      <string>is.workflow.actions.openurl</string>
      <key>WFWorkflowActionParameters</key>
      <dict>
        <key>WFInput</key>
        <string>${xml(openUrl)}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>
`;
}

export function shortcutImportUrl(fileUrl: string, name: string): string {
  const params = new URLSearchParams({ url: fileUrl, name });
  return `shortcuts://import-shortcut?${params.toString()}`;
}
