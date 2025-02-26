use image::{ImageBuffer, Rgba, RgbaImage, GenericImageView};
use imageproc::drawing;
use std::io::Cursor;

// 移除这里的 #[tauri::command] 宏
pub fn convert_image(
    image_data: Vec<u8>,
    format: String,
    width: u32,
    height: u32,
) -> Result<Vec<u8>, String> {
    // 从字节数组加载图像
    let img = match image::load_from_memory(&image_data) {
        Ok(img) => img,
        Err(e) => return Err(format!("无法加载图像: {}", e)),
    };

    // 调整图像尺寸
    let resized = img.resize_exact(width, height, image::imageops::FilterType::Lanczos3);
    
    // 根据格式选择正确的编码器并输出图像
    match format.as_str() {
        "svg" => {
            return convert_to_svg(&resized, width, height);
        }
        "ico" => {
            return convert_to_ico(&resized);
        }
        "png" => {
            return convert_to_png(&resized);
        }
        "jpeg" | "jpg" => {
            // 将图像编码为JPEG格式 - 使用与PNG/ICO相同的模式
            return convert_to_jpeg(&resized);
        }
        _ => return Err(format!("不支持的格式: {}", format)),
    }
}

// 转换为PNG格式
fn convert_to_png(img: &image::DynamicImage) -> Result<Vec<u8>, String> {
    let mut buffer = Vec::new();
    let mut cursor = Cursor::new(&mut buffer);
    if let Err(e) = img.write_to(&mut cursor, image::ImageOutputFormat::Png) {
        return Err(format!("PNG转换失败: {}", e));
    }
    Ok(buffer)
}

// 转换为ICO格式
fn convert_to_ico(img: &image::DynamicImage) -> Result<Vec<u8>, String> {
    let mut buffer = Vec::new();
    let mut cursor = Cursor::new(&mut buffer);
    
    // 使用image库写入ICO格式
    if let Err(e) = img.write_to(&mut cursor, image::ImageOutputFormat::Ico) {
        return Err(format!("ICO转换失败: {}", e));
    }
    Ok(buffer)
}

// 添加一个新函数来处理JPEG格式转换
fn convert_to_jpeg(img: &image::DynamicImage) -> Result<Vec<u8>, String> {
    let mut buffer = Vec::new();
    let mut cursor = Cursor::new(&mut buffer);
    if let Err(e) = img.write_to(&mut cursor, image::ImageOutputFormat::Jpeg(90)) {
        return Err(format!("JPEG转换失败: {}", e));
    }
    Ok(buffer)
}

// 转换为SVG格式
fn convert_to_svg(img: &image::DynamicImage, width: u32, height: u32) -> Result<Vec<u8>, String> {
    // 获取像素数据
    let rgba_image = img.to_rgba8();
    let mut svg = String::new();
    
    // 创建SVG头部
    svg.push_str(&format!(
        r#"<svg width="{}" height="{}" viewBox="0 0 {} {}" xmlns="http://www.w3.org/2000/svg">"#,
        width, height, width, height
    ));
    
    // 简单方法: 每个像素为一个矩形
    for y in 0..height {
        for x in 0..width {
            let pixel = rgba_image.get_pixel(x, y);
            let [r, g, b, a] = pixel.0;
            
            // 跳过完全透明的像素
            if a == 0 {
                continue;
            }
            
            // 创建一个带颜色和透明度的矩形
            svg.push_str(&format!(
                r#"<rect x="{}" y="{}" width="1" height="1" fill="rgba({},{},{},{})" />"#,
                x, y, r, g, b, a as f32 / 255.0
            ));
        }
    }
    
    // 关闭SVG标签
    svg.push_str("</svg>");
    
    // 返回 UTF-8 编码的字节
    Ok(svg.into_bytes())
}
