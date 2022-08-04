import express from "express";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import viewsRouter from "./routes/views.router.js";
import { Server } from "socket.io";
import Contenedor from "./managers/product.manager.js";
import UserManager from "./managers/user.manager.js";

const PORT = process.env.PORT || 8080;
const app = express();
const server = app.listen(PORT, () => console.log("Listening on PORT"));
const io = new Server(server); 
const container = new Contenedor();
const userManager = new UserManager();

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/public"));

app.use("/", viewsRouter);

io.on("connection", async (socket) => {
  console.log("socket connected");
  let products = await container.getAll();
  let chatLog = await userManager.getAllUsers();
  io.emit("updateProductList", products);
  io.emit("log", chatLog);

  //  
  socket.on("message", async (data) => {
    await userManager.save(data);
    let chatLog = await userManager.getAllUsers();
    io.emit("log", chatLog);
  });

  // 
  socket.on("addNewProduct", async (newProduct) => {
    await container.save(newProduct);
    let allProducts = await container.getAll();
    io.emit("updateProductList", allProducts);
  });
});
