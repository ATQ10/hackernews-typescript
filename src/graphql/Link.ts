import { parseValue } from "graphql";
import { NexusGenObjects } from "../../nexus-typegen";  
import { extendType, nonNull, objectType, stringArg, intArg, inputObjectType, enumType, arg, list } from "nexus";
import { Prisma } from "@prisma/client"

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", { type: Sort });
        t.field("url", { type: Sort });
        t.field("createdAt", { type: Sort });
    },
});

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});
export const Link = objectType({
    name: "Link", // <- Name of your type
    definition(t) {
        t.nonNull.int("id"); 
        t.nonNull.string("description"); 
        t.nonNull.string("url"); 
        t.nonNull.dateTime("createdAt");  // 1
        t.field("postedBy", {   // 1
            type: "User",
            resolve(parent, args, context) {  // 2
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        
        });
        
        
        t.nonNull.list.nonNull.field("voters", {  // 1
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .voters();
            }
        }) 
    },
});
/*
let links: NexusGenObjects["Link"][]= [   // 1
    {
        id: 1,
        url: "www.howtographql.com",
        description: "Fullstack tutorial for GraphQL",
    },
    {
        id: 2,
        url: "graphql.org",
        description: "GraphQL official website",
    },
];
*/
export const LinkQuery = extendType({  // 2
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", {   // 3
            type: "Feed",
            args: {
                filter: stringArg(),   // 1  
                skip: intArg(),   // 1
                take: intArg(),   // 1 
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),  // 1
            },
            async  resolve(parent, args, context) {
                const where = args.filter   // 2
                    ? {
                          OR: [
                              { description: { contains: args.filter } },
                              { url: { contains: args.filter } },
                          ],
                      }
                    : {};
                    const links = await context.prisma.link.findMany({  
                        where,
                        skip: args?.skip as number | undefined,
                        take: args?.take as number | undefined,
                        orderBy: args?.orderBy as
                            | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
                            | undefined,
                    });
    
                    const count = await context.prisma.link.count({ where });  // 2
    
                    return {  // 3
                        links,
                        count,
                    };
            },
        })
        /*
        t.field("link", {  // 2
            type: "Link",  
            args: {   // 3
                id: nonNull(idArg()),
            },
            resolve(parent, args, context, info) {    
                const { id } = args;  // 4
                var linkRet = {
                    id: 0,
                    description: "no encontrado",
                    url: "",
                };
                links.forEach(function (link) {
                    if (id == link.id.toString(10)) {
                        linkRet = link;
                    }
                  }); 
                //console.log(linkRet);
                return linkRet;
            },
        })
        */
    },
});

export const LinkMutation = extendType({  // 1
    type: "Mutation",    
    definition(t) {
        t.nonNull.field("post", {  // 2
            type: "Link",  
            args: {   // 3
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            
            resolve(parent, args, context) {  
                /*  
                const { description, url } = args;  // 4
                
                let idCount = links.length + 1;  // 5
                const link = {
                    id: idCount,
                    description: description,
                    url: url
                };
                links.push(link);
                return link;
                */
                /*
                const newLink = context.prisma.link.create({   // 2
                    data: {
                        description: args.description,
                        url: args.url,
                    },
                });
                return newLink;
                */
                const { description, url } = args;
                const { userId } = context;

                if (!userId) {  // 1
                    throw new Error("Cannot post without logging in.");
                }

                const newLink = context.prisma.link.create({
                    data: {
                        description,
                        url,
                        postedBy: { connect: { id: userId } },  // 2
                    },
                });

                return newLink;
            },
        })
        /*
        t.field("updateLink", {  // 2
            type: "Link",  
            args: {   // 3
                id: nonNull(idArg()),
                url: nonNull(stringArg()),
                description: nonNull(stringArg()),
            },
            resolve(parent, args, context) {    
                const { id, description, url } = args;  // 4
                var linkresp: NexusGenObjects["Link"][]= [];
                const linkUpdate = {
                    id: parseInt(id),
                    description: description,
                    url: url,
                };
                links.forEach(function (link) {
                    if (id == link.id.toString(10)) {
                        linkresp.push(linkUpdate);
                    }else{
                        linkresp.push(link);
                    }
                  }); 
                return linkUpdate;
            },
        })
        t.field("deleteLink", {  // 2
            type: "Link",  
            args: {   // 3
                id: nonNull(idArg())
            },
            resolve(parent, args, context) {    
                const { id } = args;  // 4
                var linkresp: NexusGenObjects["Link"][]= [];
                var linkDelete = {
                    id: parseInt(id),
                    description: "",
                    url: "",
                };
                links.forEach(function (link) {
                    if (id == link.id.toString(10)) {
                        linkDelete=link;
                    }else{
                        linkresp.push(link);
                    }
                  }); 
                  links=linkresp;
                return linkDelete;
            },
        })*/
    },
});

export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links", { type: Link }); // 1
        t.nonNull.int("count"); // 2
    },
});