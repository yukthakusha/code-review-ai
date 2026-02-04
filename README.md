# 🤖 Code Review AI

> **AI-Powered Code Analysis Platform** - Automated code review with GitHub integration, multi-AI analysis, and real-time issue detection.

[![GitHub](https://img.shields.io/badge/⭐_Star_on_GitHub-black?style=for-the-badge&logo=github)](https://github.com/your-username/code-review-ai)

## 🌟 What is Code Review AI?

Code Review AI is a **free, open-source platform** that automatically analyzes your GitHub repositories for:
- 🐛 **Bugs & Logic Errors**
- 🔒 **Security Vulnerabilities** 
- ⚡ **Performance Issues**
- 📝 **Code Style & Best Practices**

**No registration required** - works in demo mode or connect your GitHub for full features!

---

## ✨ Key Features

### 🔍 **Comprehensive Code Analysis**
- **Multi-AI Integration**: OpenAI GPT, Google Gemini, Hugging Face models
- **Real-time Scanning**: Analyze any public GitHub repository instantly
- **Detailed Solutions**: Not just problems - get actual code fixes
- **Multiple Languages**: JavaScript, Python, Java, C++, and more

### 🔐 **GitHub Integration**
- **OAuth Authentication**: Secure GitHub login
- **Repository Access**: Analyze your private repos
- **User Management**: Track analysis history per user
- **No Data Storage**: Your code stays on GitHub

### 🎯 **Smart Detection**
- **Security Vulnerabilities**: XSS, SQL injection, unsafe practices
- **Performance Bottlenecks**: Loop optimizations, DOM queries
- **Bug Prevention**: Null checks, type coercion, error handling
- **Code Quality**: Modern syntax, best practices, maintainability

### 🌐 **Public Access**
- **Demo Mode**: Try without GitHub account
- **Free Forever**: No subscription or limits
- **Multi-user**: Teams can use simultaneously
- **History Tracking**: View past analysis results

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Lucide Icons** for UI
- **Axios** for API calls
- **React Router** for navigation
- **CSS3** with modern styling

### **Backend** 
- **Node.js** with Express
- **SQLite** database
- **GitHub OAuth** integration
- **Multiple AI APIs** (OpenAI, Gemini, HuggingFace)
- **CORS** enabled for cross-origin requests

### **AI Integration**
- **OpenAI GPT-4** - Primary analysis engine
- **Google Gemini** - Secondary analysis
- **Hugging Face** - Fallback models
- **Custom Static Analysis** - Rule-based detection

---

## 📊 Analysis Capabilities

### 🔒 **Security Issues**
```javascript
// Detects and fixes:
eval(userInput) // ❌ Critical security risk
element.innerHTML = userInput // ❌ XSS vulnerability
document.write(content) // ❌ Injection risk

// Suggests:
JSON.parse(userInput) // ✅ Safe parsing
element.textContent = userInput // ✅ XSS prevention
element.appendChild(newElement) // ✅ Safe DOM manipulation
```

### 🐛 **Bug Detection**
```javascript
// Finds issues like:
if (value == "0") // ❌ Type coercion bug
parseInt(input) // ❌ Missing radix
user.profile.name // ❌ Null pointer risk

// Provides solutions:
if (value === "0") // ✅ Strict equality
parseInt(input, 10) // ✅ Explicit radix
user?.profile?.name // ✅ Optional chaining
```

### ⚡ **Performance Optimization**
```javascript
// Identifies bottlenecks:
for (let i = 0; i < array.length; i++) // ❌ Repeated length access
document.getElementById('id') // ❌ DOM query in loop

// Optimizes to:
const len = array.length; // ✅ Cached length
const element = document.getElementById('id'); // ✅ Cached element
```

---

## 🏃‍♂️ Quick Start

### **Option 1: Use Live Version**
Just visit [the live app](https://your-app-url.vercel.app) - no setup needed!

### **Option 2: Run Locally**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/code-review-ai.git
   cd code-review-ai
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Add your GitHub OAuth credentials to .env
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Visit** `http://localhost:3000`

### **GitHub OAuth Setup**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App:
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Callback URL**: `http://localhost:3000/auth/callback`
3. Copy Client ID and Secret to `.env` file

---

## 🔧 Configuration

### **Environment Variables**

**Backend (.env)**
```bash
# Required
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Optional (for enhanced AI analysis)
OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_huggingface_key

# Server
PORT=5000
NODE_ENV=development
```

**Frontend (.env)**
```bash
# Production API URL
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```



## 📈 Usage Analytics

### **What Gets Analyzed**
- ✅ **Code Quality**: Syntax, best practices, maintainability
- ✅ **Security**: Vulnerabilities, unsafe patterns, injection risks
- ✅ **Performance**: Bottlenecks, optimization opportunities
- ✅ **Bugs**: Logic errors, type issues, null references
- ✅ **Style**: Modern syntax, code consistency

### **Supported Languages**
- JavaScript/TypeScript
- Python
- Java
- C/C++
- PHP
- Ruby
- Go
- And more...

### **Analysis Metrics**
- **Files Scanned**: Up to 50 files per repository
- **Issue Detection**: 20+ rule categories
- **Solution Depth**: Code examples and explanations
- **Performance**: ~30 seconds average analysis time

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

### **Ways to Contribute**
- 🐛 **Report Bugs**: Found an issue? Open a GitHub issue
- 💡 **Feature Requests**: Suggest new analysis rules or features
- 🔧 **Code Contributions**: Submit pull requests
- 📚 **Documentation**: Improve README or add tutorials
- 🎨 **UI/UX**: Enhance the user interface

### **Development Setup**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test locally
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open Pull Request

### **Code Style**
- Use TypeScript for new frontend code
- Follow ESLint rules
- Add comments for complex logic
- Write meaningful commit messages

---

## 📄 License

This project is **MIT Licensed** - see [LICENSE](LICENSE) file for details.

**TL;DR**: You can use, modify, and distribute this code freely, even commercially.

---

## 🙏 Acknowledgments

### **Built With**
- [React](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime
- [OpenAI](https://openai.com/) - AI analysis engine
- [GitHub API](https://docs.github.com/en/rest) - Repository integration

### **Inspired By**
- SonarQube - Code quality analysis
- CodeClimate - Automated code review
- ESLint - JavaScript linting
- GitHub CodeQL - Security analysis

---

## 📞 Support & Contact

### **Get Help**
- 📖 **Documentation**: Check this README and [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 **Bug Reports**: [Open an issue](https://github.com/your-username/code-review-ai/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-username/code-review-ai/discussions)
- 📧 **Email**: your-email@example.com

### **Links**
- 📱 **GitHub**: [https://github.com/your-username/code-review-ai](https://github.com/your-username/code-review-ai)
- 📚 **Documentation**: [Wiki](https://github.com/your-username/code-review-ai/wiki)

---

## ⭐ Star History

If this project helped you, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/code-review-ai&type=Date)](https://star-history.com/#your-username/code-review-ai&Date)

---

<div align="center">

**Made with ❤️ for the developer community**

[⭐ Star on GitHub](https://github.com/your-username/code-review-ai)  • [📖 Read Docs](./DEPLOYMENT.md)

</div>
