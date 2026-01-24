from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import openai
import os
from dotenv import load_dotenv
import re

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
openai.api_key = os.getenv("OPENAI_API_KEY")

class CodeFile(BaseModel):
    path: str
    content: str
    language: str

class AnalysisRequest(BaseModel):
    files: List[CodeFile]
    repository_name: str

class Issue(BaseModel):
    type: str  # bug, security, performance, style
    severity: str  # low, medium, high, critical
    line: int
    message: str
    suggestion: Optional[str] = None

class FileAnalysis(BaseModel):
    file: str
    issues: List[Issue]

class AnalysisResponse(BaseModel):
    success: bool
    results: List[FileAnalysis]
    summary: dict

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

def analyze_code_with_ai(file_content: str, file_path: str, language: str) -> List[Issue]:
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
        response = openai.chat.completions.create(
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
            import json
            issues_data = json.loads(json_match.group())
            
            issues = []
            for issue_data in issues_data:
                issue = Issue(
                    type=issue_data.get('type', 'style'),
                    severity=issue_data.get('severity', 'low'),
                    line=issue_data.get('line', 1),
                    message=issue_data.get('message', 'Issue detected'),
                    suggestion=issue_data.get('suggestion')
                )
                issues.append(issue)
            
            return issues
        else:
            return []
            
    except Exception as e:
        print(f"Error analyzing code: {e}")
        return []

@app.get("/health")
async def health_check():
    return {"status": "OK", "service": "AI Code Analysis"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_code(request: AnalysisRequest):
    """Analyze code files and return issues"""
    
    if not openai.api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    try:
        results = []
        total_issues = 0
        severity_counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        type_counts = {"bug": 0, "security": 0, "performance": 0, "style": 0}
        
        for file in request.files:
            # Skip very large files (>10KB for now)
            if len(file.content) > 10000:
                continue
                
            # Skip binary or non-code files
            if any(ext in file.path.lower() for ext in ['.png', '.jpg', '.gif', '.pdf', '.zip']):
                continue
            
            language = get_file_language(file.path)
            if language == 'Unknown':
                continue
                
            issues = analyze_code_with_ai(file.content, file.path, language)
            
            if issues:
                results.append(FileAnalysis(file=file.path, issues=issues))
                total_issues += len(issues)
                
                for issue in issues:
                    severity_counts[issue.severity] += 1
                    type_counts[issue.type] += 1
        
        summary = {
            "total_files_analyzed": len([f for f in request.files if get_file_language(f.path) != 'Unknown']),
            "total_issues": total_issues,
            "severity_breakdown": severity_counts,
            "type_breakdown": type_counts
        }
        
        return AnalysisResponse(
            success=True,
            results=results,
            summary=summary
        )
        
    except Exception as e:
        print(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)