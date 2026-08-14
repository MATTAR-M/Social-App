import { GraphQLObjectType, GraphQLSchema} from "graphql";
import userFileds from "../auth/graphQL/user.fileds";

export const gQL_schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "query",
    description: "the root query",
    fields: {
      ...userFileds.query(),
    },
  }
  ),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    description: "the root mutation",
    fields: {
        ...userFileds.mutation(),
    }
})
})