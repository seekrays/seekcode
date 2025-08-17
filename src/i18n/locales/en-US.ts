export default {
  // Common
  common: {
    ok: "OK",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    search: "Search",
    clear: "Clear",
    copy: "Copy",
    create: "Create",
    update: "Update",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    open: "Open",
    refresh: "Refresh",
    reset: "Reset",
    apply: "Apply",
    export: "Export",
    import: "Import",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    about: "About",
  },

  // App title
  app: {
    title: "SeekCode",
    subtitle: "Code Snippets and Clipboard Management Tool",
  },

  // Navigation and tabs
  nav: {
    codeSnippets: "Code Snippets",
    clipboardHistory: "Clipboard",
    settings: "Settings",
  },

  // Search
  search: {
    placeholder: "Search code snippets or clipboard content...",
    noResults: "No results found",
    tags: "Tags",
    language: "Language",
    allLanguages: "All Languages",
    title: "Smart Search",
    description: "Quickly search and filter code snippet content",
  },

  // Code snippets
  snippet: {
    title: "Title",
    description: "Description",
    language: "Programming Language",
    tags: "Tags",
    content: "Content",
    createdAt: "Created At",
    updatedAt: "Updated At",
    newSnippet: "New Code Snippet",
    editSnippet: "Edit Code Snippet",
    deleteSnippet: "Delete Code Snippet",
    copyCode: "Copy Code",
    copy: "Copy",
    saveAsSnippet: "Save as Code Snippet",
    noSnippets: "No code snippets yet",
    createFirstSnippet: "Create your first code snippet",
    snippetSaved: "Code snippet saved",
    snippetDeleted: "Code snippet deleted",
    snippetCopied: "Code snippet copied to clipboard",
    enterTitle: "Enter title",
    enterDescription: "Enter description (optional)",
    enterTags: "Enter tags (comma separated)",
    selectLanguage: "Select programming language",
    enterContent: "Enter code content",
    confirmDelete: "Are you sure you want to delete this code snippet?",
    deleteConfirmTitle: "Delete Confirmation",
    deleteConfirmMessage:
      "This action cannot be undone. Are you sure you want to delete?",
    titlePlaceholder: "Enter snippet title",
    codePlaceholder: "Enter code...",
    selectSnippet: "Select a code snippet",
    createHint: "or create a new code snippet",
    addTag: "Add Tag",
    noTitle: "Untitled",
    languageFilter: "Language Filter",
    allLanguages: "All Languages",
    createInstructions:
      "Click the + button in the bottom right to create your first code snippet",
    storeAsSnippet: "Store as Code Snippet",
    tagName: "Tag Name",
    confirmAdd: "Confirm Add",
    deleteTag: "Delete Tag",
  },

  // Clipboard
  clipboard: {
    title: "Clipboard",
    history: "Clipboard History",
    noHistory: "No clipboard history yet",
    copyToClipboard: "Copy to Clipboard",
    clipboardContent: "Clipboard Content",
    saveAsSnippet: "Save as Code Snippet",
    copiedToClipboard: "Copied to clipboard",
    savedAsSnippet: "Saved as code snippet",
    textType: "Text",
    codeType: "Code",
    linkType: "Link",
    imageType: "Image",
    fileType: "File",
    otherType: "Other",
    preview: "Preview",
    fullContent: "Full Content",
    selectItem: "Select a clipboard item",
    viewHistory: "View clipboard history content",
    placeholder: "Clipboard content...",
  },

  // Toast notifications
  toast: {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
    copied: "Copied",
    saved: "Saved",
    deleted: "Deleted",
    updated: "Updated",
    created: "Created",
    failed: "Failed",
    networkError: "Network Error",
    unknownError: "Unknown Error",
  },

  // Settings
  settings: {
    title: "Settings",
    general: "General",
    appearance: "Appearance",
    language: "Language",
    mcp: "MCP Management",
    about: "About",

    // General settings
    autostart: "Auto Start",
    autostartDesc: "Start application automatically on boot",
    enabled: "Enabled",
    disabled: "Disabled",

    // Appearance settings
    themeMode: "Theme Mode",
    lightTheme: "Light Theme",
    darkTheme: "Dark Theme",
    systemTheme: "System Theme",
    appearanceTitle: "Appearance Theme",
    appearanceDesc:
      "Choose the application appearance theme, you can follow system settings or manually select.",
    followSystem: "Follow System",
    currentTheme: "Current",
    light: "Light",
    lightDesc: "Bright and fresh",
    dark: "Dark",
    darkDesc: "Eye protection mode",
    previewTitle: "Preview Effect",
    previewDesc: "This is the interface preview effect under the current theme",

    // Language settings
    languageMode: "Language",
    languageDesc: "Select application interface language",
    chinese: "中文",
    english: "English",
    systemLanguage: "Follow System",

    // About
    version: "Version",
    author: "Author",
    description:
      "A clean and efficient code snippet and clipboard management tool",
    github: "GitHub",
    website: "Website",
    feedback: "Feedback",
    contact: "Contact",

    // About page
    appSubtitle: "Efficient code snippet management tool",
    mainFeatures: "Main Features",
    codeManagement: "Code Snippet Management",
    codeManagementDesc:
      "Support code snippet storage and management for multiple programming languages",
    clipboardManagement: "Clipboard Data Management",
    clipboardManagementDesc:
      "Automatically record and manage clipboard history",
    systemInfo: "System Information",
    appVersion: "Application Version",
    buildTool: "Build Tool",
    currentThemeLabel: "Current Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    devLanguage: "Development Language",
    copyright: "Focused on improving development efficiency tools",

    // Features
    themeFeature: "Theme Switching",
    themeFeatureDesc: "Support light, dark themes and system following",
    techStack: "Tech Stack",

    // Settings save
    settingsSaved: "Settings saved",
    settingsError: "Settings Error",
    settingsReset: "Settings reset",

    // MCP Management
    mcpManagement: "MCP Management",
    listenAddress: "Listen Address",
    listenPort: "Listen Port",
    autoStartMcpServer: "Auto Start MCP Server",
    autoStartMcpServerDesc: "Start MCP service automatically on boot",
    running: "Running",
    stopped: "Stopped",
    starting: "Starting...",
    stopping: "Stopping...",
    startService: "Start Service",
    stopService: "Stop Service",
    features: "Features",
    querySnippets: "Query Code Snippets",
    createSnippets: "Create Code Snippets",
    mcpJsonConfig: "MCP JSON Config",
    copyConfig: "Copy Config",
    runningStatus: "Running Status",
    address: "Address",

    // Validation error messages
    hostRequired: "Please enter an IP address",
    invalidHost: "Please enter a valid IP address or localhost",
    portRangeError: "Port number must be between 1-65535",
    commonPortWarning:
      "Warning: This port is commonly used and may be occupied by other services",

    // Help links
    mcpHelp: "MCP Usage Help",

    // Data Management
    data: "Data Management",
    exportData: "Data Export",
    exportDataDesc: "Export your code snippets data for backup and migration",
    exportSnippets: "Export Code Snippets",
    exporting: "Exporting...",
    importData: "Data Import",
    importDataDesc:
      "Import code snippets data from JSON files, support migration from other devices",
    importing: "Importing...",
    clearExistingData: "Clear Existing Data",
    clearExistingDataDesc:
      "Clear all existing code snippets before import (use with caution)",
    dataStatistics: "Data Statistics",
    snippetsCount: "Code Snippets Count",
    clipboardCount: "Clipboard Count",

    // Clipboard Management
    maxClipboardItems: "Max Retention Count",
    maxClipboardItemsPlaceholder: "Enter max clipboard items to retain",
    maxClipboardItemsDesc:
      "Set the maximum number of clipboard history records to retain. Old records beyond this limit will be automatically deleted.",
    clearClipboardData: "Clear Clipboard Data",
    clearClipboardDataDesc:
      "Delete all clipboard history records. This action cannot be undone.",
    clearClipboard: "Clear Clipboard",
    clickToSelectOrDrag: "Click to select file or drag file here",
    selectJsonFile: "Select JSON File",
    reselect: "Reselect",
    noSnippetsToExport: "No code snippets to export",
    exportSnippetsSuccess: "Code snippets exported successfully",
    exportCancelled: "Export cancelled",
    exportFailed: "Export failed",
    importCancelled: "Import cancelled",
    clearingExistingData: "Clearing existing data...",
    clearedExistingSnippets: "Cleared {count} existing code snippets",
    importingSnippets: "Importing {count} code snippets...",
    dataReplacementComplete:
      "Data replacement complete: Cleared original data, successfully imported {count} code snippets",
    importSnippetsSuccess: "Successfully imported {count} code snippets",
    importFailed: "Import failed",
    loadDataStatisticsFailed: "Failed to load data statistics",
    clipboardDataCleared: "Clipboard data cleared",
    clearClipboardDataFailed: "Failed to clear clipboard data",
    save: "Save",
    codeSnippetDataManagement: "Code Snippet Data Management",
    confirmClearClipboardData:
      "Are you sure you want to clear all clipboard data? This action cannot be undone.",
    confirmClearClipboardDataTitle: "Clear Clipboard Data",
    clipboardSettingsSaved: "Clipboard settings saved",
    saveClipboardSettingsFailed: "Failed to save clipboard settings",
    saveSettingsFailed: "Failed to save settings",
    loadClipboardSettingsFailed: "Failed to load clipboard settings",
    confirmClearExistingData:
      "Are you sure you want to clear all existing data?",
    confirmClearExistingDataDesc:
      "Currently there are {count} code snippets that will be deleted. This action cannot be undone.",
    importFileContains: "Import file contains {count} code snippets.",
    confirmClearExistingDataTitle: "Confirm Clear Existing Data",

    // Update
    checkUpdate: "Check for Updates",
    installUpdate: "Install Update",
    updateAvailable: "New Version Available",
    updateNotAvailable: "Up to Date",
    updateError: "Update Check Failed",
    updating: "Updating...",
  },

  // Shortcuts
  shortcuts: {
    title: "Shortcuts",
    newSnippet: "New Code Snippet",
    search: "Search",
    copy: "Copy",
    save: "Save",
    delete: "Delete",
    settings: "Settings",
    quit: "Quit",
  },

  // Error messages
  error: {
    networkError: "Network Error",
    serverError: "Server Error",
    unknownError: "Unknown Error",
    saveError: "Save Failed",
    loadError: "Load Failed",
    deleteError: "Delete Failed",
    copyError: "Copy Failed",
    noContent: "Content is Empty",
    invalidFormat: "Invalid Format",
    permissionDenied: "Permission Denied",
    fileNotFound: "File Not Found",
    operationFailed: "Operation Failed",
    dataCorrupted: "Data Corrupted",
    connectionLost: "Connection Lost",
    timeout: "Operation Timeout",
    themeGetFailed: "Failed to get theme settings",
    themeSetFailed: "Failed to set theme",
    clipboardInitFailed: "Failed to initialize clipboard",
    clipboardStartFailed: "Failed to start clipboard monitoring",
    clipboardAddFailed: "Failed to add clipboard item",
    clipboardDeleteFailed: "Failed to delete clipboard item",
    clipboardClearFailed: "Failed to clear clipboard history",
    contentEmpty: "Content cannot be empty",
  },

  // Success messages
  success: {
    saved: "Saved Successfully",
    deleted: "Deleted Successfully",
    copied: "Copied Successfully",
    updated: "Updated Successfully",
    created: "Created Successfully",
    imported: "Imported Successfully",
    exported: "Exported Successfully",
    reset: "Reset Successfully",
    settingsApplied: "Settings Applied",
  },

  // UI terms
  ui: {
    selectTags: "Select Tags",
    selectedCount: "Selected",
    items: "items",
    clearAll: "Clear All",
    noTags: "No tags available",
    noContent: "No Content",
    line: "Line",
    column: "Col",
    errorLabel: "Error",
  },

  // Tags
  tags: {
    moreTags: "{count} more tags",
  },

  time: {
    invalid_date: "Invalid date",
    just_now: "Just now",
    minutes_ago: "{minutes} minutes ago",
    hours_ago: "{hours} hours ago",
    days_ago: "{days} days ago",
  },

  // Update dialog
  update: {
    dialogTitle: "New Version Found",
    newVersion: "New Version",
    releaseNotes: "Release Notes",
    confirmUpdate: "A new version is available. Update now?",
    updateNow: "Update Now",
    downloading: "Downloading update...",
    alreadyLatest: "Already up to date",
    checkFailed: "Update check failed",
    updateFailed: "Update failed, please try again later",
    restartFailed: "Restart failed",
  },
};
