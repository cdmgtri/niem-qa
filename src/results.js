
const Test = require("./test");
const NIEMModelQA = require("./index");

class QAResults {

  /**
   * @param {NIEMModelQA} qa
   */
  constructor(qa) {
    this.qa = qa;
  }

  /**
   * Prefixes of namespaces with one or more QA issues.
   */
  get issuePrefixes() {
    /** @type {String[]} */
    let prefixes = this.qa._tests.reduce( (prefixes, test) => [...prefixes, ...test.prefixes], [] );
    return [...(new Set(prefixes))];
  }

  /**
   * @param {String[]} prefixes - Filter issues by prefix
   * @param {Test.SeverityType[]} severities - Filter issues by test severity
   * @returns {Issue[]}
   */
  issues(prefixes, severities) {
    return this
    .testsFailed(prefixes, severities)
    .reduce( (results, test) => [...results, ...test.namespacesIssues(prefixes)], []);
  }

  /**
   * @param {String[]} prefixes
   */
  passed(prefixes) {
    return this.testsFailed(prefixes).length == 0 && this.testsRan.length > 0;
  }

  /**
   * @param {String[]} prefixes
   */
  failed(prefixes) {
    return this.testsFailed(prefixes).length > 0;
  }

  /**
   * Release test results from a JSON file into the QA object
   */
  async reload(filePath, overwrite=true) {

    let fs = require("fs-extra");

    /** @type {{}[]} */
    let json = await fs.readJSON(filePath);

    if (overwrite) this.qa._tests = [];

    for (let testInfo of json) {
      let test = Object.assign(new Test(), testInfo);
      this.qa._tests.push(test)
    }

  }

  /**
   * Total test run times in seconds.
   */
  get runTime() {
    return this.qa._tests.reduce( (totalTime, test) => {
      let newTime = test.timeElapsedSeconds;
      return newTime ? totalTime + newTime : totalTime;
    }, 0);
  }

  /**
   * Saves test results to a JSON file
   */
  async save(filePath) {
    let fs = require("fs-extra");
    await fs.outputJSON(filePath, this.qa._tests, {spaces: 2});
  }

  /**
   * @param {String[]} prefixes
   */
  status(prefixes) {
    if (this.passed(prefixes)) return "pass";
    if (this.failed(prefixes)) return "fail";
    return "not ran";
  }

  /**
   * All tests that have been run.
   */
  get testsRan() {
    return this.qa._tests.filter( test => test.ran );
  }

  /**
   * All tests that have not been run.
   * This could be because test metadata exists in the test spreadsheet but a corresponding test
   * has not yet been implemented.
   */
  get testsNotRan() {
    return this.qa._tests.filter( test => ! test.ran );
  }

  /**
   * Tests that have passed, with results optionally filtered by the given namespace prefixes.
   * @param {String[]} prefixes
   */
  testsPassed(prefixes) {
    return this.testsRan.filter( test => test.namespacesPassed(prefixes) );
  }

  /**
   * Tests that have failed, with results optionally filtered by the given namespace prefixes.
   * @param {String[]} prefixes - Optional filter on issue prefix
   * @param {Test.SeverityType[]} severities - Optional filter on test severity
   */
  testsFailed(prefixes, severities) {
    let failedTests = this.testsRan.filter( test => test.namespacesFailed(prefixes) );

    if (severities) {
      return failedTests.filter( test => severities.includes(test.severity) );
    }

    return failedTests;
  }

  /**
   * @param {String[]} prefixes
   */
  testsFailedErrors(prefixes) {
    return this.testsFailed(prefixes, ["error"]);
  }

  /**
   * @param {String[]} prefixes
   */
  testsFailedWarnings(prefixes) {
    return this.testsFailed(prefixes, ["warning"]);
  }

  /**
   * @param {String[]} prefixes
   */
  testsFailedInfo(prefixes) {
    return this.testsFailed(prefixes, ["info"]);
  }

}

module.exports = QAResults;
