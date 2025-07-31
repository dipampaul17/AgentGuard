# 📋 Changelog

All notable changes to AgentGuard will be documented in this file.

## [1.2.0] - 2025-01-27

### 🚀 Major Features
- **Real-time price fetching** - No more stale hard-coded prices
- **Comprehensive HTTP interception** - Support for `undici`, `got`, and raw `http/https` modules
- **Enhanced soft failure modes** - Graceful `throw` mode with detailed error data
- **Privacy-aware logging** - Optional data redaction for sensitive content
- **Multi-process Redis support** - Shared budget tracking across instances

### 🔧 Technical Improvements
- **Improved token counting** - Better handling of streaming, Anthropic, and multimodal responses
- **Dynamic pricing updates** - Fetches live pricing from community sources with fallback
- **Enhanced error handling** - Better recovery and fallback mechanisms
- **Production-ready defaults** - Safe `throw` mode as default instead of `kill`

### 📚 Documentation
- **Comprehensive comparison table** - Clear differentiation from existing tools
- **Real-world examples** - Production deployment scenarios
- **Security guide** - Privacy and reliability best practices
- **API reference updates** - New methods and configuration options

### 🛠 Developer Experience
- **Browser distribution** - Minified builds for web applications
- **TypeScript improvements** - Updated type definitions
- **Better test coverage** - Comprehensive edge case testing
- **CI/CD pipeline** - Automated testing and building

### 🔒 Security & Reliability
- **Privacy mode** - Redact sensitive API response data
- **Graceful degradation** - Continue functioning even when external services fail
- **Memory leak prevention** - Better resource management
- **Edge case handling** - Robust error recovery

## [1.1.2] - 2025-01-26

### 🔧 Improvements
- Enhanced cost calculation accuracy
- Better error handling for malformed responses
- Improved console interception

### 🐛 Bug Fixes
- Fixed token counting for edge cases
- Improved model detection logic

## [1.1.0] - 2025-01-25

### 🚀 Features
- Initial release with basic cost monitoring
- OpenAI and Anthropic support
- Console log interception
- Basic webhook notifications

---

## 🔗 Links

- [📦 NPM Package](https://npmjs.com/package/agent-guard)
- [🐛 Report Issues](https://github.com/dipampaul17/AgentGuard/issues)
- [💬 Discussions](https://github.com/dipampaul17/AgentGuard/discussions)
- [📖 Documentation](https://github.com/dipampaul17/AgentGuard#readme)