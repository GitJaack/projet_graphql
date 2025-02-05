import {PrismaClient} from "@prisma/client";
import {AuthenticatedUser} from "./auth.js";

export type DataSourceContext = {
    dataSources: {
        db: PrismaClient;
    };
    user: AuthenticatedUser | null;
};
