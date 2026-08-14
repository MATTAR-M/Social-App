import { GraphQLEnumType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { AppError } from "../../../common/utils/globalErrorHandling";
import { genderType, userType } from "./user.type";
import { createUserArgs, getUserArgs } from "./user.args";
import userService from "../user.service";
import { authenticationGQL } from "../../../common/middleware/authentication";
import { authorization } from "../../../common/middleware/authorization";
import { ValidationGQL } from "../../../common/middleware/validation";
import { getUserSchema } from "../user.validation";




const users = [
    { id: "1", name: "John Doe", gender: "male" },
    { id: "2", name: "Jane Smith", gender: "female" },
    { id: "3", name: "Alice Johnson", gender: "female" },
]

export class userFileds {

    constructor() { }
    query = ()=>{
        return {
            getUsers: {
                    type: userType,
                    args:getUserArgs,
                    resolve:(parent:any, args:any,context:any) => {
                        raw:context.req.raw
                        headers:context.req.headers
                        return userService.getUser(args);
                    }
                },
                listUsers: {
                    type: new GraphQLList(userType),
                    resolve: async (parent:any, args:any,context:any) => {
                    // const {user,decoded} = await authenticationGQL(context.req.headers.authorization);
                        return userService.getUsers();

                    }
            },
            getUser: {
                type: userType,
                args:{token:{ type: new GraphQLNonNull(GraphQLString) }},
                 resolve:async (parent:any, args:any,context:any) => {
                        // raw:context.req.raw
                        // headers:context.req.headers
                        await ValidationGQL(getUserSchema, args);
                        const {user,decoded} = await authenticationGQL(args.token);
                        await authorization(["admin","user"],user.role)
                        return userService.getUser(user._id);
                    }
            }
        }
    }
    mutation = ()=>{
        return{
    
            createUser: {
            type: new GraphQLList(userType),
            args:createUserArgs,
            resolve: (parent:any, args:any) => {
                const { id, name, gender } = args;
                const userExists = users.find(user => user.id === id);
                if (userExists) {
                    throw new AppError(`User with id ${id} already exists.`);
                }
                users.push({ id, name, gender });
                return users;
            }
        }
        }
    }
}
export default new userFileds();