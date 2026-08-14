import { GraphQLEnumType, GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";

export let genderType = new GraphQLEnumType({
  name: "Gender",
  values: {
    MALE: { value: "male" },
    FEMALE: { value: "female" },
  },
});
export let userType = new GraphQLObjectType({
  name: "User",
  fields: {
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    gender: { type: genderType },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    profileImage: { type: GraphQLString },
  },
});
