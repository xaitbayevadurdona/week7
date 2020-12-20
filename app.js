export default (express, bodyParser, createReadStream, crypto, http, mongo) => {
  const app = express();
  const author = "xaitbayevadurdona";

  const parseUrlEncodedBody = bodyParser.urlencoded({ extended: false });

  app
    .use(parseUrlEncodedBody)
    .use((req, res, next) => {
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS"
      );

      next();
    })
    .get("/login/", (req, res) => {
      res.send(author);
    })
    .get("/code/", (req, res) => {
      let filePath = import.meta.url.replace(/^file:\/+/, "");

      if (!filePath.includes(":")) {
        filePath = `/${filePath}`;
      }

      createReadStream(filePath).pipe(res);
    })
    .get("/sha1/:input", ({ params }, res) => {
      const { input } = params;

      const hash = crypto.createHash("sha1").update(input).digest("hex");

      res.send(hash);
    })
    .get("/req/", ({ query }, res) => {
      const { addr } = query;

      http.get(addr, (httpRes) => {
        httpRes.setEncoding("utf8");

        let data = "";

        httpRes.on("data", (chunk) => {
          data += chunk;
        });

        httpRes.on("end", () => {
          res.send(data);
        });
      });
    })
    .post("/req/", ({ body }, res) => {
      const { addr } = body;

      http.get(addr, (httpRes) => {
        httpRes.setEncoding("utf8");

        let data = "";

        httpRes.on("data", (chunk) => {
          data += chunk;
        });

        httpRes.on("end", () => {
          res.send(data);
        });
      });
    })
    .post("/insert/", async ({ body }, res) => {
      const { login, password, URL } = body;

      const UserSchema = mongo.Schema({
        login: String,
        password: String,
      });

      const User = mongo.model("User", UserSchema);

      const connection = await mongo.connect(URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const user = new User({ login, password });

      user.save((e) => {
        connection.disconnect();

        if (e) {
          return res.send(e.message);
        }

        return res.send(user);
      });
    })
    .all("*", (req, res) => {
      res.send(author);
    });

  return app;
};
