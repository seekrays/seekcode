// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod mcp_server;
mod models;

use tauri::tray::{MouseButton, MouseButtonState, TrayIconEvent};
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager, WindowEvent,
};
use tauri_plugin_aptabase::EventTracker;

// 只在 macOS 上导入 RunEvent
#[cfg(target_os = "macos")]
use tauri::RunEvent;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[tokio::main]
pub async fn run() {
    let migrations = commands::get_migrations();

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_aptabase::Builder::new("A-SH-1174248246")
                .with_options(tauri_plugin_aptabase::InitOptions {
                    host: Some("https://seekrays.com:9999".to_string()),
                    ..Default::default()
                })
                .build(),
        )
        .setup(|app| {
            // 追踪应用启动事件
            let _ = app.track_event("app_started", None);

            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_autostart::init(
                tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                None, // 不需要额外参数
            ))?;

            // 创建系统托盘菜单
            let show_item = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            // 创建系统托盘
            let _tray = TrayIconBuilder::with_id("tray")
                .icon(tauri::include_image!("icons/menubar/icon.png"))
                .icon_as_template(true)
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        // 追踪应用退出事件
                        let _ = app.track_event("app_exited", None);
                        app.flush_events_blocking();
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } => {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            // 监听窗口事件，关闭时隐藏而不是退出
            if let Some(window) = app.get_webview_window("main") {
                let app_handle = app.app_handle().clone();
                window.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        // 阻止默认关闭行为
                        api.prevent_close();
                        // 隐藏窗口到托盘
                        if let Some(main_window) = app_handle.get_webview_window("main") {
                            let _ = main_window.hide();
                        }
                    }
                });
            }

            Ok(())
        })
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:seekcode.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::get_current_timestamp,
            commands::get_clipboard_content,
            commands::set_clipboard_content,
            commands::show_window,
            commands::hide_window,
            commands::is_window_visible,
            commands::start_mcp_server,
            commands::stop_mcp_server,
            commands::get_mcp_server_status,
            commands::track_event,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    // 只在 macOS 上处理 RunEvent::Reopen
    #[cfg(target_os = "macos")]
    {
        app.run(|app_handle, event| {
            match event {
                RunEvent::Reopen {
                    has_visible_windows: _,
                    ..
                } => {
                    // 当用户点击 dock 图标时触发（macOS）
                    if let Some(window) = app_handle.get_webview_window("main") {
                        if !window.is_visible().unwrap_or(false) {
                            let _ = window.show();
                            let _ = window.set_focus();
                        } else {
                            let _ = window.set_focus();
                        }
                    }
                }
                RunEvent::Exit { .. } => {
                    // 追踪应用退出事件
                    let _ = app_handle.track_event("app_exited", None);
                    app_handle.flush_events_blocking();
                }
                _ => {}
            }
        });
    }

    // 在非 macOS 平台上，直接运行应用
    #[cfg(not(target_os = "macos"))]
    {
        app.run(|app_handle, event| {
            match event {
                tauri::RunEvent::Exit { .. } => {
                    // 追踪应用退出事件
                    let _ = app_handle.track_event("app_exited", None);
                    app_handle.flush_events_blocking();
                }
                _ => {}
            }
        });
    }
}
