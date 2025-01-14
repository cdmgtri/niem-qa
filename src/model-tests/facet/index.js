
let NIEMObjectTester = require("../niem-object/index");
let FacetUnitTests = require("./unit");

class FacetTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new FacetUnitTests(qa);

    /**
     * @param {FacetDef[]} facets
     * @param {ReleaseDef} release
     * @returns {Promise<NIEMModelQA>}
     */
    this.run = (facets, release) => this.runTests(facets, release);

    this.field = {

      /**
       * @param {FacetDef[]} facets
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (facets, release) => this.runTests(facets, release, "definition"),

      /**
       * @param {FacetDef[]} facets
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      style: (facets, release) => this.runTests(facets, release, "style"),

      /**
       * @param {FacetDef[]} facets
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      type: (facets, release) => this.runTests(facets, release, "type"),

      /**
       * @param {FacetDef[]} facets
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      value: (facets, release) => this.runTests(facets, release, "value")

    }

  }

}

module.exports = FacetTester;

let NIEMModelQA = require("../../index");
let { ReleaseDef, FacetDef } = require("niem-model").TypeDefs;
