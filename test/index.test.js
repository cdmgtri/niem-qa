
let { NIEM, TypeDefs } = require("niem-model");
let { ReleaseDef } = TypeDefs;

let NIEMModelQA = require("../src/index");
let unitTests = require("./unit/index");

let qa = new NIEMModelQA();
let niem = new NIEM();

/** @type {ReleaseDef} */
let release;

beforeAll( async () => {
  await qa.init(release);
  await qa.tests.loadSpreadsheet("niem-model-qa-tests.xlsx");
  release = await niem.releases.add("user", "model", "1.0");
});

describe("Check test suite", () => {

  test("#load", () => {
    expect(qa.tests.length).toBeGreaterThan(20);
    expect(qa.tests.length).toBeLessThan(500);
    expect(qa.results.status()).toBe("not ran");
  });

  test("#find", () => {
    let test = qa.tests.find("type_name_missing_complex");
    expect(test).toBeDefined();
  });

  test("#test metadata", () => {
    qa.tests.save("niem-model-qa-tests.json")
  });

});

describe("Class tests", () => {
  // Call unit tests for each Model Object class
  unitTests(qa, niem);
});

describe("Release tests", () => {

  /**
   * @TODO Does the first line need to return a new QA type with the results?
   */
  test("#Run", async () => {
    await qa.run(release, false);
    let issues = qa.results.issues();
    expect(issues.length).toBeGreaterThan(100);
    qa.terminal.printStatus();
  });

});

describe("Reload tests", () => {

  test("save and reload tests", async () => {

    let filePath = "test/tests.json";

    // Save tests
    await qa.results.save(filePath);

    // Reset and reload tests
    let newQA = new NIEMModelQA();
    await newQA.results.reload(filePath);

    expect(newQA.tests.length).toBe(qa.tests.length);
    expect(newQA.results.issues().length).toBe(qa.results.issues().length);

  })
});

afterAll( async() => {
  await qa.report.saveAsFile("test/test-results");
});
