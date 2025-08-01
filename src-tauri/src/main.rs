// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[cfg(desktop)]
use tauri_plugin_updater::UpdaterExt;

fn main() {
    seekcode_lib::run()
}
