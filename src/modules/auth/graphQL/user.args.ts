import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { genderType } from "./user.type";

export const getUserArgs = {
  _id: { type: new GraphQLNonNull(GraphQLInt) },
};

export const createUserArgs = {
  _id: { type: GraphQLID },
  name: { type: GraphQLString },
  gender: { type: genderType },
  
}
