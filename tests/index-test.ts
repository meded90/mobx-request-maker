import { expect } from "chai";
import * as rt from "runtypes";
import {
  IRequestMakerScheme,
  makeQuery,
  validatingParams,
  validatingResponse,
} from "../src";

const params = {
  active: 1,
  name: "ivan",
};

const respons = {
  data: [
    {
      id: 1,
    },
  ],
  total: 100,
  sortBy: 'name',
};

type IParam = typeof params;
type IResponse = typeof respons;

const queryScheme: IRequestMakerScheme<IParam, IResponse> = {
  url: `/assets`,
  method: "get",
  params: rt.Record({
    active: rt.Number,
    name: rt.String,
  }),
  response: rt.Record({
    data: rt.Array(rt.Record({ id: rt.Number })),
    total: rt.Number,
    sortBy: rt.String,
  }),
};

const query: IQuery = {
  url: `/assets`,
  method: "get",
  params,
  withCredentials: true,
};

const throwOnThen = () => {
  throw new Error("Was not supposed to succeed");
};

const expectErrorMessage = (message) => (error) => {
  expect(error.message).to.equal(message);
};

const expectErrorName = (name) => (error) => {
  expect(error.name).to.equal(name);
};

// function create(): RequestMaker {
//   return new RequestMaker(queryScheme);
// }

describe("RequestMaker", () => {
  describe("makeQuery", () => {
    it("Accepts correct scheme & params", () =>
      makeQuery<IParam, IResponse>(queryScheme, params).then((resultQuery) => {
        expect(resultQuery).to.deep.equal(query);
      }));

    it("Correctly makes dynamic url", () => {
      const queryScheme2: IRequestMakerScheme<IParam, IResponse> = {
        ...queryScheme,
        url: (props) => `/assets/${props.name}`,
      };

      return makeQuery<IParam, IResponse>(queryScheme2, params).then((query) => {
        expect(query.url).to.equal(`/assets/ivan`);
      });
    });
    //
    it("Throws on non-object scheme", () =>
      // @ts-ignore
      makeQuery()
        .then(throwOnThen)
        .catch(expectErrorName(errorTypes.INCORRECT_OBJECT)));

    it("Throws on empty scheme", () =>
      // @ts-ignore
      makeQuery({}, params)
        .then(throwOnThen)
        .catch(expectErrorName(errorTypes.INCORRECT_OBJECT)));

    it("Throws on absent method in scheme", () =>
      // @ts-ignore
      makeQuery({ url: "123" }, params)
        .then(throwOnThen)
        .catch(expectErrorName(errorTypes.INCORRECT_OBJECT)));

    it("Throws on absent url or dynamic url in scheme", () =>
      // @ts-ignore
      makeQuery({ method: "get" }, params)
        .then(throwOnThen)
        .catch(expectErrorMessage(`URL not valid`)));

    it("Throws on non-object params", () =>
      // @ts-ignore
      makeQuery({ url: "/123", method: "get" }, 123)
        .then(throwOnThen)
        .catch(expectErrorMessage("Params not valid")));
  });
  describe("validatingParams", () => {
    it("Throws on absent scheme.params & query.params when params valid", () =>
      validatingParams(queryScheme)(query).then((result) => expect(result).to.deep.equal(query)));

    it("Throws on absent scheme.params & query.params when params exist", () => {
      const queryScheme2: IRequestMakerScheme<IParam, IResponse> = {
        ...queryScheme,
      };

      delete queryScheme2.params;

      const query2: IQuery = {
        ...query,
      };

      delete query2.params;

      return validatingParams(queryScheme2)(query2).then((result) =>
        expect(result).to.deep.equal(query2),
      );
    });

    it("Throws on absent scheme.params when params exist", () => {
      const queryScheme2: IRequestMakerScheme<IParam, IResponse> = {
        ...queryScheme,
      };

      delete queryScheme2.params;
      return validatingParams(queryScheme2)(query)
        .then(throwOnThen)
        .catch(expectErrorMessage(`scheme.params is empty`));
    });

    it("Throws on absent query.params when params exist", () => {
      const query2: IQuery = {
        ...query,
      };

      delete query2.params;

      return validatingParams(queryScheme)(query2)
        .then(throwOnThen)
        .catch(expectErrorMessage(`query.params is empty`));
    });

    it("Throws on absent scheme.params when params not Runtype", () => {
      const queryScheme2: IRequestMakerScheme<IParam, IResponse> = {
        ...queryScheme,
      };

      // @ts-ignore
      queryScheme2.params = {};

      return validatingParams(queryScheme2)(query)
        .then(throwOnThen)
        .catch(expectErrorMessage(`scheme.params is not Runtype`));
    });

    it("Throws on not suitable param", () => {
      const query2: IQuery = {
        ...query,
      };

      query2.params.name = 123;

      return validatingParams(queryScheme)(query)
        .then(throwOnThen)
        .catch(expectErrorMessage(`Expected string, but was number`));
    });
  });

  describe("validatingResponse", () => {
    it("Throws on absent scheme.params & query.params when params valid", () =>
      validatingResponse(queryScheme)(respons).then((result) =>
        expect(result).to.deep.equal(respons),
      ));

    it("Throws on absent scheme.response when params exist", () => {
      const queryScheme2: IRequestMakerScheme<IParam, IResponse> = {
        ...queryScheme,
      };

      delete queryScheme2.response;
      return validatingResponse(queryScheme2)(respons)
        .then(throwOnThen)
        .catch(expectErrorMessage(`scheme.response is empty`));
    });

    it("Throws on absent query.response when params exist", () => {
      // @ts-ignore
      return validatingResponse(queryScheme)()
        .then(throwOnThen)
        .catch(expectErrorName(errorTypes.INCORRECT_OBJECT));
    });

    it("Throws on absent scheme.response when params not Runtype", () => {
      const queryScheme2: IRequestMakerScheme<IParam, IResponse> = {
        ...queryScheme,
      };

      // @ts-ignore
      queryScheme2.response = {};

      return validatingResponse(queryScheme2)(respons)
        .then(throwOnThen)
        .catch(expectErrorMessage(`scheme.response is not Runtype`));
    });

    it("Throws on not suitable response", () => {
      const response2: IResponse = {
        ...respons,
      };

      // @ts-ignore
      response2.data = 123;

      return validatingResponse(queryScheme)(response2)
        .then(throwOnThen)
        .catch(expectErrorName(errorTypes.INCORRECT_OBJECT));
    });
  });
});
