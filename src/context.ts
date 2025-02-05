import {PrismaClient} from "@prisma/client";

export type DataSourceContext = {
    dataSources: {
        db: PrismaClient;
    };
};
