/**
 * Prompt templates for different code analysis scenarios
 */

const PROMPTS = {
  BUG_DETECTION: `You are an expert code reviewer. Analyze the provided code for bugs, errors, and logical issues.

Focus on:
- Null/undefined pointer exceptions
- Off-by-one errors
- Infinite loops
- Incorrect variable usage
- Missing null checks
- Type mismatches

Return a JSON array of issues found.`,

  SECURITY_AUDIT: `You are a security expert. Audit the provided code for security vulnerabilities.

Focus on:
- SQL Injection vulnerabilities
- XSS (Cross-Site Scripting) issues
- Authentication/Authorization problems
- Data exposure and leaks
- Insecure cryptography
- Input validation issues
- CSRF vulnerabilities

Return a JSON array of security issues with severity levels.`,

  PERFORMANCE_ANALYSIS: `You are a performance optimization expert. Analyze the code for performance issues.

Focus on:
- Inefficient algorithms (time complexity)
- Memory leaks and improper resource management
- N+1 query problems
- Unnecessary loops or iterations
- Inefficient data structures
- Missing caching opportunities
- Blocking operations

Return a JSON array of performance issues with optimization suggestions.`,

  CODE_QUALITY: `You are a code quality expert. Review the code for maintainability and quality.

Focus on:
- Code readability and clarity
- Naming conventions
- Code organization and structure
- Duplicated code (DRY principle)
- SOLID principles violations
- Function/method complexity
- Documentation completeness

Return a JSON object with quality score (0-100) and identified issues.`,

  COMPREHENSIVE_REVIEW: `You are a senior software engineer conducting a comprehensive code review.

Analyze the code for:
1. Bugs and logical errors
2. Security vulnerabilities
3. Performance issues
4. Code quality and maintainability
5. Testing considerations
6. Documentation completeness

Return a comprehensive JSON report with all findings, severity levels, and suggestions.`
}

/**
 * Generate a code analysis prompt
 * @param {String} code - The code to analyze
 * @param {String} analysisType - Type of analysis to perform
 * @param {String} language - Programming language
 * @returns {String} Formatted prompt
 */
export function generateCodeAnalysisPrompt(code, analysisType = 'comprehensive', language = 'javascript') {
  const basePrompt = PROMPTS[analysisType.toUpperCase().replace(/-/g, '_')] || PROMPTS.COMPREHENSIVE_REVIEW

  return `
${basePrompt}

Code Language: ${language}

Code to Review:
\`\`\`${language}
${code}
\`\`\`

Respond ONLY with valid JSON. Do not include any markdown formatting or code blocks.
`
}

/**
 * Generate prompt for test generation
 * @param {String} code - Code to generate tests for
 * @param {String} language - Programming language
 * @returns {String} Formatted prompt
 */
export function generateTestPrompt(code, language = 'javascript') {
  return `Generate comprehensive test cases for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include:
- Unit tests for each function
- Edge cases and boundary conditions
- Error scenarios
- Integration test examples

Use appropriate testing frameworks:
- JavaScript: Jest or Mocha
- Python: pytest
- Java: JUnit
- Go: testing package

Respond with complete, runnable test code.`
}

/**
 * Generate prompt for code documentation
 * @param {String} code - Code to document
 * @param {String} language - Programming language
 * @returns {String} Formatted prompt
 */
export function generateDocumentationPrompt(code, language = 'javascript') {
  return `Generate comprehensive documentation for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include:
- Function/class descriptions
- Parameter documentation with types
- Return value documentation
- Usage examples
- Exception/error documentation
- Performance notes

Use standard documentation format for ${language}:
- JavaScript: JSDoc
- Python: Docstring (Google style)
- Java: JavaDoc
- Go: Go comment conventions`
}

/**
 * Generate prompt for code refactoring
 * @param {String} code - Code to refactor
 * @param {String} language - Programming language
 * @param {String} goal - Refactoring goal
 * @returns {String} Formatted prompt
 */
export function generateRefactorPrompt(code, language = 'javascript', goal = 'maintainability') {
  const goals = {
    readability: 'improve readability and clarity while maintaining functionality',
    performance: 'optimize for better runtime performance and efficiency',
    maintainability: 'improve maintainability and follow best practices and design patterns',
    testing: 'make the code more testable by improving structure and dependencies',
    simplicity: 'simplify the code and reduce complexity'
  }

  const goalDescription = goals[goal] || goals.maintainability

  return `Refactor the following ${language} code to ${goalDescription}:

\`\`\`${language}
${code}
\`\`\`

Requirements:
- Preserve all original functionality
- Follow ${language} best practices
- Improve code organization
- Add helpful comments where needed
- Use meaningful variable and function names

Respond with ONLY the refactored code, no explanations.`
}

/**
 * Generate prompt for code explanation
 * @param {String} code - Code to explain
 * @param {String} language - Programming language
 * @returns {String} Formatted prompt
 */
export function generateExplanationPrompt(code, language = 'javascript') {
  return `Explain what this ${language} code does:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. High-level purpose and what the code accomplishes
2. Step-by-step breakdown of how it works
3. Key algorithms or patterns used
4. Performance characteristics and complexity
5. Any potential issues or edge cases

Keep the explanation clear and concise for a developer.`
}

module.exports = {
  PROMPTS,
  generateCodeAnalysisPrompt,
  generateTestPrompt,
  generateDocumentationPrompt,
  generateRefactorPrompt,
  generateExplanationPrompt
}
