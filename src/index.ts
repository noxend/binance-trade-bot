import mongodb from "./services/mongodb";

mongodb.connect().then(() => {
  console.info("MongoDB has beed connected");
});
