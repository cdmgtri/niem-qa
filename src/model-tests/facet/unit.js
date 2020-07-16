
let { Release, Facet } = require("niem-model");
let NIEMObjectUnitTests = require("../niem-object/unit");
let Test = require("../../test");

/**
 * Facet unit tests
 */
class FacetUnitTests extends NIEMObjectUnitTests {

  /**
   * TODO Move facet test for expected special characters to release-specific QA
   *
   * Check sample known facets with special characters in definitions to confirm
   * the correct character encoding has been used.
   *
   * @example "Code facet 'CIV' in genc:CountryAlpha3CodeSimpleType should have correctly-encoded definition 'CÔTE D’IVOIRE'."
   * @example "Code facet 'CIV' in genc:CountryAlpha3CodeSimpleType should not have incorrectly-encoded definition 'CÃ”TE Dâ€™IVOIRE'."
   *
   * @param {Facet[]} facets
   */
  // async definition_formatting_specialChars(facets) {

  //   let test = this.qa.tests.start("facet_definition_formatting_specialChars");

  //   /** @type {Facet[]} */
  //   let problemFacets = [];

  //   /** @type {{typeQName: string, value: string, expectedDefinition: string}[]} */
  //   let samples = [
  //     {typeQName: "can:CanadianProvinceCodeSimpleType", value: "QC", expectedDefinition: "Québec" },

  //     {typeQName: "genc:CountryAlpha2CodeSimpleType", value: "CI", expectedDefinition: "CÔTE D’IVOIRE" },
  //     {typeQName: "genc:CountryAlpha3CodeSimpleType", value: "CIV", expectedDefinition: "CÔTE D’IVOIRE" },
  //     {typeQName: "genc:CountryNumericCodeSimpleType", value: "384", expectedDefinition: "CÔTE D’IVOIRE" },
  //     {typeQName: "genc:CountrySubdivisionCodeSimpleType", value: "AD-06", expectedDefinition: "Sant Julià de Lòria" },

  //     {typeQName: "iso_3166:CountryAlpha2CodeSimpleType", value: "CI", expectedDefinition: "Côte d'Ivoire" },
  //     {typeQName: "iso_3166:CountryAlpha3CodeSimpleType", value: "CIV", expectedDefinition: "Côte d'Ivoire" },
  //     {typeQName: "iso_3166:CountryNumericCodeSimpleType", value: "384", expectedDefinition: "Côte d'Ivoire" },
  //     {typeQName: "iso_3166:CountrySubdivisionCodeSimpleType", value: "AD-06", expectedDefinition: "Sant Julià de Lòria" },

  //     {typeQName: "iso_639-3:LanguageCodeSimpleType", value: "aae", expectedDefinition: "Arbëreshë Albanian" },
  //   ];

  //   for (let sample of samples) {
  //     let problemFacet = checkExpectedFacetDefinition(facets, sample.typeQName, sample.value, sample.expectedDefinition);
  //     if (problemFacet) problemFacets.push(problemFacet);
  //   }

  //   return this.qa.testMetadata.post(test, problemFacets, "definition");
  // }

  /**
   * Check that code facets have definitions.
   *
   * @example "Code facet 'MON' should have a definition (e.g., 'Monday')."
   * @example "Length facet '10' is not required to have a definition."
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async definition_missing_code(facets) {

    let test = this.qa.tests.start("facet_definition_missing_code");

    let problemFacets = facets.filter( facet => {
      return facet.style == "enumeration" && ! facet.definition
    });

    return this.qa.tests.post(test, problemFacets, "definition");
  }

  /**
   * Check that code facets have definitions.
   *
   * @example "Pattern facets should have definitions"
   * @example "Length facet '10' is not required to have a definition."
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async definition_missing_pattern(facets) {

    let test = this.qa.tests.start("facet_definition_missing_pattern");

    let problemFacets = facets.filter( facet => {
      return facet.style == "pattern" && ! facet.definition
    });

    return this.qa.tests.post(test, problemFacets, "definition");
  }

  /**
   * Check that facet kinds match the list from XML schema.
   *
   * @example "Facet 'MON' can have kind 'enumeration'."
   * @example "Facet 'MON' cannot have kind 'code' or 'ENUM'."
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async style_invalid(facets) {

    let test = this.qa.tests.start("facet_kind_invalid");

    let problemFacets = facets.filter( facet => {
      return ! facet.style || ! Facet.Styles.includes(facet.style)
    });

    return this.qa.tests.post(test, problemFacets, "style");
  }

  /**
   * Check for facets on complex types.
   *
   * @example "Code 'MON' can belong to simple type 'WeekdayCodeSimpleType'."
   * @example "Code 'MON' cannot belong to complex object type 'nc:PersonType'."
   *
   * @param {Facet[]} facets
   * @param {Release} release
   * @returns {Promise<Test>}
   */
  async type_complex(facets, release) {

    let test = this.qa.tests.start("facet_type_complex");

    let uniqueTypeQNames = new Set( facets.map( facet => facet.typeQName) );

    /** @type {String[]} */
    let complexTypeQNames = [];

    /** @type {Facet[]} */
    let problemFacets = [];

    // Look up each type once to see if it is complex
    for (let qname of uniqueTypeQNames) {
      let type = await release.types.get(qname);
      if (type && type.isComplexType) complexTypeQNames.push(qname);
    }

    for (let qname of complexTypeQNames) {
      let matches = facets.filter( facet => facet.typeQName == qname );
      problemFacets.push(...matches);
    }

    return this.qa.tests.post(test, problemFacets, "typeQName");
  }

  /**
   * Check that code facets belong to a type with a name that ends with "CodeSimpleType".
   *
   * @example "Code 'MON' can belong to a type named 'WeekdayCodeSimpleType'."
   * @example "Code 'MON' cannot belong to a type named 'WeekdaySimpleType'."
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async type_repTerm_code(facets) {

    let test = this.qa.tests.start("facet_type_repTerm_code");

    let problemFacets = facets
    .filter( facet => facet.typeName && facet.style == "enumeration" )
    .filter( facet => ! facet.typeName.endsWith("CodeSimpleType") );

    return this.qa.tests.post(test, problemFacets, "typeQName");
  }

  /**
   * Check for missing or unknown types.
   *
   * @param {Facet[]} facets
   * @param {Release} release
   * @returns {Promise<Test>}
   */
  async type_unknown(facets, release) {
    let test = this.qa.tests.start("facet_type_unknown");
    return this.utils.type_unknown__helper(test, facets, release);
  }

  /**
   * Check for duplicate code facets within a type.
   *
   * @example "Type 'WeekdayCodeSimpleType' with codes 'MON', 'TUE', 'WED', ..."
   * @example "Type 'WeekdayCodeSimpleType' with codes 'MON', 'MON', 'MON', ..."
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async value_duplicate_code(facets) {

    let test = this.qa.tests.start("facet_value_duplicate_code");

    // Check for types that have duplicate facets
    let labelCounts = {};

    facets
    .filter( facet => !test.exceptionLabels.includes(facet.typeQName) )
    .filter( facet => facet.style == "enumeration" )
    .forEach( facet => {
      let label = facet.label;
      labelCounts[label] = label in labelCounts ? labelCounts[label] + 1 : 1;
    });

    let problemFacets = facets
    .filter( facet => !test.exceptionLabels.includes(facet.typeQName) )
    .filter( facet => facet.style == "enumeration" )
    .filter( facet => labelCounts[facet.label] > 1 );

    return this.qa.tests.post(test, problemFacets, "value");

  }

  /**
   * Check for missing facet values.
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async value_formatting(facets) {
    let test = this.qa.tests.start("facet_value_formatting");
    return this.utils.text_formatting_helper(test, facets, "value");
  }

  /**
   * Check for missing facet values.
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async value_missing(facets) {
    let test = this.qa.tests.start("facet_value_missing");
    let problemFacets = facets.filter( facet => ! facet.value );
    return this.qa.tests.post(test, problemFacets, "value");
  }

}

/**
 * Check that the given facet has the expected definition.  Returns undefined if correct;
 * returns the problem facet if the actual definition does not match the expected definition.
 *
 * @param {Facet[]} facets
 * @param {string} typeQName
 * @param {string} value
 * @param {string} expectedDefinition
 * @returns
 */
function checkExpectedFacetDefinition(facets, typeQName, value, expectedDefinition) {

  let facet = facets.find( facet => facet.typeQName == typeQName && facet.value == value);

  // Make sure test cases are still valid
  if (!facet) throw new Error(`Expected facet not found: ${typeQName} - enum ${value}`);

  if (facet.definition != expectedDefinition) {
    return facet;
  }
}

module.exports = FacetUnitTests;