from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import openai
import os
from dotenv import load_dotenv
import re
import json

load_dotenv()

app = FastAPI(title="CodeReview AI Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI configuration
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_file_language(file_path: str) -> str:
    """Determine programming language from file extension"""
    ext_map = {
        '.js': 'JavaScript',
        '.jsx': 'JavaScript React',
        '.ts': 'TypeScript',
        '.tsx': 'TypeScript React',
        '.py': 'Python',
        '.java': 'Java',
        '.cpp': 'C++',
        '.c': 'C',
        '.cs': 'C#',
        '.php': 'PHP',
        '.rb': 'Ruby',
        '.go': 'Go',
        '.rs': 'Rust',
        '.kt': 'Kotlin',
        '.swift': 'Swift'
    }
    
    for ext, lang in ext_map.items():
        if file_path.endswith(ext):
            return lang
    return 'Unknown'

def analyze_code_with_ai(file_content: str, file_path: str, language: str):
    """Use OpenAI to analyze code and find issues"""
    
    prompt = f"""
You are an expert code reviewer. Analyze the following {language} code from file '{file_path}' and identify issues.

Focus on:
1. BUGS: Logic errors, null pointer exceptions, undefined variables, type errors
2. SECURITY: SQL injection, XSS vulnerabilities, exposed secrets, insecure practices
3. PERFORMANCE: Inefficient algorithms, memory leaks, unnecessary operations
4. STYLE: Code quality, best practices, maintainability issues

For each issue found, provide:
- Type (bug/security/performance/style)
- Severity (low/medium/high/critical)
- Line number (estimate based on code structure)
- Clear description of the issue
- Specific suggestion to fix it

Code to analyze:
```{language.lower()}
{file_content}
```

Return your analysis in this exact JSON format:
[
  {{
    "type": "bug|security|performance|style",
    "severity": "low|medium|high|critical",
    "line": number,
    "message": "Clear description of the issue",
    "suggestion": "Specific fix suggestion"
  }}
]

If no issues found, return an empty array: []
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert code reviewer. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content.strip()
        
        # Extract JSON from response
        json_match = re.search(r'\[.*\]', content, re.DOTALL)
        if json_match:
            issues_data = json.loads(json_match.group())
            return issues_data
        else:
            return []
            
    except Exception as e:
        print(f"Error analyzing code: {e}")
        return []

@app.get("/health")
async def health_check():
    return {"status": "OK", "service": "AI Code Analysis"}

@app.post("/analyze")
async def analyze_code(request: dict):
    """Analyze code files and return issues"""
    
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    try:
        files = request.get("files", [])
        repository_name = request.get("repository_name", "")
        
        results = []
        total_issues = 0
        severity_counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        type_counts = {"bug": 0, "security": 0, "performance": 0, "style": 0}
        
        for file in files:
            file_path = file.get("path", "")
            file_content = file.get("content", "")
            
            # Skip very large files (>10KB for now)
            if len(file_content) > 10000:
                continue
                
            # Skip binary or non-code files
            if any(ext in file_path.lower() for ext in ['.png', '.jpg', '.gif', '.pdf', '.zip']):
                continue
            
            language = get_file_language(file_path)
            if language == 'Unknown':
                continue
                
            issues = analyze_code_with_ai(file_content, file_path, language)
            
            if issues:
                results.append({
                    "file": file_path,
                    "issues": issues
                })
                total_issues += len(issues)
                
                for issue in issues:
                    severity = issue.get("severity", "low")
                    issue_type = issue.get("type", "style")
                    severity_counts[severity] += 1
                    type_counts[issue_type] += 1
        
        summary = {
            "total_files_analyzed": len([f for f in files if get_file_language(f.get("path", "")) != 'Unknown']),
            "total_issues": total_issues,
            "severity_breakdown": severity_counts,
            "type_breakdown": type_counts
        }
        
        return {
            "success": True,
            "results": results,
            "summary": summary
        }
        
    except Exception as e:
        print(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)