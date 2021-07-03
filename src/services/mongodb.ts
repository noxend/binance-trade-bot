import { mongo } from "mongoose";

import config from "../config";

if (!config.MONGO_URI) throw new Error("");

const mongodbClient = new mongo.MongoClient(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useFindAndModify: false,
  // useCreateIndex: true,
});

export default mongodbClient;
