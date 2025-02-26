// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use urlencoding::{encode, decode};
use base64::{Engine as _, engine::general_purpose};
use std::collections::HashMap;

// 导入图像转换模块
mod image_converter;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn encode_url(text: &str) -> Result<String, String> {
    Ok(encode(text).into_owned())
}

#[tauri::command]
fn decode_url(text: &str) -> Result<String, String> {
    // 修复：将 Cow<str> 转换为 String
    decode(text).map(|cow| cow.into_owned()).map_err(|e| e.to_string())
}

#[tauri::command]
fn encode_unicode(text: &str) -> Result<String, String> {
    let mut result = String::new();
    for c in text.chars() {
        let escaped = format!("\\u{:04X}", c as u32);
        result.push_str(&escaped);
    }
    Ok(result)
}

#[tauri::command]
fn decode_unicode(text: &str) -> Result<String, String> {
    // 简单处理 \uXXXX 格式
    let mut result = String::new();
    let mut chars = text.chars().peekable();
    
    while let Some(c) = chars.next() {
        if c == '\\' && chars.peek() == Some(&'u') {
            chars.next(); // 消费 'u'
            
            let mut hex = String::with_capacity(4);
            for _ in 0..4 {
                if let Some(h) = chars.next() {
                    hex.push(h);
                } else {
                    return Err("不完整的Unicode转义序列".to_string());
                }
            }
            
            match u32::from_str_radix(&hex, 16) {
                Ok(code) => {
                    if let Some(unicode_char) = std::char::from_u32(code) {
                        result.push(unicode_char);
                    } else {
                        return Err(format!("无效的Unicode码点: U+{}", hex));
                    }
                },
                Err(_) => return Err(format!("无效的16进制数: {}", hex))
            }
        } else {
            result.push(c);
        }
    }
    
    Ok(result)
}

#[tauri::command]
fn encode_base64(text: &str) -> Result<String, String> {
    Ok(general_purpose::STANDARD.encode(text.as_bytes()))
}

#[tauri::command]
fn decode_base64(text: &str) -> Result<String, String> {
    let bytes = general_purpose::STANDARD
        .decode(text)
        .map_err(|e| e.to_string())?;
    
    String::from_utf8(bytes).map_err(|e| e.to_string())
}

// 添加HTML编解码功能
#[tauri::command]
fn encode_html(text: &str) -> Result<String, String> {
    let mut result = String::with_capacity(text.len() * 2);
    
    for c in text.chars() {
        match c {
            '&' => result.push_str("&amp;"),
            '<' => result.push_str("&lt;"),
            '>' => result.push_str("&gt;"),
            '"' => result.push_str("&quot;"),
            '\'' => result.push_str("&#39;"),
            ' ' => result.push_str("&nbsp;"),
            _ => result.push(c)
        }
    }
    
    Ok(result)
}

#[tauri::command]
fn decode_html(text: &str) -> Result<String, String> {
    let mut result = String::new();
    let mut i = 0;
    let chars: Vec<char> = text.chars().collect();
    
    while i < chars.len() {
        if chars[i] == '&' {
            // 可能是HTML实体
            let mut entity_end = i + 1;
            while entity_end < chars.len() && chars[entity_end] != ';' {
                entity_end += 1;
            }
            
            if entity_end < chars.len() && chars[entity_end] == ';' {
                // 找到了一个可能的HTML实体
                let entity: String = chars[i+1..entity_end].iter().collect();
                
                match entity.as_str() {
                    "amp" => result.push('&'),
                    "lt" => result.push('<'),
                    "gt" => result.push('>'),
                    "quot" => result.push('"'),
                    "apos" => result.push('\''),
                    "nbsp" => result.push(' '),
                    _ if entity.starts_with("#") => {
                        // 数字实体
                        let code = if entity.starts_with("#x") || entity.starts_with("#X") {
                            // 十六进制
                            u32::from_str_radix(&entity[2..], 16).ok()
                        } else if entity.starts_with("#") {
                            // 十进制
                            entity[1..].parse::<u32>().ok()
                        } else {
                            None
                        };
                        
                        if let Some(code) = code {
                            if let Some(c) = std::char::from_u32(code) {
                                result.push(c);
                            } else {
                                // 无效的Unicode码点，保留原样
                                result.push('&');
                                result.push_str(&entity);
                                result.push(';');
                            }
                        } else {
                            // 解析失败，保留原样
                            result.push('&');
                            result.push_str(&entity);
                            result.push(';');
                        }
                    },
                    _ => {
                        // 未知实体，保留原样
                        result.push('&');
                        result.push_str(&entity);
                        result.push(';');
                    }
                }
                
                i = entity_end + 1;
                continue;
            }
        }
        
        // 不是HTML实体，或者格式不正确
        result.push(chars[i]);
        i += 1;
    }
    
    Ok(result)
}

#[tauri::command]
fn convert_image(image_data: Vec<u8>, format: String, width: u32, height: u32) -> Result<Vec<u8>, String> {
    // 无需&，直接传递所有权，与image_converter.rs中的函数签名匹配
    image_converter::convert_image(image_data, format, width, height)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 移除 store 插件的引用
        // .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            encode_url,
            decode_url,
            encode_unicode,
            decode_unicode,
            encode_base64,
            decode_base64,
            encode_html,
            decode_html,
            convert_image  // 添加新命令
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
