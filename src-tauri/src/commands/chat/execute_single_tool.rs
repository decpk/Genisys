use crate::commands::chat::tools;
use crate::commands::chat::crawl_webpage::crawl_url;
use crate::commands::chat::search_images::search_images_wikimedia;
use serde_json::Value;

#[tauri::command]
pub async fn cmd_execute_single_tool(
    tool_name: String,
    args: Value,
    repo_path: Option<String>,
) -> Result<String, String> {
    match tool_name.as_str() {
        "crawl_webpage" => {
            let url = args["url"].as_str().unwrap_or("").to_string();
            match tokio::task::spawn_blocking(move || crawl_url(&url)).await {
                Ok(Ok(val)) => {
                    let title = val["title"].as_str().unwrap_or("");
                    let content = val["content"].as_str().unwrap_or("");
                    Ok(format!("# {}\n\n{}", title, content))
                }
                Ok(Err(e)) => Ok(format!("Error crawling webpage: {e}")),
                Err(e) => Ok(format!("Error crawling webpage: {e}")),
            }
        }
        "search_images" => {
            let query = args["query"].as_str().unwrap_or("").to_string();
            let count = args
                .get("count")
                .and_then(|v| v.as_u64())
                .unwrap_or(5)
                .min(10) as u32;
            match tokio::task::spawn_blocking(move || search_images_wikimedia(&query, count)).await
            {
                Ok(Ok(val)) => Ok(serde_json::to_string_pretty(&val)
                    .unwrap_or_else(|_| val.to_string())),
                Ok(Err(e)) => Ok(format!("Error searching images: {e}")),
                Err(e) => Ok(format!("Error searching images: {e}")),
            }
        }
        _ => {
            let repo = repo_path.as_deref().unwrap_or("");
            let result = tools::execute_tool(&tool_name, &args, repo);
            Ok(result)
        }
    }
}
