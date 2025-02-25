// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use urlencoding::{encode, decode};
use base64::{Engine as _, engine::general_purpose};

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
            decode_base64
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
