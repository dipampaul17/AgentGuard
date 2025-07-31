# Contributing to AgentGuard 🛡️

Thank you for your interest in contributing to AgentGuard! We welcome contributions that help make AI development safer and more cost-effective.

## 🚀 Quick Start

```bash
git clone https://github.com/dipampaul17/AgentGuard.git
cd AgentGuard
npm install
```

## 🧪 Testing

Run the examples to test functionality:

```bash
# Test the core kill switch
node examples/runaway-loop-demo.js

# Test real customer scenarios  
node examples/real-customer-demo.js

# Test browser functionality
open examples/test-browser.html
```

## 🛠️ Development Guidelines

### Code Style
- Use clear, descriptive variable names
- Add comments for complex logic
- Follow existing patterns in the codebase
- Keep functions focused and small

### Testing New Features
- Test with multiple AI providers (OpenAI, Anthropic)
- Verify cost calculations are accurate
- Test kill switch behavior at various limits
- Check both Node.js and browser environments

### Adding API Support
When adding support for new AI APIs:

1. Add URL detection patterns
2. Implement token extraction logic
3. Add pricing information
4. Update documentation
5. Add test examples

## 📝 Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Test** your changes thoroughly
4. **Commit** with clear messages
5. **Push** to your branch
6. **Open** a Pull Request

### PR Guidelines
- Describe what your change does and why
- Include test examples if adding features
- Update documentation for user-facing changes
- Keep PRs focused on a single feature/fix

## 🐛 Bug Reports

Found a bug? Please create an issue with:

- **Description** of the problem
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Environment details** (Node.js version, OS, etc.)
- **Code example** if possible

## 💡 Feature Requests

We love new ideas! For feature requests:

- **Describe the use case** you're trying to solve
- **Explain why** this would be valuable
- **Provide examples** of how it would work
- **Consider backwards compatibility**

## 🚨 Security Issues

For security vulnerabilities, please email directly instead of creating public issues. We take security seriously and will respond promptly.

## 📋 Development Priorities

Current areas where contributions are especially welcome:

### High Priority
- [ ] Additional AI provider support (Google, Azure OpenAI)
- [ ] Enhanced browser compatibility
- [ ] Performance optimizations
- [ ] Better error handling

### Medium Priority  
- [ ] Cost prediction algorithms
- [ ] Usage analytics dashboard
- [ ] Webhook notification templates
- [ ] Docker integration examples

### Low Priority
- [ ] GUI configuration tool
- [ ] Cost reporting exports
- [ ] Integration with CI/CD pipelines
- [ ] Mobile app monitoring

## 🎯 Coding Standards

### Core Principles
- **Zero dependencies** - Keep the package lightweight
- **Backwards compatibility** - Don't break existing integrations
- **Performance first** - Minimal overhead on user code
- **Fail safely** - Never break user applications

### File Organization
```
AgentGuard/
├── agent-guard.js      # Core library
├── examples/           # Demo and usage examples
├── README.md          # Main documentation
├── QUICKSTART.md      # Quick installation guide
└── CONTRIBUTING.md    # This file
```

## 🏆 Recognition

Contributors who make significant improvements will be:
- Listed in the README
- Mentioned in release notes
- Invited to the core team (for ongoing contributors)

## 📞 Questions?

- **General questions**: Create a GitHub Discussion
- **Bug reports**: Create a GitHub Issue
- **Feature ideas**: Create a GitHub Issue with "enhancement" label
- **Security issues**: Email directly

## 🎉 Thank You!

Every contribution helps make AI development safer for everyone. Whether it's code, documentation, bug reports, or feature ideas - we appreciate your help!

---

*Happy coding! 🛡️*