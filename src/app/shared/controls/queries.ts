///<reference path="./interfaces.ts" />

module gogeo {

  export class NeSwPoint {
    constructor(public ne:L.LatLng, public sw:L.LatLng) {

    }
  }

  export class BoolQuery implements Query {
    private requestData: any = {
      must: []
    };

    constructor() {}

    addMustQuery(q: Query) {
      this.requestData["must"].push(q.build()["query"]);
    }

    build() {
      return {
        query: {
          bool: this.requestData
        }
      }
    }
  }

  export class MatchPhraseQuery implements Query {
    query: any = {};

    constructor(field: string, term: string) {
      this.query[field] = term;
    }

    build() {
      return {
        query: {
          match_phrase: this.query
        }
      };
    }
  }

  export class SourceTermQuery implements Query {

    constructor(public term: string) {}

    build() {
      return {
        query: {
          term: {
            source: this.term
          }
        }
      }
    }
  }
}