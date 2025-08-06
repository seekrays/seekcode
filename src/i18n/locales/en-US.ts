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
  },

  // Clipboard
  clipboard: {
    history: "Clipboard History",
    noHistory: "No clipboard history yet",
    copyToClipboard: "Copy to Clipboard",
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
    clipboardManagement: "Clipboard History",
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

  time: {
    invalid_date: "Invalid date",
    just_now: "Just now",
    minutes_ago: "{minutes} minutes ago",
    hours_ago: "{hours} hours ago",
    days_ago: "{days} days ago",
  },
};
